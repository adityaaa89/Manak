import json
from app.database.database import SessionLocal
from app.services.retrieval_service import RetrievalService

queries = [
    "What is the scope of IS 302-1?",
    "What are the general conditions for tests?",
    "What is a Class II appliance?",
    "What markings are required on appliances?"
]

def test_retrieval():
    db = SessionLocal()
    retrieval_service = RetrievalService(db)
    
    report_data = {}
    
    for query in queries:
        print(f"Testing query: {query}")
        results = retrieval_service.search_chunks(query, top_k=3)
        
        formatted_results = []
        for r in results:
            formatted_results.append({
                "document": r["document"],
                "page": r["page"],
                "clause": r["clause"],
                "similarity_score": r["similarity_score"],
                "text_snippet": r["text"][:200] + "..."
            })
            
        report_data[query] = formatted_results
        
    with open("retrieval_results.json", "w") as f:
        json.dump(report_data, f, indent=2)
        
    db.close()
    print("Done")

if __name__ == "__main__":
    test_retrieval()
