import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from app.config.settings import settings

class LLMService:
    def __init__(self, provider: str = None):
        self.provider = provider or settings.LLM_MODE
        self.api_key = settings.GEMINI_API_KEY
        
        if self.provider == "gemini" and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model_name = settings.GEMINI_MODEL
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None

    def _generate_mock_fallback(self, query: str, context_chunks: List[Dict[str, Any]], structured_evidence: Dict[str, Any] = None) -> Dict[str, Any]:
        if not context_chunks and not structured_evidence:
            return {
                "direct_answer": "No relevant BIS documents found to answer your query.",
                "compliance_status": None,
                "applicable_standard": None,
                "certification_path": [],
                "required_documents": [],
                "testing_requirements": [],
                "recommended_laboratories": [],
                "sources": []
            }
        
        summarized_docs = list(set([c.get("document", "Unknown") for c in context_chunks]))
        answer = f"Based on the retrieved context from {', '.join(summarized_docs)} and structured mappings, this document describes guidelines or procedures relating to your query: '{query}'. However, since we are using the Mock Generator, a detailed specific analysis is not available."
        
        # Extract structured mappings if available
        compliance_status = None
        if structured_evidence and structured_evidence.get("qco_info"):
            compliance_status = {
                "certification_required": "YES",
                "qco_status": structured_evidence["qco_info"].get("qco_status", "Unknown")
            }
            
        applicable_standard = None
        if structured_evidence and structured_evidence.get("qco_info"):
            applicable_standard = structured_evidence["qco_info"].get("standard_number")

        cert_path = []
        if structured_evidence and structured_evidence.get("certification_info"):
            cert_path = [
                {"step_number": 1, "step_title": "Identify Standard"},
                {"step_number": 2, "step_title": "Testing"},
                {"step_number": 3, "step_title": "Application"}
            ]
            
        tests = [t.get("name") for t in structured_evidence.get("testing_requirements", [])] if structured_evidence else []
        labs = [l.get("name") for l in structured_evidence.get("recommended_labs", [])] if structured_evidence else []
        
        return {
            "direct_answer": answer,
            "compliance_status": compliance_status,
            "applicable_standard": applicable_standard,
            "certification_path": cert_path,
            "required_documents": ["Application Form", "Test Reports"] if cert_path else [],
            "testing_requirements": tests,
            "recommended_laboratories": labs,
            "sources": [c.get("document") for c in context_chunks]
        }

    def generate_answer(self, query: str, context_chunks: List[Dict[str, Any]], structured_evidence: Dict[str, Any] = None, language: str = "en", mode: str = "standard") -> Dict[str, Any]:
        """
        Generate grounded answers using retrieved BIS document context and structured mappings.
        """
        if self.provider == "mock":
            print("[LLM]")
            print("MODE: Mock fallback")
            print("Reason: LLM_MODE is set to mock")
            return self._generate_mock_fallback(query, context_chunks, structured_evidence)
            
        print("[LLM]")
        print("MODE: Gemini")
        print(f"MODEL: {self.model_name}")

        # Build context string
        context_text = ""
        for i, chunk in enumerate(context_chunks):
            doc = chunk.get("document", "Unknown Document")
            clause = chunk.get("clause", "Unknown Clause")
            page = chunk.get("page", "?")
            text = chunk.get("text", "")
            context_text += f"\n--- Chunk {i+1} ---\nSource: {doc}, {clause}, Page {page}\nText: {text}\n"

        structured_text = json.dumps(structured_evidence, indent=2) if structured_evidence else "{}"

        from app.services.response_formatter import ResponseFormatterService
        formatting_instructions = ResponseFormatterService.get_prompt_instructions()

        prompt = f"""
You are BIS Compliance Assistant.
Answer only using provided evidence.
Prioritize structured compliance mappings.
Always mention source document and clause/page when available.
Never invent certification requirements.

{formatting_instructions}

Structured Mappings:
{structured_text}

Context Chunks:
{context_text}

Language requested: {language}
Query: {query}
"""

        import time
        max_retries = 2
        for attempt in range(max_retries):
            try:
                # Request JSON payload explicitly from Gemini
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                result = json.loads(response.text)
                return result
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg and attempt < max_retries - 1:
                    print(f"Rate limit hit. Retrying in 12 seconds... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(12) # Wait beyond the 10s retry delay
                    continue
                
                print("[LLM]")
                print("MODE: Mock fallback")
                print(f"Reason: API failure/Quota exceeded - {error_msg}")
                return self._generate_mock_fallback(query, context_chunks, structured_evidence)
