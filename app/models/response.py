"""
Response models for the AI Ingredient Co-Pilot API.
Defines output schemas for all API endpoints.
"""

from typing import Optional
from pydantic import BaseModel, Field


class IngredientInsight(BaseModel):
    """Individual ingredient insight."""
    
    name: str = Field(..., description="Name of the ingredient")
    concern_level: str = Field(
        ..., 
        description="Level of concern: 'none', 'low', 'medium', 'high'",
        examples=["low"]
    )
    brief: str = Field(
        ..., 
        description="One-line explanation of why this ingredient matters or doesn't"
    )


class AnalyzeResponse(BaseModel):
    """Response model for ingredient analysis."""
    
    summary: str = Field(
        ...,
        description="2-3 sentence human-friendly insight about the overall product"
    )
    key_concerns: list[str] = Field(
        default_factory=list,
        description="Top concerns to be aware of, if any"
    )
    positives: list[str] = Field(
        default_factory=list,
        description="Positive aspects of the ingredients, if any"
    )
    confidence_level: str = Field(
        ...,
        description="Confidence in the analysis: 'high', 'medium', 'low'"
    )
    uncertainty_notes: Optional[str] = Field(
        None,
        description="What we don't know or can't determine from the input"
    )
    ingredient_insights: list[IngredientInsight] = Field(
        default_factory=list,
        description="Brief insights for individual ingredients of interest"
    )
    reasoning_time_ms: int = Field(
        ...,
        description="Time taken to process the request in milliseconds"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "summary": "This product contains a common preservative and a high-calorie sweetener. The sodium benzoate is generally well-tolerated in normal amounts, but the high fructose corn syrup directly conflicts with a sugar reduction goal.",
                "key_concerns": [
                    "High fructose corn syrup is a significant sugar source",
                    "Consider alternatives with natural sweeteners if reducing sugar"
                ],
                "positives": [
                    "Citric acid is a harmless natural compound"
                ],
                "confidence_level": "high",
                "uncertainty_notes": "Without knowing serving size and total sugar grams, exact impact cannot be quantified.",
                "ingredient_insights": [
                    {
                        "name": "High Fructose Corn Syrup",
                        "concern_level": "medium",
                        "brief": "A common sweetener linked to excess calorie intake when consumed frequently"
                    },
                    {
                        "name": "Sodium Benzoate",
                        "concern_level": "low",
                        "brief": "A preservative considered safe at levels used in foods"
                    }
                ],
                "reasoning_time_ms": 1250
            }
        }
    }


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    gemini_configured: bool = Field(..., description="Whether Gemini API is configured")


class ErrorResponse(BaseModel):
    """Error response model."""
    
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[str] = Field(None, description="Additional error details")
