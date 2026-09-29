from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any
from app.database.database import get_db
from app.services.document_ingestion import DocumentIngestionService

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

class UploadResponse(BaseModel):
    document_id: str
    pages_extracted: int
    chunks_created: int
    metadata: Dict[str, Any]
    status: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload and process a BIS document into searchable chunks.
    """
    service = DocumentIngestionService(db)
    result = await service.process_upload(file)
    return result
