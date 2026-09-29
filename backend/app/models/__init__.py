from app.database.base import Base
from .all_models import (
    User,
    ManufacturerProfile,
    ProductProfile,
    Standard,
    ProductStandardMapping,
    QCO,
    TestRequirement,
    Laboratory,
    LicenceRecord,
    Document,
    DocumentChunk,
    CertificationJourney,
    FactoryReadiness
)

# Export all models for Alembic base discovery
__all__ = [
    "Base",
    "User",
    "ManufacturerProfile",
    "ProductProfile",
    "Standard",
    "ProductStandardMapping",
    "QCO",
    "TestRequirement",
    "Laboratory",
    "LicenceRecord",
    "Document",
    "DocumentChunk",
    "CertificationJourney",
    "FactoryReadiness"
]
