from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# --- Enums matching models ---
class UserRole(str, Enum):
    MANUFACTURER = "Manufacturer"
    CONSUMER = "Consumer"
    ADMIN = "Admin"

class TestRequirementType(str, Enum):
    R = "R"
    S = "S"

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[UserRole] = UserRole.CONSUMER

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- ManufacturerProfile Schemas ---
class ManufacturerProfileBase(BaseModel):
    company_name: str
    enterprise_type: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None

class ManufacturerProfileCreate(ManufacturerProfileBase):
    user_id: int

class ManufacturerProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    enterprise_type: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None

class ManufacturerProfileResponse(ManufacturerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- ProductProfile Schemas ---
class ProductProfileBase(BaseModel):
    product_name: str
    category: Optional[str] = None
    material: Optional[str] = None
    usage: Optional[str] = None
    extracted_attributes: Optional[Dict[str, Any]] = None

class ProductProfileCreate(ProductProfileBase):
    manufacturer_id: int

class ProductProfileUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    usage: Optional[str] = None
    extracted_attributes: Optional[Dict[str, Any]] = None

class ProductProfileResponse(ProductProfileBase):
    id: int
    manufacturer_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Standard Schemas ---
class StandardBase(BaseModel):
    standard_number: str
    title: str
    scope: Optional[str] = None
    scheme: Optional[str] = None
    status: Optional[str] = None

class StandardCreate(StandardBase):
    pass

class StandardUpdate(BaseModel):
    standard_number: Optional[str] = None
    title: Optional[str] = None
    scope: Optional[str] = None
    scheme: Optional[str] = None
    status: Optional[str] = None

class StandardResponse(StandardBase):
    id: int
    class Config:
        from_attributes = True

# --- ProductStandardMapping Schemas ---
class ProductStandardMappingBase(BaseModel):
    confidence_score: Optional[float] = None
    matching_reason: Optional[str] = None

class ProductStandardMappingCreate(ProductStandardMappingBase):
    product_id: int
    standard_id: int

class ProductStandardMappingUpdate(BaseModel):
    confidence_score: Optional[float] = None
    matching_reason: Optional[str] = None

class ProductStandardMappingResponse(ProductStandardMappingBase):
    id: int
    product_id: int
    standard_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- QCO Schemas ---
class QCOBase(BaseModel):
    status: str
    effective_date: Optional[datetime] = None
    reason: Optional[str] = None

class QCOCreate(QCOBase):
    standard_id: int

class QCOUpdate(BaseModel):
    status: Optional[str] = None
    effective_date: Optional[datetime] = None
    reason: Optional[str] = None

class QCOResponse(QCOBase):
    id: int
    standard_id: int
    class Config:
        from_attributes = True

# --- TestRequirement Schemas ---
class TestRequirementBase(BaseModel):
    test_name: str
    clause: Optional[str] = None
    equipment: Optional[str] = None
    type: Optional[TestRequirementType] = None

class TestRequirementCreate(TestRequirementBase):
    standard_id: int

class TestRequirementUpdate(BaseModel):
    test_name: Optional[str] = None
    clause: Optional[str] = None
    equipment: Optional[str] = None
    type: Optional[TestRequirementType] = None

class TestRequirementResponse(TestRequirementBase):
    id: int
    standard_id: int
    class Config:
        from_attributes = True

# --- Laboratory Schemas ---
class LaboratoryBase(BaseModel):
    name: str
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    supported_standards: Optional[List[str]] = None
    supported_tests: Optional[List[str]] = None
    accreditation: Optional[str] = None
    recognition_status: Optional[str] = None

class LaboratoryCreate(LaboratoryBase):
    pass

class LaboratoryUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    supported_standards: Optional[List[str]] = None
    supported_tests: Optional[List[str]] = None
    accreditation: Optional[str] = None
    recognition_status: Optional[str] = None

class LaboratoryResponse(LaboratoryBase):
    id: int
    class Config:
        from_attributes = True

# --- LicenceRecord Schemas ---
class LicenceRecordBase(BaseModel):
    cml_number: str
    manufacturer: str
    product_scope: Optional[str] = None
    standard: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    status: Optional[str] = None

class LicenceRecordCreate(LicenceRecordBase):
    pass

class LicenceRecordUpdate(BaseModel):
    cml_number: Optional[str] = None
    manufacturer: Optional[str] = None
    product_scope: Optional[str] = None
    standard: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    status: Optional[str] = None

class LicenceRecordResponse(LicenceRecordBase):
    id: int
    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentBase(BaseModel):
    title: str
    source: Optional[str] = None
    standard_number: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[datetime] = None
    document_hash: Optional[str] = None
    status: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    source: Optional[str] = None
    standard_number: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[datetime] = None
    status: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- DocumentChunk Schemas ---
class DocumentChunkBase(BaseModel):
    chunk_text: str
    page_number: Optional[int] = None
    clause_number: Optional[str] = None
    embedding: Optional[List[float]] = None

class DocumentChunkCreate(DocumentChunkBase):
    document_id: int

class DocumentChunkUpdate(BaseModel):
    chunk_text: Optional[str] = None
    page_number: Optional[int] = None
    clause_number: Optional[str] = None
    embedding: Optional[List[float]] = None

class DocumentChunkResponse(DocumentChunkBase):
    id: int
    document_id: int
    class Config:
        from_attributes = True

# --- CertificationJourney Schemas ---
class CertificationJourneyBase(BaseModel):
    current_stage: Optional[int] = 1
    status: Optional[str] = "active"

class CertificationJourneyCreate(CertificationJourneyBase):
    user_id: int
    product_id: int
    manufacturer_id: Optional[int] = None

class CertificationJourneyUpdate(BaseModel):
    current_stage: Optional[int] = None
    status: Optional[str] = None

class CertificationJourneyResponse(CertificationJourneyBase):
    id: int
    user_id: int
    product_id: int
    manufacturer_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- FactoryReadiness Schemas ---
class FactoryReadinessBase(BaseModel):
    readiness_score: Optional[float] = None
    assessment_data: Optional[Dict[str, Any]] = None
    critical_gaps: Optional[Dict[str, Any]] = None

class FactoryReadinessCreate(FactoryReadinessBase):
    manufacturer_id: int
    product_id: int

class FactoryReadinessUpdate(BaseModel):
    readiness_score: Optional[float] = None
    assessment_data: Optional[Dict[str, Any]] = None
    critical_gaps: Optional[Dict[str, Any]] = None

class FactoryReadinessResponse(FactoryReadinessBase):
    id: int
    manufacturer_id: int
    product_id: int
    created_at: datetime
    class Config:
        from_attributes = True
