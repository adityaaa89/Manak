import re
from typing import Dict, List, Any

class ProductIntelligenceService:
    @staticmethod
    def analyze_product_description(description: str) -> Dict[str, Any]:
        """
        Rule-based extraction for the prototype.
        In production, this would call the LLM service.
        """
        desc_lower = description.lower()
        
        # Default mock response
        result = {
            "product_name": "Unknown Product",
            "category": "Unknown",
            "material": "Unknown",
            "usage": "Unknown",
            "missing_information": []
        }
        
        # Rule 1: Electric Kettle
        if "kettle" in desc_lower:
            result["product_name"] = "Electric Kettle"
            result["category"] = "Household Electrical Appliance"
            result["usage"] = "Domestic"
            
            if "stainless steel" in desc_lower:
                result["material"] = "Stainless Steel"
            elif "plastic" in desc_lower:
                result["material"] = "Plastic"
                
            if "voltage" not in desc_lower and "watt" not in desc_lower:
                result["missing_information"].append("Voltage rating")
                result["missing_information"].append("Power rating (Wattage)")
                
        # Rule 2: Helmet
        elif "helmet" in desc_lower:
            result["product_name"] = "Helmet"
            result["category"] = "Safety Gear"
            result["usage"] = "Outdoor"
            
            if "abs" in desc_lower or "plastic" in desc_lower:
                result["material"] = "ABS Plastic"
                
            if "two wheeler" not in desc_lower and "motorcycle" not in desc_lower:
                result["missing_information"].append("Specific vehicle type (e.g., Two wheeler)")
                
        # Rule 3: Water
        elif "water" in desc_lower and "drinking" in desc_lower:
            result["product_name"] = "Packaged Drinking Water"
            result["category"] = "Food & Beverage"
            result["material"] = "Water"
            result["usage"] = "Consumption"
            
            if "bottle" not in desc_lower and "pouch" not in desc_lower:
                result["missing_information"].append("Packaging type")
                
        else:
            result["missing_information"].append("Detailed product name")
            result["missing_information"].append("Intended application")
            result["missing_information"].append("Primary material")
            
        return result
