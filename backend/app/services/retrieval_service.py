from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.all_models import Document, DocumentChunk
from app.services.embedding_service import EmbeddingService
import numpy as np
from app.config.settings import settings

def cosine_similarity(v1, v2):
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(dot_product / (norm_v1 * norm_v2))

class RetrievalService:
    def __init__(self, db: Session):
        self.db = db
        provider = "gemini" if settings.GEMINI_API_KEY else "mock"
        self.embedding_service = EmbeddingService(provider=provider)

    def detect_query_intent(self, query: str) -> List[str]:
        q = query.lower()
        detected = []
        
        if any(kw in q for kw in ["licence", "apply", "registration", "certification", "approval", "procedure"]):
            detected.append("Certification")
            
        if any(kw in q for kw in ["test", "testing", "inspection", "equipment", "laboratory"]):
            detected.append("Testing")
            
        if any(kw in q for kw in ["mandatory", "compulsory", "qco", "required by government"]):
            detected.append("QCO")
            
        if any(kw in q for kw in ["fake mark", "verify", "hallmark", "huid"]):
            detected.append("Hallmarking")
            
        if any(kw in q for kw in ["standard", "electric kettle", "is "]):
            detected.append("Standard")
            
        return detected

    def detect_product_entity(self, query: str) -> str | None:
        q = query.lower()
        product_mappings = {
            "microwave": "Microwave Oven",
            "microwave oven": "Microwave Oven",
            "otg": "Microwave Oven",
            "oven": "Microwave Oven",
            "electric oven": "Electric Oven",
            "kettle": "Electric Kettle",
            "electric kettle": "Electric Kettle",
            "helmet": "Helmet",
            "two wheeler helmet": "Helmet",
            "pressure cooker": "Pressure Cooker",
            "cooker": "Pressure Cooker",
            "led bulb": "LED Bulb",
            "bulb": "LED Bulb",
            "lamp": "LED Bulb",
            "drinking water": "Packaged Drinking Water",
            "water bottle": "Packaged Drinking Water",
            "water": "Packaged Drinking Water"
        }
        
        for kw in sorted(product_mappings.keys(), key=len, reverse=True):
            if kw in q:
                return product_mappings[kw]
                
        return None

    def search_chunks(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Retrieves the most relevant BIS document chunks and structured data.
        """
        from app.services.query_intent_service import QueryIntentService
        from app.services.structured_retrieval_service import StructuredRetrievalService

        intent_service = QueryIntentService()
        structured_service = StructuredRetrievalService()

        # 1. Intent Detection
        intent_data = intent_service.detect_intent(query)
        detected_categories = intent_data.get("categories", [])
        
        # 2. Structured Data Search
        structured_evidence = structured_service.get_structured_evidence(query)
        
        # Extract keywords from structured evidence to match chunks
        structured_keywords = set()
        product_info = structured_evidence.get("product_info", {})
        if product_info:
            structured_keywords.add(product_info.get("product_name", "").lower())
            for std in product_info.get("applicable_standards", []):
                structured_keywords.add(std.get("standard_number", "").lower())
                
        qco_info = structured_evidence.get("qco_info", {})
        if qco_info:
            structured_keywords.add(qco_info.get("qco_document", "").lower())
            
        cert_info = structured_evidence.get("certification_info", {})
        if cert_info:
            for doc in cert_info.get("certification_documents", []):
                structured_keywords.add(doc.lower())

        # 3. Generate Query Embedding
        query_vector = self.embedding_service.generate_query_embedding(query)
        
        # 4. Product Entity Detection (Strict Layer)
        detected_product = self.detect_product_entity(query)
        
        # 5. Fetch all chunks
        query_obj = self.db.query(DocumentChunk).join(Document)
        
        if detected_product:
            query_obj = query_obj.filter(
                (Document.product.ilike(f"%{detected_product}%")) |
                (DocumentChunk.product.ilike(f"%{detected_product}%")) |
                (Document.title.ilike(f"%{detected_product}%"))
            )
            
        chunks = query_obj.all()
        
        if detected_product and not chunks:
            return {
                "chunks": [],
                "intent": intent_data,
                "structured_evidence": structured_evidence,
                "error": "No compliance data available for this product in current knowledge base.",
                "detected_product": detected_product
            }
            
        query_words = set(query.lower().split())
        
        results = []
        for chunk in chunks:
            # Vector Similarity (0 to 1) -> 70%
            vec_sim = 0.0
            if chunk.embedding and len(chunk.embedding) > 0 and sum(abs(x) for x in chunk.embedding) > 0 and sum(abs(x) for x in query_vector) > 0:
                vec_sim = cosine_similarity(query_vector, chunk.embedding)
            else:
                chunk_words = set(chunk.chunk_text.lower().split())
                overlap = len(query_words.intersection(chunk_words))
                vec_sim = min(0.99, overlap / (len(query_words) + 1e-5))
                
            # Structured mapping match (0 to 1) -> 20%
            struct_match = 0.0
            doc_title_lower = ""
            if chunk.document and chunk.document.title:
                doc_title_lower = chunk.document.title.lower()
                for kw in structured_keywords:
                    if kw and kw in doc_title_lower:
                        struct_match = 1.0
                        break
                        
            # Document category relevance (0 to 1) -> 10%
            cat_relevance = 0.0
            doc_categories = chunk.document.categories if chunk.document and chunk.document.categories else ["General"]
            if any(cat in detected_categories for cat in doc_categories):
                cat_relevance = 1.0
                
            # Combine scores
            final_score = (vec_sim * 0.70) + (struct_match * 0.20) + (cat_relevance * 0.10)
            
            # Optional authority bonus
            doc_source_type = chunk.document.source_type if chunk.document and chunk.document.source_type else "Other"
            if doc_source_type == "BIS Official Standard":
                final_score += 0.05
                
            if final_score > 0.15:
                doc_title = chunk.document.title if chunk.document else "Unknown Document"
                results.append({
                    "document": doc_title,
                    "categories": doc_categories,
                    "source_type": doc_source_type,
                    "clause": chunk.clause_number,
                    "page": chunk.page_number,
                    "text": chunk.chunk_text,
                    "similarity_score": round(final_score, 4)
                })
                
        # Sort by score descending
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        # Return merged results
        return {
            "chunks": results[:top_k],
            "intent": intent_data,
            "structured_evidence": structured_evidence
        }
