import asyncio
import json
from app.database.database import SessionLocal
from app.models.all_models import Document, DocumentChunk
from app.services.retrieval_service import RetrievalService
from app.services.embedding_service import EmbeddingService
from app.config.settings import settings

async def setup_test_docs(db, embedding_service):
    # Mock some documents with different categories
    docs = [
        {"title": "BIS Product Certification Scheme (V2)", "categories": ["Certification", "Standard"], "source_type": "BIS Official Standard", "text": "This document describes how a manufacturer can get BIS certification and apply for a licence."},
        {"title": "IS 302-2-15 (V2)", "categories": ["Standard"], "source_type": "BIS Official Standard", "text": "Indian Standard for electric kettle. Covers safety requirements and general tests."},
        {"title": "STI for Electric Kettle (V2)", "categories": ["Testing", "Certification", "Standard"], "source_type": "BIS Guideline", "text": "Scheme of Testing and Inspection for electric kettle tests required in laboratory."},
        {"title": "QCO on Electronics (V2)", "categories": ["QCO"], "source_type": "Other", "text": "This product certification is mandatory as per the Quality Control Order by the government."}
    ]
    
    for d in docs:
        doc = db.query(Document).filter_by(title=d["title"]).first()
        if not doc:
            doc = Document(title=d["title"], categories=d["categories"], source_type=d["source_type"], source="Test")
            db.add(doc)
            db.flush()
            
            vec = embedding_service.generate_embedding(d["text"])
            chunk = DocumentChunk(document_id=doc.id, chunk_text=d["text"], page_number=1, clause_number="1.0", embedding=vec)
            db.add(chunk)
            
    db.commit()

async def run_tests():
    db = SessionLocal()
    provider = "gemini" if settings.GEMINI_API_KEY else "mock"
    embedding_service = EmbeddingService(provider=provider)
    
    await setup_test_docs(db, embedding_service)
    
    retrieval_service = RetrievalService(db)
    
    queries = [
        "How can a manufacturer get BIS certification?",
        "What tests are required for electric kettle?",
        "Is this product certification mandatory?"
    ]
    
    results_report = []
    
    for q in queries:
        detected = retrieval_service.detect_query_intent(q)
        chunks = retrieval_service.search_chunks(q, top_k=2)
        
        results_report.append({
            "query": q,
            "detected_categories": detected,
            "top_documents": [
                {
                    "title": c["document"],
                    "categories": c["categories"],
                    "source_type": c.get("source_type", "Other"),
                    "score": c["similarity_score"]
                }
                for c in chunks
            ]
        })
        
    print(json.dumps(results_report, indent=2))
    
    with open("multiple_categories_report.json", "w") as f:
        json.dump(results_report, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run_tests())
