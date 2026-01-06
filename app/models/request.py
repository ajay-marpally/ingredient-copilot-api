"""
Request models for the AI Ingredient Co-Pilot API.
Defines input schemas for all API endpoints.
"""

from typing import Optional, Literal, Union, List
from pydantic import BaseModel, Field


class AnalyzeTextRequest(BaseModel):
    """Request model for text-based ingredient analysis."""
    
    input_type: Literal["ocr_text", "ingredient_list", "free_text"] = Field(
        ...,
        description="Type of input being provided",
        examples=["ingredient_list"]
    )
    content: Union[str, List[str]] = Field(
        ...,
        description="The ingredient content - either a string or list of ingredients",
        examples=["sodium benzoate, citric acid, sugar"]
    )
    user_context: Optional[str] = Field(
        None,
        description="Optional context about user preferences, allergies, or dietary goals",
        examples=["I'm trying to reduce sugar intake", "I have a gluten allergy"]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "input_type": "ingredient_list",
                    "content": ["sodium benzoate", "high fructose corn syrup", "citric acid"],
                    "user_context": "trying to reduce sugar intake"
                },
                {
                    "input_type": "ocr_text",
                    "content": "INGREDIENTS: Water, Sugar, Natural Flavors, Citric Acid, Sodium Benzoate",
                    "user_context": None
                },
                {
                    "input_type": "free_text",
                    "content": "Is aspartame safe? I see it in my diet soda.",
                    "user_context": None
                }
            ]
        }
    }


class AnalyzeImageRequest(BaseModel):
    """Request model for image-based ingredient analysis (used with form data)."""
    
    user_context: Optional[str] = Field(
        None,
        description="Optional context about user preferences, allergies, or dietary goals"
    )


class IngredientInsightInput(BaseModel):
    """Input model for ingredient insight."""
    name: str
    concern_level: str
    brief: str


class AnalysisResultInput(BaseModel):
    """Input model for analysis result to save to history."""
    summary: str
    key_concerns: List[str] = []
    positives: List[str] = []
    confidence_level: str = "medium"
    uncertainty_notes: Optional[str] = None
    ingredient_insights: List[IngredientInsightInput] = []
    reasoning_time_ms: Optional[int] = None


class SaveHistoryRequest(BaseModel):
    """Request model for saving analysis to history."""
    
    input_type: Literal["ocr_text", "ingredient_list", "free_text", "image"] = Field(
        ...,
        description="Type of input that was analyzed"
    )
    content: Union[str, List[str]] = Field(
        ...,
        description="The original content that was analyzed"
    )
    user_context: Optional[str] = Field(
        None,
        description="User context provided during analysis"
    )
    result: AnalysisResultInput = Field(
        ...,
        description="The analysis result to save"
    )
