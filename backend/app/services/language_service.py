import re
import json
import google.generativeai as genai
from app.config.settings import settings

class LanguageService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    def detect_language(self, text: str) -> str:
        # Check for Devanagari script for quick Hindi detection
        if re.search(r'[\u0900-\u097F]', text):
            return "Hindi"
            
        if self.model:
            try:
                prompt = f"Detect the primary language of this text. Return ONLY the language name (e.g. English, Hindi): '{text}'"
                response = self.model.generate_content(prompt)
                lang = response.text.strip()
                if "hindi" in lang.lower():
                    return "Hindi"
            except Exception:
                pass
                
        return "English"

    def translate_to_english(self, text: str) -> str:
        if not self.model:
            return text
            
        try:
            prompt = f"Translate the following text to English. Preserve any technical terms, product names, or standards unchanged. Text: '{text}'"
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return text

    def translate_from_english(self, text: str, target_language: str) -> str:
        if not self.model or target_language.lower() == "english":
            return text
            
        try:
            # If the input looks like JSON, we request JSON output
            is_json = text.strip().startswith('{')
            
            prompt = f"""Translate the following text to {target_language}.
CRITICAL INSTRUCTIONS:
- Do NOT translate or modify the following technical terms and identifiers:
  - IS 302-2-15 (or any IS codes)
  - Scheme-I (or any Scheme numbers)
  - CM/L Number
  - QCO
  - BIS
  - ISI Mark
- Keep technical product identifiers or standard numbers unchanged.
"""
            if is_json:
                prompt += "- The input is a JSON object. Translate ONLY the string values. Do NOT translate JSON keys.\n"
                
            prompt += f"\nText to translate:\n{text}"
            
            if is_json:
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
            else:
                response = self.model.generate_content(prompt)
                
            return response.text.strip()
        except Exception as e:
            print(f"Translation error: {e}")
            return text
