# cyber_backend.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
import json
from pathlib import Path
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
async def root():
    return {
        "message": "Cyber Hygiene API is running!",
        "endpoints": {
            "query": "/api/query (POST)",
            "add_knowledge": "/api/add-knowledge (POST)"
        }
    }

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to your knowledge base JSON file
DATA_FILE = "data.json"
EMBEDDINGS_FILE = "embeddings.json"

# Initialize model
model = SentenceTransformer('all-MiniLM-L6-v2')

class UserQuery(BaseModel):
    text: str

class KnowledgeItem(BaseModel):
    question: str
    answer: str

def load_knowledge_base():
    """Load questions and answers from JSON file"""
    if not Path(DATA_FILE).exists():
        return []
    
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def load_or_create_embeddings():
    """Load precomputed embeddings or create new ones"""
    knowledge = load_knowledge_base()
    
    if Path(EMBEDDINGS_FILE).exists():
        with open(EMBEDDINGS_FILE, 'r') as f:
            embeddings_data = json.load(f)
    else:
        embeddings_data = []
    
    # Check if we need to update embeddings
    if len(embeddings_data) != len(knowledge):
        print("Updating embeddings...")
        embeddings_data = []
        for item in knowledge:
            embedding = model.encode(item["question"]).tolist()
            embeddings_data.append({
                "question": item["question"],
                "answer": item["answer"],
                "embedding": embedding
            })
        
        with open(EMBEDDINGS_FILE, 'w') as f:
            json.dump(embeddings_data, f)
    
    return embeddings_data

@app.on_event("startup")
async def startup_event():
    """Preload embeddings when starting the server"""
    load_or_create_embeddings()

@app.post("/api/query")
async def handle_query(query: UserQuery):
    try:
        embeddings_data = load_or_create_embeddings()
        if not embeddings_data:
            return {"answer": "Knowledge base is currently empty."}
        
        # Encode query
        query_embedding = model.encode(query.text)
        
        # Find most similar question
        best_answer = None
        best_similarity = 0
        
        for item in embeddings_data:
            similarity = cosine_similarity(query_embedding, np.array(item["embedding"]))
            if similarity > best_similarity:
                best_similarity = similarity
                best_answer = item["answer"]
        
        # Return best match if similarity > threshold
        if best_answer and best_similarity > 0.7:
            return {"answer": best_answer}
        
        # Fallback response
        return {"answer": "I'm not sure about that. I can help with topics like password security, phishing prevention, and general online safety."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add-knowledge")
async def add_knowledge(item: KnowledgeItem):
    try:
        # Load current knowledge
        knowledge = load_knowledge_base()
        
        # Add new item
        knowledge.append({
            "question": item.question,
            "answer": item.answer
        })
        
        # Save to JSON file
        with open(DATA_FILE, 'w') as f:
            json.dump(knowledge, f, indent=2)
        
        # Recreate embeddings
        load_or_create_embeddings()
        
        return {"status": "success", "message": "Knowledge added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)