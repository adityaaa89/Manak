from typing import List
import google.generativeai as genai
from app.config.settings import settings

class EmbeddingService:
    def __init__(self, provider: str = "gemini"):
        """
        Initializes the embedding service.
        Supports 'gemini' with a fallback to 'mock'.
        """
        self.provider = provider
        self.api_key = settings.GEMINI_API_KEY
        
        if self.provider == "gemini":
            if not self.api_key:
                print("Warning: GEMINI_API_KEY not set. Falling back to mock embeddings.")
                self.provider = "mock"
            else:
                genai.configure(api_key=self.api_key)
        
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for a text chunk using Gemini text-embedding-004.
        """
        if self.provider == "mock":
            return self._mock_embedding(text)
        elif self.provider == "gemini":
            return self._gemini_embedding(text)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")

    def generate_document_embedding(self, text: str) -> List[float]:
        return self.generate_embedding(text)

    def generate_query_embedding(self, text: str) -> List[float]:
        return self.generate_embedding(text)
            
    def _gemini_embedding(self, text: str) -> List[float]:
        """
        Generates embedding using Google Gemini API gemini-embedding-2.
        """
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-2",
                content=text,
            )
            return result['embedding']
        except Exception as e:
            print(f"Gemini embedding failed: {e}. Falling back to mock.")
            return self._mock_embedding(text)
            
    def _mock_embedding(self, text: str) -> List[float]:
        """
        Returns a generic 768-dimensional mock vector.
        """
        return [0.0] * 768
