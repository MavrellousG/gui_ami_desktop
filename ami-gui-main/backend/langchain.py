import os
import warnings
import re
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
import cohere
from astrapy.db import AstraDB

import hashlib
from typing import List, Dict, Optional

load_dotenv()

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def setup_cohere_astra_connection():
    cohere_api_key = os.environ["COHERE_API_KEY"]
    astra_db = AstraDB(
        token=os.environ["ASTRA_DB_TOKEN"],
        api_endpoint=os.environ["ASTRA_DB_ENDPOINT"],
    )
    
    cohere_client = cohere.Client(cohere_api_key)
    
    return cohere_client, astra_db

def create_or_get_collection(database, collection_name: str = None):

    COHERE_MODEL_DIMENSION = 1024
    
    if not collection_name:
        collection_name = os.environ["ASTRA_DB_COLLECTION_NAME"]
    
    try:
        collection = database.create_collection(
            collection_name,
            dimension=COHERE_MODEL_DIMENSION
        )
        print(f"Created new collection: {collection_name}")
    except Exception as e:
        # Collection might already exist
        collection = database.collection(collection_name)
        print(f"Using existing collection: {collection_name}")
    
    return collection

def load_and_embed_website(url: str, cohere_client, collection) -> List[str]:
    import hashlib
    
    COHERE_MODEL_NAME = "embed-english-v3.0"
    COHERE_MODEL_DIMENSION = 1024
    
    loader = WebBaseLoader(url)
    loader.requests_kwargs = {'verify': False}
    
    # split text into chunks to prepare for embedding
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        strip_whitespace=True,
    )
    
    docs = loader.load_and_split(text_splitter=text_splitter)
    
    texts = [clean_text(doc.page_content) for doc in docs]
    
    # check for dupes by using a set to track existing hashes
    existing_hashes = set()
    try:
        existing_docs = collection.paginated_find({}, projection={"content_hash": 1})
        existing_hashes = {doc.get("content_hash") for doc in existing_docs if doc.get("content_hash")}
        print(f"Found {len(existing_hashes)} existing content hashes in database")
    except Exception as e:
        print(f"Could not retrieve existing hashes (probably empty collection): {e}")
    
    unique_texts = []
    unique_docs = []
    unique_hashes = []
    
    for i, text in enumerate(texts):
        # create hash
        content_hash = hashlib.md5(text.encode()).hexdigest()
        
        # check if this content is already in the database
        if content_hash not in existing_hashes:
            unique_texts.append(text)
            unique_docs.append(docs[i])
            unique_hashes.append(content_hash)
            existing_hashes.add(content_hash)
        else:
            print(f"Skipping duplicate content (hash: {content_hash[:8]}...)")
    
    if not unique_texts:
        print("No new content to embed - all content already exists in database")
        return texts  # return original texts if no new content
    
    print(f"Embedding {len(unique_texts)} unique chunks (skipped {len(texts) - len(unique_texts)} duplicates)")
    
    # generate vector embeddings
    embeddings = cohere_client.embed(
        texts=unique_texts,
        model=COHERE_MODEL_NAME,
        input_type="search_document",
        truncate="END",
    ).embeddings
    
    if len(embeddings[0]) != COHERE_MODEL_DIMENSION:
        raise ValueError("Dimension mismatch in embeddings")
    
    to_insert = []
    for doc_index, doc in enumerate(unique_docs):
        cleaned_content = clean_text(doc.page_content)
        to_insert.append({
            "page_content": cleaned_content,
            "content_hash": unique_hashes[doc_index],  # Store hash for future deduplication
            "source": url,
            "metadata": doc.metadata,
            "$vector": embeddings[doc_index]
        })
    
    # insert into AstraDB
    if to_insert:
        insert_result = collection.insert_many(to_insert)
        print(f"Inserted {len(insert_result.inserted_ids)} new unique documents from {url}")
    
    return texts


def search_similar_content(query: str, cohere_client, collection, limit: int = 5) -> List[Dict]:
    COHERE_MODEL_NAME = "embed-english-v3.0"
    
    # embed the query
    embedded_query = cohere_client.embed(
        texts=[query],
        model=COHERE_MODEL_NAME,
        input_type="search_query",
        truncate="END",
    ).embeddings[0]
    
    # search in AstraDB using vector search
    results = collection.vector_find(
        vector=embedded_query,
        limit=limit,
        include_similarity=True,
    )
    
    formatted_results = []
    for idx, result in enumerate(results):
        similarity = result.get("$similarity") or result.get("similarity") or 0.0
        
        formatted_results.append({
            "rank": idx + 1,
            "content": result["page_content"],
            "similarity": similarity,
            "source": result.get("source", "Unknown"),
            "metadata": result.get("metadata", {})
        })
    
    return formatted_results

def initialize_rag_system(url: str, collection_name: str = None):
    try:
        cohere_client, database = setup_cohere_astra_connection()
        collection = create_or_get_collection(database, collection_name)
        texts = load_and_embed_website(url, cohere_client, collection)
        
        print(f"✅ RAG system initialized successfully with {len(texts)} chunks")
        
        return cohere_client, collection
        
    except Exception as e:
        print(f"❌ Error initializing RAG system: {str(e)}")
        raise

def query_rag_system(query: str, cohere_client, collection, limit: int = 5, verbose: bool = True):
    try:
        results = search_similar_content(query, cohere_client, collection, limit)
        
        if verbose:
            print(f"\nQuery: {query}")
            print("Results:")
            for result in results:
                print(f"  - Rank {result['rank']} (similarity: {result['similarity']:.3f})")
                print(f"    Content: {result['content'][:200]}...")
                print(f"    Source: {result['source']}")
                print()
        
        return {
            "success": True,
            "content": results,
        }        
    except Exception as e:
        print(f"❌ Error querying RAG system: {str(e)}")
        raise