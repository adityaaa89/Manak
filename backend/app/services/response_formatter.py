from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ComplianceStatus(BaseModel):
    certification_required: str
    qco_status: str

class CertificationStep(BaseModel):
    step_number: int
    step_title: str

class StructuredResponse(BaseModel):
    direct_answer: str
    compliance_status: Optional[ComplianceStatus] = None
    applicable_standard: Optional[str] = None
    certification_path: Optional[List[CertificationStep]] = None
    required_documents: Optional[List[str]] = None
    testing_requirements: Optional[List[str]] = None
    recommended_laboratories: Optional[List[str]] = None
    sources: List[str]

class ResponseFormatterService:
    @staticmethod
    def get_prompt_instructions() -> str:
        return """
Your response MUST strictly adhere to the following JSON structure:

{
  "direct_answer": "A short, direct answer to the user question.",
  "compliance_status": {
    "certification_required": "YES or NO",
    "qco_status": "e.g., Mandatory or Voluntary"
  },
  "applicable_standard": "e.g., IS 302-2-15:2025",
  "certification_path": [
    {"step_number": 1, "step_title": "Identify Standard"},
    {"step_number": 2, "step_title": "Testing"}
  ],
  "required_documents": ["List", "of", "documents"],
  "testing_requirements": ["List", "of", "tests"],
  "recommended_laboratories": ["List", "of", "labs"],
  "sources": ["List of cited sources, documents, pages, and clauses"]
}

If any section is not applicable or evidence is missing, return null or an empty list for that section, but always return a "direct_answer" and "sources".
"""
