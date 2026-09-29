from typing import Dict, Any, List
import datetime

class ConversationMemoryService:
    # In-memory store for simplicity, can be moved to DB later
    _store: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def get_conversation(cls, conversation_id: str) -> Dict[str, Any]:
        if not conversation_id:
            return {}
            
        if conversation_id not in cls._store:
            cls._store[conversation_id] = {
                "conversation_id": conversation_id,
                "user_query_history": [],
                "detected_product": None,
                "detected_standard": None,
                "previous_intents": [],
                "created_at": datetime.datetime.now().isoformat()
            }
        return cls._store[conversation_id]
        
    @classmethod
    def update_conversation(
        cls, 
        conversation_id: str, 
        query: str, 
        product: str = None, 
        standard: str = None, 
        intent: str = None
    ):
        if not conversation_id:
            return
            
        conv = cls.get_conversation(conversation_id)
        conv["user_query_history"].append(query)
        
        if product and product != "Unknown":
            conv["detected_product"] = product
        if standard and standard != "Unknown":
            conv["detected_standard"] = standard
        if intent and intent != "General":
            conv["previous_intents"].append(intent)

    @classmethod
    def augment_query(cls, conversation_id: str, current_query: str) -> str:
        """
        Enhance the current query with previous context if available.
        """
        if not conversation_id:
            return current_query
            
        conv = cls.get_conversation(conversation_id)
        
        context_parts = []
        if conv.get("detected_product"):
            context_parts.append(f"for {conv['detected_product']}")
            
        if conv.get("detected_standard"):
            context_parts.append(f"under standard {conv['detected_standard']}")
            
        if context_parts:
            # simple heuristic to append context if the query is short or doesn't mention the product
            # For simplicity, we just append it if not already in the query
            product_name = conv.get("detected_product", "").lower()
            if product_name and product_name not in current_query.lower():
                return f"{current_query} {' '.join(context_parts)} BIS certification"
                
        return current_query
