import asyncio
import os
from fastapi import UploadFile
from io import BytesIO
from app.database.database import SessionLocal
from app.services.document_ingestion import DocumentIngestionService
import json
import warnings
warnings.filterwarnings("ignore")

async def ingest_standards():
    db = SessionLocal()
    service = DocumentIngestionService(db)
    
    standards_dir = os.path.join(os.path.dirname(__file__), "app", "data", "standards")
    if not os.path.exists(standards_dir):
        print(f"Directory not found: {standards_dir}")
        return
        
    class MockUploadFile(UploadFile):
        def __init__(self, file: BytesIO, filename: str):
            self._file = file
            self.filename = filename
            
        async def read(self):
            return self._file.read()

    for filename in os.listdir(standards_dir):
        if filename.endswith(".pdf"):
            file_path = os.path.join(standards_dir, filename)
            print(f"Ingesting {filename}...")
            
            from app.models.all_models import Document
            existing_doc = db.query(Document).filter(Document.title == filename).first()
            if existing_doc:
                print(f"Skipping {filename} as it is already ingested.")
                continue
            
            with open(file_path, "rb") as f:
                file_bytes = BytesIO(f.read())
                
            upload_file = MockUploadFile(file=file_bytes, filename=filename)
            
            try:
                result = await service.process_upload(upload_file)
                print(f"Successfully ingested {filename}:")
                print(json.dumps(result, indent=2))
            except Exception as e:
                print(f"Failed to ingest {filename}: {e}")

    db.close()

if __name__ == "__main__":
    asyncio.run(ingest_standards())
