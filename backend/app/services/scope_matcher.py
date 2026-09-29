import re
from typing import Dict, Any

class ScopeMatcherService:
    def __init__(self):
        """
        Initializes the Licence Scope Matching Service.
        Future support: Initialize EmbeddingService here for vector similarity.
        """
        pass
        
    def _normalize_text(self, text: str) -> str:
        """
        Cleans and standardizes text for comparison.
        """
        if not text:
            return ""
        # Lowercase and strip punctuation/excessive whitespace
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        return " ".join(text.split())

    def _extract_keywords(self, text: str) -> set:
        """
        Extracts a set of distinct keywords from the normalized text.
        """
        words = self._normalize_text(text).split()
        # Filter out common stop words if needed; for prototype, we just use raw words
        stop_words = {"the", "a", "an", "under", "for", "with", "and", "or"}
        return set([w for w in words if w not in stop_words])

    def match_scope(self, detected_product: Dict[str, Any], licence_record: Dict[str, Any]) -> str:
        """
        Compares the detected product against the BIS licence scope string.
        Returns: 'MATCH', 'LIKELY_MATCH', 'MISMATCH', or 'UNKNOWN'
        """
        product_name = detected_product.get("product_name", "")
        product_scope = licence_record.get("product_scope", "")
        
        if not product_name or not product_scope:
            return "UNKNOWN"
            
        product_keywords = self._extract_keywords(product_name)
        scope_keywords = self._extract_keywords(product_scope)
        
        if not product_keywords or not scope_keywords:
            return "UNKNOWN"
            
        # Calculate Jaccard-like intersection over the product keywords
        # We check how many of the product's keywords exist in the broader licence scope
        matches = len(product_keywords.intersection(scope_keywords))
        total_product_words = len(product_keywords)
        
        score_percentage = (matches / total_product_words) * 100
        
        if score_percentage >= 80:
            return "MATCH"
        elif 50 <= score_percentage < 80:
            return "LIKELY_MATCH"
        else:
            return "MISMATCH"
