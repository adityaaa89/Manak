from typing import Dict, Any, List

class QueryIntentService:
    def detect_intent(self, query: str) -> Dict[str, Any]:
        q = query.lower()
        categories = []
        
        intent = "General"
        
        # Certification queries
        if any(kw in q for kw in ["licence", "certification", "apply", "isi mark"]):
            categories.append("Certification")
            intent = "Certification"
            
        # QCO queries
        if any(kw in q for kw in ["mandatory", "compulsory", "required", "qco"]):
            categories.append("QCO")
            intent = "QCO" if intent == "General" else intent
            
        # Testing queries
        if any(kw in q for kw in ["test", "laboratory", "sample"]):
            categories.append("Testing")
            intent = "Testing" if intent == "General" else intent
            
        # Standard queries
        if any(kw in q for kw in ["is ", "is-", "standard", "clause"]):
            categories.append("Standard")
            intent = "Standard" if intent == "General" else intent
            
        return {
            "intent": intent,
            "categories": categories
        }
