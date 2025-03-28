from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
import json
from pathlib import Path
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to knowledge base
KNOWLEDGE_BASE = "data.json"
EMBEDDINGS_FILE = "embeddings.json"

# Initialize model
model = SentenceTransformer('all-MiniLM-L6-v2')

class UserQuery(BaseModel):
    text: str
    user_level: Optional[str] = "beginner"  # beginner, intermediate, advanced

def load_knowledge_base():
    """Load questions and answers from JSON file"""
    if not Path(KNOWLEDGE_BASE).exists():
        return []
    
    with open(KNOWLEDGE_BASE, 'r') as f:
        data = json.load(f)
        return data.get("questions", [])

def load_or_create_embeddings():
    """Load or create question embeddings"""
    knowledge = load_knowledge_base()
    
    if Path(EMBEDDINGS_FILE).exists():
        with open(EMBEDDINGS_FILE, 'r') as f:
            embeddings_data = json.load(f)
    else:
        embeddings_data = []
    
    # Update embeddings if knowledge base changed
    if len(embeddings_data) != len(knowledge):
        print("Updating embeddings...")
        embeddings_data = []
        for item in knowledge:
            embedding = model.encode(item["question"]).tolist()
            embeddings_data.append({
                "id": item["id"],
                "question": item["question"],
                "answer": item["answer"],
                "beginner_answer": item.get("beginner_answer"),
                "intermediate_answer": item.get("intermediate_answer"),
                "advanced_answer": item.get("advanced_answer"),
                "topic": item.get("topic", "general"),
                "embedding": embedding
            })
        
        with open(EMBEDDINGS_FILE, 'w') as f:
            json.dump(embeddings_data, f)
    
    return embeddings_data

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def get_level_specific_answer(item: dict, user_level: str) -> str:
    """Get the appropriate answer based on user level"""
    if user_level == "advanced" and item.get("advanced_answer"):
        return item["advanced_answer"]
    elif user_level == "intermediate" and item.get("intermediate_answer"):
        return item["intermediate_answer"]
    elif user_level == "beginner" and item.get("beginner_answer"):
        return item["beginner_answer"]
    return item["answer"]

def get_level_specific_fallback(user_level: str) -> str:
    """Get level-specific fallback response"""
    fallbacks = {
        "beginner": "I'm not sure about that. I can help with basic online safety topics like creating strong passwords and spotting suspicious emails.",
        "intermediate": "I'm not certain about that question. I can assist with topics like network security, phishing prevention, and secure browsing.",
        "advanced": "That question is outside my current knowledge base. I specialize in technical cybersecurity topics like encryption, penetration testing, and advanced threat mitigation."
    }
    return fallbacks.get(user_level, fallbacks["beginner"])

@app.on_event("startup")
async def startup_event():
    """Preload embeddings when starting the server"""
    load_or_create_embeddings()

@app.post("/api/query")
async def handle_query(query: UserQuery):
    try:
        embeddings_data = load_or_create_embeddings()
        if not embeddings_data:
            return {"answer": "Knowledge base is currently empty.", "topic": "general"}
        
        # Encode query
        query_embedding = model.encode(query.text)
        
        best_item = None
        best_similarity = 0
        
        for item in embeddings_data:
            similarity = cosine_similarity(query_embedding, np.array(item["embedding"]))
            if similarity > best_similarity:
                best_similarity = similarity
                best_item = item
        
        # Return best match if similarity > threshold
        if best_item and best_similarity > 0.7:
            return {
                "answer": get_level_specific_answer(best_item, query.user_level),
                "topic": best_item.get("topic", "general"),
                "similarity": float(best_similarity),
                "question_id": best_item.get("id")
            }
        
        # Fallback response
        return {
            "answer": get_level_specific_fallback(query.user_level),
            "topic": "general",
            "similarity": 0
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)