# Ami Robot Backend

> **📖 For complete setup instructions, see the [main project README](../README.md)**

This directory contains the FastAPI backend for the Ami Robot Control Center.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt



# Edit .env with your API keys

# Run server
uvicorn main:app --reload --port 8000
```

## Key Files

- **`main.py`** - FastAPI application with all API endpoints
- **`langchain.py`** - RAG system using LangChain, Cohere, and AstraDB
- **`requirements.txt`** - Python dependencies with compatible versions

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
