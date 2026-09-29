from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, JSON, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.base import Base

class UserRole(str, enum.Enum):
    MANUFACTURER = "Manufacturer"
    CONSUMER = "Consumer"
    ADMIN = "Admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CONSUMER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    manufacturer_profile = relationship("ManufacturerProfile", back_populates="user", uselist=False)
    journeys = relationship("CertificationJourney", back_populates="user")

class ManufacturerProfile(Base):
    __tablename__ = "manufacturer_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    enterprise_type = Column(String)
    location = Column(String)
    industry = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="manufacturer_profile")
    products = relationship("ProductProfile", back_populates="manufacturer")
    readiness_assessments = relationship("FactoryReadiness", back_populates="manufacturer")
    journeys = relationship("CertificationJourney", back_populates="manufacturer")

class ProductProfile(Base):
    __tablename__ = "product_profiles"
    id = Column(Integer, primary_key=True, index=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturer_profiles.id"), nullable=False)
    product_name = Column(String, nullable=False)
    category = Column(String)
    material = Column(String)
    usage = Column(String)
    extracted_attributes = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    manufacturer = relationship("ManufacturerProfile", back_populates="products")
    standard_mappings = relationship("ProductStandardMapping", back_populates="product")
    journeys = relationship("CertificationJourney", back_populates="product")
    readiness_assessments = relationship("FactoryReadiness", back_populates="product")

class Standard(Base):
    __tablename__ = "standards"
    id = Column(Integer, primary_key=True, index=True)
    standard_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    scope = Column(Text)
    scheme = Column(String)
    status = Column(String)
    
    product_mappings = relationship("ProductStandardMapping", back_populates="standard")
    qco = relationship("QCO", back_populates="standard", uselist=False)
    test_requirements = relationship("TestRequirement", back_populates="standard")

class ProductStandardMapping(Base):
    __tablename__ = "product_standard_mappings"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product_profiles.id"), nullable=False)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    confidence_score = Column(Float)
    matching_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("ProductProfile", back_populates="standard_mappings")
    standard = relationship("Standard", back_populates="product_mappings")

class QCO(Base):
    __tablename__ = "qcos"
    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), unique=True, nullable=False)
    status = Column(String, nullable=False)  # mandatory, upcoming, voluntary
    effective_date = Column(DateTime(timezone=True))
    reason = Column(Text)
    
    standard = relationship("Standard", back_populates="qco")

class TestRequirementType(str, enum.Enum):
    R = "R" # Required In-House
    S = "S" # Can Outsource

class TestRequirement(Base):
    __tablename__ = "test_requirements"
    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    test_name = Column(String, nullable=False)
    clause = Column(String)
    equipment = Column(String)
    type = Column(Enum(TestRequirementType))
    
    standard = relationship("Standard", back_populates="test_requirements")

class Laboratory(Base):
    __tablename__ = "laboratories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    supported_standards = Column(JSON)
    supported_tests = Column(JSON)
    accreditation = Column(String)
    recognition_status = Column(String)

class LicenceRecord(Base):
    __tablename__ = "licence_records"
    id = Column(Integer, primary_key=True, index=True)
    cml_number = Column(String, unique=True, index=True, nullable=False)
    manufacturer = Column(String, nullable=False)
    product_scope = Column(Text)
    standard = Column(String)
    valid_from = Column(DateTime(timezone=True))
    valid_until = Column(DateTime(timezone=True))
    status = Column(String)

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    source = Column(String)
    standard_number = Column(String, index=True)
    version = Column(String)
    effective_date = Column(DateTime(timezone=True))
    document_hash = Column(String, unique=True)
    status = Column(String)
    categories = Column(JSON, default=list)
    source_type = Column(String, default="Other")
    product = Column(String)
    scheme = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    chunks = relationship("DocumentChunk", back_populates="document")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer)
    clause_number = Column(String)
    category = Column(JSON) # JSON since chunks can have multiple categories from parent Document
    standard_number = Column(String)
    product = Column(String)
    # Using JSON for embedding array (PostgreSQL pgvector should be used later)
    embedding = Column(JSON) 
    
    document = relationship("Document", back_populates="chunks")

class CertificationJourney(Base):
    __tablename__ = "certification_journeys"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    manufacturer_id = Column(Integer, ForeignKey("manufacturer_profiles.id"))
    product_id = Column(Integer, ForeignKey("product_profiles.id"), nullable=False)
    current_stage = Column(Integer, default=1)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="journeys")
    manufacturer = relationship("ManufacturerProfile", back_populates="journeys")
    product = relationship("ProductProfile", back_populates="journeys")

class FactoryReadiness(Base):
    __tablename__ = "factory_readiness"
    id = Column(Integer, primary_key=True, index=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturer_profiles.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product_profiles.id"), nullable=False)
    readiness_score = Column(Float)
    assessment_data = Column(JSON)
    critical_gaps = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    manufacturer = relationship("ManufacturerProfile", back_populates="readiness_assessments")
    product = relationship("ProductProfile", back_populates="readiness_assessments")
