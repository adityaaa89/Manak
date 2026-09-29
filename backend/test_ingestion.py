import asyncio
from reportlab.pdfgen import canvas
from fastapi import UploadFile
from io import BytesIO
from app.database.database import SessionLocal
from app.services.document_ingestion import DocumentIngestionService
import json
import warnings
warnings.filterwarnings("ignore")

def create_sample_pdf() -> BytesIO:
    buffer = BytesIO()
    c = canvas.Canvas(buffer)
    # Page 1
    c.drawString(100, 800, "Indian Standard IS 302-2-15")
    c.drawString(100, 780, "Electric Kettles")
    c.drawString(100, 760, "Year: 2025")
    c.showPage()
    # Page 2
    c.drawString(100, 800, "Clause 5.1 General Requirements")
    c.drawString(100, 780, "Electric kettles shall be constructed to be safe.")
    c.drawString(100, 760, "They must pass the heat resistance test.")
    # Add enough text to ensure chunks might be tested
    text = "This is some standard text that goes on for a bit. " * 50
    y = 740
    for i in range(0, len(text), 100):
        c.drawString(100, y, text[i:i+100])
        y -= 20
    c.showPage()
    
    c.save()
    buffer.seek(0)
    return buffer

async def test_ingestion():
    db = SessionLocal()
    service = DocumentIngestionService(db)
    
    pdf_bytes = create_sample_pdf()
    
    # Mock UploadFile
    class MockUploadFile(UploadFile):
        def __init__(self, file: BytesIO, filename: str):
            self._file = file
            self.filename = filename
            
        async def read(self):
            return self._file.read()

    upload_file = MockUploadFile(file=pdf_bytes, filename="IS_302_2_15_Kettles.pdf")
    
    try:
        print("Starting ingestion...")
        result = await service.process_upload(upload_file)
        print("Ingestion Result:")
        print(json.dumps(result, indent=2))
        
        # Verify in DB
        from app.models.all_models import Document, DocumentChunk
        doc = db.query(Document).filter(Document.id == result["document_id"]).first()
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).all()
        
        print("\nDocument Verification:")
        print(f"Title: {doc.title}")
        print(f"Standard: {doc.standard_number}")
        print(f"Version: {doc.version}")
        
        print(f"\nChunks Verification (Total {len(chunks)}):")
        import math
        def cosine_sim(v1, v2):
            if not v1 or not v2: return 0.0
            dot_product = sum(x * y for x, y in zip(v1, v2))
            mag1 = math.sqrt(sum(x * x for x in v1))
            mag2 = math.sqrt(sum(x * x for x in v2))
            if mag1 == 0 or mag2 == 0: return 0.0
            return dot_product / (mag1 * mag2)

        for i, chunk in enumerate(chunks[:2]):
            print(f"Chunk {i+1} Page: {chunk.page_number}")
            print(f"Chunk {i+1} Clause: {chunk.clause_number}")
            print(f"Chunk {i+1} Vector Dimension: {len(chunk.embedding)}")
            print(f"Chunk {i+1} Preview: {chunk.chunk_text[:50]}...")
            
            # verify length
            assert len(chunk.embedding) == 768, f"Expected 768 dim, got {len(chunk.embedding)}"
            
            print("-")

        if len(chunks) >= 2:
            emb1 = chunks[0].embedding
            emb2 = chunks[1].embedding
            # vectors are not identical
            are_identical = all(x == y for x, y in zip(emb1, emb2))
            print(f"Vectors are identical: {are_identical}")
            
            from app.config.settings import settings
            if settings.GEMINI_API_KEY:
                assert not are_identical, "Vectors should not be identical when using real embeddings"
            else:
                print("Skipping identical vector assertion because GEMINI_API_KEY is not set (mock in use).")
            
            # cosine similarity
            sim = cosine_sim(emb1, emb2)
            print(f"Cosine Similarity between Chunk 1 and 2: {sim:.4f}")
            
            # create a 3rd mock vector for sanity check of cosine
            emb_diff = [-x for x in emb1]
            sim2 = cosine_sim(emb1, emb_diff)
            print(f"Cosine Similarity between Chunk 1 and inverted Chunk 1: {sim2:.4f}")
            
            if settings.GEMINI_API_KEY:
                assert sim != sim2, "Cosine similarity should produce different values"
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_ingestion())
