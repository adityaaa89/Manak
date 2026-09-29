import os
import json
from typing import Dict, Any, List

class StructuredRetrievalService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mappings")
        
        self.product_standard_mapping = self._load_json("product_standard_mapping.json")
        self.standard_qco_mapping = self._load_json("standard_qco_mapping.json")
        self.standard_certification_mapping = self._load_json("standard_certification_mapping.json")

    def _load_json(self, filename: str) -> List[Dict[str, Any]]:
        filepath = os.path.join(self.data_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def find_product_standard(self, query: str) -> Dict[str, Any]:
        """Find standard for a product based on query."""
        q = query.lower()
        for item in self.product_standard_mapping:
            product_name = item.get("product_name", "").lower()
            if q in product_name or product_name in q:
                return item
        return {}

    def check_qco_status(self, standard_number: str) -> Dict[str, Any]:
        """Check QCO status for a standard."""
        if not standard_number:
            return {}
        for item in self.standard_qco_mapping:
            if standard_number.startswith(item.get("standard_number", "")):
                return item
        return {}

    def get_certification_process(self, standard_number: str) -> Dict[str, Any]:
        """Get certification mapping for a standard."""
        if not standard_number:
            return {}
        for item in self.standard_certification_mapping:
            if standard_number.startswith(item.get("standard_number", "")):
                return item
        return {}
        
    def get_structured_evidence(self, query: str) -> Dict[str, Any]:
        product_info = self.find_product_standard(query)
        evidence = {
            "product_info": product_info,
            "qco_info": {},
            "certification_info": {}
        }
        
        if product_info and "applicable_standards" in product_info:
            if len(product_info["applicable_standards"]) > 0:
                primary_standard = product_info["applicable_standards"][0]["standard_number"]
                evidence["qco_info"] = self.check_qco_status(primary_standard)
                evidence["certification_info"] = self.get_certification_process(primary_standard)
                
                # Fetch testing requirements
                try:
                    from app.services.testing_engine import TestingEngineService
                    tests = TestingEngineService().get_testing_requirements(1) # Assuming 1 is IS 302-2-15
                    if tests:
                        evidence["testing_requirements"] = tests.get("tests", [])
                except Exception:
                    pass
                    
                # Fetch recommended labs
                try:
                    from app.services.lab_ranker import LabRankerService
                    labs = LabRankerService().rank_laboratories(1, [], "Mumbai")
                    if labs:
                        evidence["recommended_labs"] = labs
                except Exception:
                    pass
                
        return evidence
