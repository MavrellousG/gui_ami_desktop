from fastapi import FastAPI, Form, Request, Header, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
import os
from langchain import initialize_rag_system, query_rag_system, setup_cohere_astra_connection, create_or_get_collection, load_and_embed_website


API_TOKEN = "SECRET123" # replace this with your actual API token
app = FastAPI(title="Ami Robot Command API", version="1.0.0")

# enable CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL (CHANGE IF YOU REDEPLOY ELSEWHERE)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


current_command = {"action": ""}

@app.get("/")
def read_root():
    return {"message": "Ami Robot Command API is running", "status": "healthy"}

@app.post("/command")
def receive_command(action: str = Form(...)):
    print(action)
    current_command["action"] = action
    return {"message": "command received", "action": action}

@app.get("/command")
def get_command(authorization: str = Header(None)):
    if authorization != f"Bearer {API_TOKEN}":
        raise HTTPException(status_code=401, detail="invalid token")
    return {"action": current_command["action"], "timestamp": time.time()}

@app.post("/clear")
def clear_command(authorization: str = Header(None)):
    if authorization != f"Bearer {API_TOKEN}":
        raise HTTPException(status_code=401, detail="invalid token")
    current_command["action"] = ""
    return {"message": "command cleared"}

@app.post("/scrape-url")
@app.get("/scrape-url")
async def scrape_url_endpoint(request: Request, url: str = Form(None)):
    if request.method == "GET":
        url = request.query_params.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="url required")
    if not url:
        raise HTTPException(status_code=400, detail="url required")

    print(f"Loading and embedding URL via LangChain: {url}")
    try:
        cohere_client, database = setup_cohere_astra_connection()
        collection = create_or_get_collection(database)
        # load, split, embed, and store website content
        texts = load_and_embed_website(url, cohere_client, collection)
        
        if isinstance(texts, list):
            content_string = "\n\n".join(str(text) for text in texts)
        else:
            content_string = str(texts)
        
        return JSONResponse(content={"success": True, "content": content_string, "url": url})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error embedding URL: {str(e)}")

@app.post("/ask-with-context")
async def ask_with_context_endpoint(request: Request, question: str = Form(...), urls: str = Form(None)):
    print(f"Processing question with RAG context: {question}")

    try:
        cohere_client, database = setup_cohere_astra_connection()
        collection = create_or_get_collection(database)
        
        rag_context = ""
        
        if urls:
            url_list = [url.strip() for url in urls.split(',') if url.strip()]
            
            for url in url_list:
                print(f"Loading and embedding URL: {url}")
                # load, split, embed, and store website content
                texts = load_and_embed_website(url, cohere_client, collection)
                
                # query the RAG system with the user's question
                rag_response = query_rag_system(
                    query=question,
                    cohere_client=cohere_client,
                    collection=collection,
                    limit=5,
                    verbose=False
                )
                
                # extract relevant context from RAG results
                if rag_response and rag_response.get("success") and rag_response.get("content"):
                    rag_results = rag_response["content"]  # Get the actual results array
                    rag_context += f"\n--- RAG CONTEXT FROM {url} ---\n"
                    for i, result in enumerate(rag_results[:3]):  # Top 3 results
                        rag_context += f"[{i+1}] (Similarity: {result['similarity']:.3f})\n"
                        rag_context += f"{result['content'][:500]}...\n\n"

        # build enhanced command: original question + RAG context
        enhanced_command = question
        
        if rag_context:
            enhanced_command += "\n\n--- ENHANCED CONTEXT FROM LANGCHAIN RAG ---"
            enhanced_command += rag_context
        
        current_command["action"] = enhanced_command
        
        return {
            "success": True,
            "original_question": question,
            "enhanced_command": enhanced_command,
            "rag_context_found": len(rag_context) > 0,
            "message": "Question processed with RAG context"
        }
        
    except Exception as e:
        print(f"Error in ask-with-context: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing question with RAG: {str(e)}")

@app.post("/clear-collection")
async def clear_collection_endpoint(authorization: str = Header(None)):
    if authorization != f"Bearer {API_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        cohere_client, database = setup_cohere_astra_connection()
        collection_name = os.environ["ASTRA_DB_COLLECTION_NAME"]

        # attempt to delete the collection
        print(f"Connecting to AstraDB, attempting to delete collection: {collection_name}")
        try:
            database.delete_collection(collection_name)
            print(f"Deleted collection: {collection_name}")
            return {
                "success": True,
                "message": f"Collection '{collection_name}' deleted successfully",
                "collection_name": collection_name,
                "method": "delete_collection"
            }
        except Exception as delete_err:
            print(f"delete_collection failed: {delete_err}")
            # fallback: clear all documents in the collection
            try:
                coll = database.collection(collection_name)
                print(f"Attempting fallback: delete all documents in collection: {collection_name}")
                # remove all documents
                coll.delete_many({})
                print(f"Cleared all documents in collection: {collection_name}")
                return {
                    "success": True,
                    "message": f"Cleared all documents in collection '{collection_name}' via fallback",
                    "collection_name": collection_name,
                    "method": "delete_many"
                }
            except Exception as fallback_err:
                print(f"Fallback delete_many failed: {fallback_err}")
                raise HTTPException(status_code=500,
                                     detail=f"Failed to delete collection '{collection_name}': {delete_err}; fallback error: {fallback_err}")
    except Exception as e:
        print(f"Error deleting collection endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting collection: {str(e)}")