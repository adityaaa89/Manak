import json
import os
from dotenv import load_dotenv

load_dotenv()

from app.config.settings import settings
from app.database.database import SessionLocal
from app.routes.rag import handle_chat_query, ChatQueryRequest

def run_test():
    db = SessionLocal()
    req = ChatQueryRequest(query="What tests are required according to IS 302-1?")
    
    print(f"Using GEMINI_API_KEY: {'Yes' if settings.GEMINI_API_KEY else 'No'}")
    
    try:
        response = handle_chat_query(req, db)
        print("Response received:")
        print(json.dumps(response.model_dump(), indent=2))
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
