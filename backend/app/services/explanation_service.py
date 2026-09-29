from typing import Dict, Any, List
import json
from pydantic import BaseModel

class Explanation(BaseModel):
    decision: str
    confidence: str
    reasoning: List[str]

class ExplanationService:
    @staticmethod
    def generate_explanation(
        decision: str,
        confidence: str,
        structured_evidence: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates a deterministic explanation based entirely on provided structured mappings 
        to ensure zero hallucination.
        """
        reasoning = []
        
        # Parse structured evidence for reasoning points
        if product_info := structured_evidence.get("product_info"):
            product_name = product_info.get("product_name", "Unknown Product")
            reasoning.append(f"Identified product as '{product_name}' based on keyword matching.")
            
        if qco_info := structured_evidence.get("qco_info"):
            qco_status = qco_info.get("qco_status")
            standard = qco_info.get("standard_number")
            reasoning.append(f"Standard {standard} has a QCO status of '{qco_status}' according to official mappings.")
            
        if cert_info := structured_evidence.get("certification_info"):
            scheme = cert_info.get("certification_scheme")
            reasoning.append(f"The product falls under Certification Scheme: '{scheme}'.")
            
        if tests := structured_evidence.get("testing_requirements"):
            reasoning.append(f"Identified {len(tests)} mandatory testing requirements for compliance.")
            
        if not reasoning:
            reasoning.append("No structured evidence was available to form reasoning.")
            
        return {
            "decision": decision,
            "confidence": confidence,
            "reasoning": reasoning
        }
