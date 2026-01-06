"""
AI-Native Ingredient Intelligence Co-Pilot API

A FastAPI backend that analyzes food ingredients using Google Gemini
to provide human-level health insights with intent-first reasoning.
"""

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.models.request import AnalyzeTextRequest
from app.models.response import AnalyzeResponse, HealthResponse, ErrorResponse
from app.services.analyzer import get_analyzer
from app.routes.auth import router as auth_router, get_optional_user
from app.routes.history import router as history_router
from app.database.mongodb import connect_to_mongodb, close_mongodb_connection
from app.database.analysis_repository import get_analysis_history_repository


# Lifespan handler for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: validate configuration
    settings = get_settings()
    if not settings.validate():
        print("⚠️  WARNING: GEMINI_API_KEY not configured. API will return errors.")
    else:
        print("✅ Gemini API configured successfully")
    
    # Connect to MongoDB
    await connect_to_mongodb()
    
    yield
    
    # Shutdown: cleanup
    await close_mongodb_connection()
    print("👋 Shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="AI Ingredient Intelligence Co-Pilot",
    description="""
## Overview
An AI-native API that helps consumers understand food ingredients at the point of decision.

## Core Features
- **Text Analysis**: Analyze ingredient lists, OCR text, or free-form questions
- **Image Analysis**: Extract and analyze ingredients from product images
- **Intent-First Reasoning**: Infers user concerns without requiring explicit questions
- **Uncertainty Communication**: Honestly communicates what is known vs uncertain

## Input Types
- `ingredient_list`: A list of ingredient names
- `ocr_text`: OCR-extracted text from a product label
- `free_text`: Free-form question about ingredients

## Usage
```bash
# Text analysis
curl -X POST "/analyze" -H "Content-Type: application/json" \\
  -d '{"input_type": "ingredient_list", "content": ["aspartame", "sucralose"]}'

# Image analysis
curl -X POST "/analyze/image" -F "image=@label.jpg"
```
    """,
    version="1.0.0",
    lifespan=lifespan,
    responses={
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)

# Include history routes
app.include_router(history_router)


@app.get("/", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns the API status and whether Gemini is configured.
    """
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        gemini_configured=bool(settings.GEMINI_API_KEY)
    )


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    tags=["Analysis"],
    summary="Analyze ingredients from text",
    responses={
        200: {"description": "Successful analysis"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Analysis failed"}
    }
)
async def analyze_text(
    request: AnalyzeTextRequest,
    current_user = Depends(get_optional_user)
):
    """
    Analyze ingredients from text input.
    
    Supports three input types:
    - **ingredient_list**: A list of ingredient names (string or array)
    - **ocr_text**: Raw OCR-extracted text from a product label
    - **free_text**: A free-form question about ingredients
    
    Optional `user_context` can provide information about allergies,
    dietary goals, or specific concerns for personalized analysis.
    
    If authenticated, the analysis will be saved to history.
    """
    try:
        analyzer = get_analyzer()
        result = await analyzer.analyze_text(request)
        
        # Save to history if user is authenticated
        if current_user:
            content = request.content if isinstance(request.content, str) else ", ".join(request.content)
            repo = get_analysis_history_repository()
            await repo.save_analysis(
                user_id=current_user.id,
                input_type=request.input_type,
                content=content,
                user_context=request.user_context,
                result=result
            )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post(
    "/analyze/image",
    response_model=AnalyzeResponse,
    tags=["Analysis"],
    summary="Analyze ingredients from an image",
    responses={
        200: {"description": "Successful analysis"},
        400: {"model": ErrorResponse, "description": "Invalid image or request"},
        500: {"model": ErrorResponse, "description": "Analysis failed"}
    }
)
async def analyze_image(
    image: UploadFile = File(..., description="Product label or ingredient list image"),
    user_context: Optional[str] = Form(None, description="Optional user context for personalized analysis"),
    authorization: Optional[str] = Header(None)
):
    """
    Analyze ingredients from a product image.
    
    Upload an image of a product label or ingredient list.
    The API will:
    1. Extract text from the image using Gemini Vision
    2. Analyze the extracted ingredients
    3. Return structured insights
    
    Supported formats: JPEG, PNG, WebP, GIF
    
    If authenticated, the analysis will be saved to history.
    """
    # Get current user if authenticated
    current_user = await get_optional_user(authorization)
    
    # Validate file type
    if not image.content_type:
        raise HTTPException(status_code=400, detail="Could not determine image type")
    
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {image.content_type}. Allowed: {', '.join(allowed_types)}"
        )
    
    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Validate image size (max 10MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large. Maximum size is 10MB.")
        
        # Analyze
        analyzer = get_analyzer()
        result = await analyzer.analyze_image(image_bytes, user_context)
        
        # Save to history if user is authenticated
        if current_user:
            repo = get_analysis_history_repository()
            await repo.save_analysis(
                user_id=current_user.id,
                input_type="image",
                content=f"Image: {image.filename or 'uploaded_image'}",
                user_context=user_context,
                result=result
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/providers", tags=["Configuration"])
async def list_providers():
    """
    List available LLM providers and their status.
    """
    settings = get_settings()
    return {
        "providers": [
            {
                "name": "Google Gemini",
                "configured": bool(settings.GEMINI_API_KEY),
                "models": {
                    "text": settings.GEMINI_MODEL,
                    "vision": settings.GEMINI_VISION_MODEL
                }
            }
        ],
        "active_provider": "Google Gemini" if settings.GEMINI_API_KEY else None
    }


# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": "validation_error", "message": str(exc), "details": None}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": "An unexpected error occurred", "details": str(exc)}
    )
