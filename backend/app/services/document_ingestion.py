import re
import fitz
from sqlalchemy.orm import Session
from fastapi import UploadFile
from typing import Dict, Any, List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.models.all_models import Document, DocumentChunk
from app.services.embedding_service import EmbeddingService
from app.config.settings import settings

class DocumentIngestionService:
    def __init__(self, db: Session):
        self.db = db
        # Use gemini if API key is set, else fallback to mock
        provider = "gemini" if settings.GEMINI_API_KEY else "mock"
        self.embedding_service = EmbeddingService(provider=provider)
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def extract_metadata(self, text: str) -> Dict[str, str]:
        """Extracts standard number, version/year, and status from the first few pages."""
        metadata = {
            "standard_number": "Unknown",
            "version": "Unknown",
            "status": "Draft"
        }
        
        # Regex for IS standard number, e.g., IS 302-2-15
        is_match = re.search(r'(IS\s*\d+(?:-\d+)*)', text, re.IGNORECASE)
        if is_match:
            metadata["standard_number"] = is_match.group(1).strip()
            
        # Regex for year/version, e.g., :2025 or (2025) or year 2025
        year_match = re.search(r':\s*(\d{4})|\b(19\d{2}|20\d{2})\b', text)
        if year_match:
            metadata["version"] = year_match.group(1) or year_match.group(2)
            
        return metadata
        
    def extract_clause(self, chunk_text: str) -> str:
        """Attempts to extract a clause number from the chunk text."""
        # e.g., Clause 5.2 or 5.2.1
        clause_match = re.search(r'(?:Clause|Section)\s*(\d+(?:\.\d+)*)', chunk_text, re.IGNORECASE)
        if clause_match:
            return f"Clause {clause_match.group(1)}"
            
        # Fallback for just leading numbers like 5.2.1 
        leading_match = re.search(r'^\s*(\d+(?:\.\d+)+)', chunk_text)
        if leading_match:
            return f"Clause {leading_match.group(1)}"
            
        return "Unknown"

    def clean_text(self, text: str) -> str:
        """Cleans extracted PDF text before chunking."""
        # Remove specific headers/footers
        text = re.sub(r'Free Standard provided by BIS[^\n]*\n?', '', text, flags=re.IGNORECASE)
        # Remove email addresses
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '', text)
        # Remove IP addresses
        text = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '', text)
        # Remove copyright notices
        text = re.sub(r'(?i)©[^\n]*', '', text)
        # Remove isolated page numbers
        text = re.sub(r'^\s*(?:Page\s*)?-?\s*\d+\s*-?\s*$', '', text, flags=re.MULTILINE)
        # Collapse multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def detect_categories(self, filename: str, text: str) -> List[str]:
        combined = (filename + " " + text).lower()
        
        categories = []
        if "compulsory registration scheme" in combined:
            categories.append("CRS")
        if "hallmark" in combined or "huid" in combined:
            categories.append("Hallmarking")
        if "quality control order" in combined or "qco" in combined:
            categories.append("QCO")
        if "licence" in combined or "certification scheme" in combined or "application" in combined:
            categories.append("Certification")
        if "scheme of testing and inspection" in combined or "sti" in combined or "test" in combined:
            categories.append("Testing")
        if "indian standard" in combined or "is " in combined:
            categories.append("Standard")
            
        if not categories:
            categories.append("General")
            
        return categories

    def detect_source_type(self, filename: str, text: str, categories: List[str]) -> str:
        combined = (filename + " " + text).lower()
        if "Standard" in categories or "is " in combined or "indian standard" in combined:
            return "BIS Official Standard"
        if "guideline" in combined:
            return "BIS Guideline"
        return "Other"

    def detect_product(self, filename: str, text: str) -> str:
        combined = (filename + " " + text).lower()
        if "electric kettle" in combined or "is 302-2-15" in combined:
            return "Electric Kettle"
        if "pressure cooker" in combined or "is 2347" in combined:
            return "Pressure Cooker"
        if "led bulb" in combined or "is 16102" in combined:
            return "LED Bulb"
        if "household electrical appliances" in combined or "is 302-1" in combined:
            return "Household Electrical Appliance"
        return "Unknown"

    def detect_scheme(self, filename: str, text: str) -> str:
        combined = (filename + " " + text).lower()
        if "scheme-iv" in combined or "certificate of conformity" in combined:
            return "Scheme-IV"
        if "scheme-i" in combined or "isi mark" in combined or "grant of licence" in combined:
            return "Scheme-I"
        if "crs" in combined or "compulsory registration" in combined:
            return "CRS"
        return "Unknown"

    async def process_upload(self, file: UploadFile) -> Dict[str, Any]:
        """
        Main pipeline: PDF -> Extract -> Clean -> Chunk -> Store -> Embed
        """
        file_bytes = await file.read()
        
        # 1. Text Extraction using PyMuPDF (fitz)
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        pages_data = []
        full_text = ""
        for i, page in enumerate(doc):
            text = page.get_text("text")
            if text.strip():
                # Clean text before storing for chunks
                cleaned_page_text = self.clean_text(text)
                if cleaned_page_text.strip():
                    pages_data.append({"page": i + 1, "text": cleaned_page_text})
                    full_text += cleaned_page_text + "\n"
        
        # 3. Metadata Extraction
        doc_metadata = self.extract_metadata(full_text[:5000]) # search first 5000 chars
        doc_categories = self.detect_categories(file.filename, full_text[:5000])
        doc_source_type = self.detect_source_type(file.filename, full_text[:5000], doc_categories)
        doc_product = self.detect_product(file.filename, full_text[:5000])
        doc_scheme = self.detect_scheme(file.filename, full_text[:5000])
        
        # 4. Metadata Storage - Create Document
        new_doc = Document(
            title=file.filename,
            source="User Upload",
            standard_number=doc_metadata["standard_number"],
            version=doc_metadata["version"],
            status=doc_metadata["status"],
            categories=doc_categories,
            source_type=doc_source_type,
            product=doc_product,
            scheme=doc_scheme
        )
        self.db.add(new_doc)
        self.db.flush() # flush to get new_doc.id
        
        chunk_count = 0
        
        for page_data in pages_data:
            page_text = page_data["text"]
            page_num = page_data["page"]
            
            # 2. Semantic Chunking
            chunks_raw = self.text_splitter.split_text(page_text)
            
            for text_chunk in chunks_raw:
                if not text_chunk.strip():
                    continue
                    
                clause_ref = self.extract_clause(text_chunk)
                    
                # 5. Embedding Generation
                embedding_vector = self.embedding_service.generate_embedding(text_chunk)
                
                # Create DocumentChunk
                db_chunk = DocumentChunk(
                    document_id=new_doc.id,
                    chunk_text=text_chunk,
                    page_number=page_num,
                    clause_number=clause_ref,
                    category=doc_categories,
                    standard_number=doc_metadata["standard_number"],
                    product=doc_product,
                    embedding=embedding_vector
                )
                self.db.add(db_chunk)
                
                chunk_count += 1
                
        self.db.commit()
        
        return {
            "document_id": str(new_doc.id),
            "pages_extracted": len(pages_data),
            "chunks_created": chunk_count,
            "metadata": doc_metadata,
            "product": doc_product,
            "scheme": doc_scheme,
            "status": "processed"
        }
