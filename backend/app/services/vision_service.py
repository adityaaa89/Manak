import re
from typing import Dict, Any, List
import numpy as np

try:
    import cv2
    import pytesseract
    VISION_AVAILABLE = True
except ImportError:
    VISION_AVAILABLE = False

class VisionService:
    def __init__(self):
        """
        Initializes the vision service pipeline.
        Designed for OpenCV and Tesseract, ready to scale to AI vision endpoints.
        """
        pass

    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Improves OCR accuracy through cv2 operations:
        - Resize image
        - Convert to grayscale
        - Apply thresholding
        - Noise reduction
        """
        if not VISION_AVAILABLE:
            # Fallback mock return if libraries not installed
            return np.array([])
            
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Invalid image file.")
                
            # Resize image (scaling up by 2x often helps OCR readability)
            img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding
            _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Noise reduction (Median blur)
            clean_img = cv2.medianBlur(thresh, 3)
            
            return clean_img
        except Exception as e:
            raise ValueError(f"Image preprocessing failed: {str(e)}")

    def extract_text_from_image(self, image_bytes: bytes) -> Dict[str, str]:
        """
        Executes OCR Text Extraction.
        """
        if not VISION_AVAILABLE:
            return {"ocr_text": "ISI Mark CM/L-1000000 IS 302 (Mock Extraction)"}
            
        try:
            preprocessed_img = self.preprocess_image(image_bytes)
            
            if preprocessed_img.size == 0:
                return {"ocr_text": ""}
                
            # Execute pytesseract OCR
            text = pytesseract.image_to_string(preprocessed_img)
            
            # Clean up excessive newlines
            clean_text = " ".join(text.split())
            
            return {"ocr_text": clean_text}
        except Exception as e:
            return {"ocr_text": f"Error during OCR extraction: {str(e)}"}

    def extract_identifiers(self, text: str) -> Dict[str, List[Dict[str, str]]]:
        """
        Parses OCR text to find CM/L numbers, IS numbers, and other BIS identifiers.
        """
        identifiers = []
        
        # Match CM/L format (e.g. CM/L-1000000, CM/L 1234567)
        cml_matches = re.finditer(r'(CM/L[-\s]?\d+)', text, re.IGNORECASE)
        for match in cml_matches:
            identifiers.append({
                "type": "CM/L",
                "value": match.group(1).upper().replace(" ", "-")
            })
            
        # Match IS format (e.g. IS 302, IS 302-2-15)
        is_matches = re.finditer(r'(IS\s\d+(?:-\d+)*)', text, re.IGNORECASE)
        for match in is_matches:
            identifiers.append({
                "type": "IS Number",
                "value": match.group(1).upper()
            })
            
        # Match Generic BIS/ISI identifiers
        if re.search(r'\b(ISI|BIS|ISI Mark)\b', text, re.IGNORECASE):
            identifiers.append({
                "type": "BIS Mark",
                "value": "ISI Mark Identified"
            })
            
        # Optional: Deduplicate identifiers if required
        unique_identifiers = []
        seen = set()
        for idx in identifiers:
            ident_tuple = (idx["type"], idx["value"])
            if ident_tuple not in seen:
                seen.add(ident_tuple)
                unique_identifiers.append(idx)
                
        return {"identifiers": unique_identifiers}
