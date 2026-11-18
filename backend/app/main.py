from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}

@app.head("/")
@app.get("/")
def root():
    """Root endpoint for pinging services."""
    return {"status": "online", "message": "Manak API is running"}


from app.routes import products, standards, qco, testing, readiness, labs, blueprint, documents, rag, verification, demo

api_routers = [
    products.router,
    standards.router,
    qco.router,
    testing.router,
    readiness.router,
    labs.router,
    blueprint.router,
    documents.router,
    rag.router,
    verification.router,
    demo.router,
]

# Support both /api/* and root /* endpoints to prevent 404s from URL configuration mismatches
for router in api_routers:
    app.include_router(router, prefix=settings.API_V1_STR)
    app.include_router(router)
