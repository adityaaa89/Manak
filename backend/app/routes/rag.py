from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from app.database.database import get_db
from app.services.retrieval_service import RetrievalService
from app.services.llm_service import LLMService

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

class ChatQueryRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    language: Optional[str] = "English"
    mode: Optional[str] = "technical"
    context_standard: Optional[str] = None

class SourceExcerpt(BaseModel):
    document: str
    categories: List[str] = ["General"]
    source_type: Optional[str] = "Other"
    clause: str
    page: str
    excerpt: str

class ChatQueryResponse(BaseModel):
    answer: Any
    confidence: str
    intent: Optional[str] = None
    detected_product: Optional[str] = None
    standard: Optional[str] = None
    qco_status: Optional[str] = None
    certification_scheme: Optional[str] = None
    sources: List[SourceExcerpt]
    explanation: Optional[Dict[str, Any]] = None
    language_detected: Optional[str] = None
    response_language: Optional[str] = None

@router.post("/query", response_model=ChatQueryResponse)
def handle_chat_query(request: ChatQueryRequest, db: Session = Depends(get_db)):
    """
    BIS Evidence Assistant API for generating grounded RAG answers.
    """
    try:
        from app.services.conversation_memory import ConversationMemoryService
        from app.services.language_service import LanguageService
        
        lang_svc = LanguageService()
        detected_lang = lang_svc.detect_language(request.query)
        is_hindi = (detected_lang == "Hindi")
        
        # 0. Context augmentation
        augmented_query = ConversationMemoryService.augment_query(request.conversation_id, request.query)
        
        if is_hindi:
            augmented_query = lang_svc.translate_to_english(augmented_query)
        
        # 1. Retrieve relevant chunks and structured evidence
        retrieval_service = RetrievalService(db)
        search_query = augmented_query
        if request.context_standard:
            search_query += f" (Filter context: {request.context_standard})"
            
        retrieval_results = retrieval_service.search_chunks(search_query, top_k=3)
        if "error" in retrieval_results:
            return ChatQueryResponse(
                answer=retrieval_results["error"],
                confidence="High",
                intent=retrieval_results.get("intent", {}).get("intent", "General"),
                detected_product=retrieval_results.get("detected_product"),
                sources=[],
                explanation={"decision": "Filtered out unrelated product", "reason": retrieval_results["error"]}
            )
            
        retrieved_chunks = retrieval_results.get("chunks", [])
        intent_data = retrieval_results.get("intent", {})
        structured_evidence = retrieval_results.get("structured_evidence", {})
        
        # 2. Map chunks to standard format for LLM Service
        context_chunks = []
        sources = []
        retrieved_doc_titles = []
        for chunk in retrieved_chunks:
            if chunk["document"] not in retrieved_doc_titles:
                retrieved_doc_titles.append(chunk["document"])
                
            context_chunks.append({
                "document": chunk["document"],
                "clause": chunk["clause"],
                "page": chunk["page"],
                "text": chunk["text"],
                "categories": chunk.get("categories", ["General"]),
                "source_type": chunk.get("source_type", "Other")
            })
            sources.append(SourceExcerpt(
                document=chunk["document"],
                categories=chunk.get("categories", ["General"]),
                source_type=chunk.get("source_type", "Other"),
                clause=chunk["clause"],
                page=str(chunk["page"]),
                excerpt=chunk["text"][:100] + "..." # Snippet
            ))
            
        # 3. Generate Answer via Gemini (or Mock)
        llm_service = LLMService()
        llm_response = llm_service.generate_answer(
            query=request.query,
            context_chunks=context_chunks,
            structured_evidence=structured_evidence,
            language="English", # always generate in English first
            mode=request.mode or "technical"
        )
        
        if is_hindi:
            import json
            resp_str = json.dumps(llm_response)
            translated_str = lang_svc.translate_from_english(resp_str, "Hindi")
            try:
                llm_response = json.loads(translated_str)
            except Exception:
                pass # fallback to English if translation breaks JSON parsing
        
        # Extract metadata from structured evidence
        product_info = structured_evidence.get("product_info", {})
        qco_info = structured_evidence.get("qco_info", {})
        cert_info = structured_evidence.get("certification_info", {})
        
        detected_product = product_info.get("product_name")
        standard = qco_info.get("standard_number") or cert_info.get("standard_number")
        qco_status = qco_info.get("qco_status")
        certification_scheme = cert_info.get("certification_scheme")
        
        # Update conversation context
        if request.conversation_id:
            ConversationMemoryService.update_conversation(
                request.conversation_id,
                request.query,
                product=detected_product,
                standard=standard,
                intent=intent_data.get("intent", "General")
            )
            
        from app.services.explanation_service import ExplanationService
        explanation = ExplanationService.generate_explanation(
            decision=f"Answered query on {detected_product or 'general compliance'}",
            confidence="High",
            structured_evidence=structured_evidence
        )

            
        # 4. Construct Final Response
        return ChatQueryResponse(
            answer=llm_response,
            confidence="High", # or derive from LLM if you keep confidence in schema
            intent=intent_data.get("intent", "General"),
            detected_product=detected_product,
            standard=standard,
            qco_status=qco_status,
            certification_scheme=certification_scheme,
            sources=sources,
            explanation=explanation,
            language_detected=detected_lang,
            response_language=detected_lang
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Pipeline Error: {str(e)}")
