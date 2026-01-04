"""
Google Gemini provider for the AI Ingredient Co-Pilot.
Handles both text and vision-based analysis using Google's Gemini API.
"""

import json
import time
from typing import Optional
import google.generativeai as genai

from app.config import get_settings
from app.models.response import AnalyzeResponse, IngredientInsight


class GeminiProvider:
    """Google Gemini API provider for ingredient analysis."""
    
    def __init__(self):
        """Initialize the Gemini provider with API key."""
        settings = get_settings()
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.text_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.vision_model = genai.GenerativeModel(settings.GEMINI_VISION_MODEL)
    
    async def analyze_text(self, prompt: str) -> AnalyzeResponse:
        """
        Analyze ingredients using text-based input.
        
        Args:
            prompt: The complete prompt including system instructions and user input
            
        Returns:
            AnalyzeResponse with structured analysis
        """
        start_time = time.time()
        
        try:
            response = self.text_model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                )
            )
            
            reasoning_time_ms = int((time.time() - start_time) * 1000)
            return self._parse_response(response.text, reasoning_time_ms)
            
        except Exception as e:
            reasoning_time_ms = int((time.time() - start_time) * 1000)
            return self._create_error_response(str(e), reasoning_time_ms)
    
    async def analyze_image(self, image_bytes: bytes, prompt: str) -> AnalyzeResponse:
        """
        Analyze ingredients from an image using Gemini Vision.
        
        Args:
            image_bytes: Raw image bytes
            prompt: The system prompt and instructions
            
        Returns:
            AnalyzeResponse with structured analysis
        """
        start_time = time.time()
        
        try:
            # Create image part for Gemini
            image_part = {
                "mime_type": "image/jpeg",  # Will be detected/converted as needed
                "data": image_bytes
            }
            
            response = self.vision_model.generate_content(
                [prompt, image_part],
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                )
            )
            
            reasoning_time_ms = int((time.time() - start_time) * 1000)
            return self._parse_response(response.text, reasoning_time_ms)
            
        except Exception as e:
            reasoning_time_ms = int((time.time() - start_time) * 1000)
            return self._create_error_response(str(e), reasoning_time_ms)
    
    def _parse_response(self, response_text: str, reasoning_time_ms: int) -> AnalyzeResponse:
        """
        Parse the LLM response into a structured AnalyzeResponse.
        
        Args:
            response_text: Raw response text from Gemini
            reasoning_time_ms: Time taken for the request
            
        Returns:
            Parsed AnalyzeResponse
        """
        try:
            # Clean up response - remove markdown code blocks if present
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            # Parse JSON
            data = json.loads(cleaned_text)
            
            # Build ingredient insights
            ingredient_insights = []
            for insight in data.get("ingredient_insights", []):
                ingredient_insights.append(IngredientInsight(
                    name=insight.get("name", "Unknown"),
                    concern_level=insight.get("concern_level", "none"),
                    brief=insight.get("brief", "")
                ))
            
            return AnalyzeResponse(
                summary=data.get("summary", "Unable to provide analysis"),
                key_concerns=data.get("key_concerns", []),
                positives=data.get("positives", []),
                confidence_level=data.get("confidence_level", "low"),
                uncertainty_notes=data.get("uncertainty_notes"),
                ingredient_insights=ingredient_insights,
                reasoning_time_ms=reasoning_time_ms
            )
            
        except json.JSONDecodeError:
            # If JSON parsing fails, create a response from the raw text
            return AnalyzeResponse(
                summary=response_text[:500] if len(response_text) > 500 else response_text,
                key_concerns=[],
                positives=[],
                confidence_level="low",
                uncertainty_notes="Response format was unexpected. This is a best-effort interpretation.",
                ingredient_insights=[],
                reasoning_time_ms=reasoning_time_ms
            )
    
    def _create_error_response(self, error_message: str, reasoning_time_ms: int) -> AnalyzeResponse:
        """Create a response for error cases."""
        return AnalyzeResponse(
            summary="Unable to complete analysis due to an error.",
            key_concerns=[],
            positives=[],
            confidence_level="low",
            uncertainty_notes=f"Analysis error: {error_message}",
            ingredient_insights=[],
            reasoning_time_ms=reasoning_time_ms
        )


# Singleton instance
_provider: Optional[GeminiProvider] = None


def get_gemini_provider() -> GeminiProvider:
    """Get or create the Gemini provider singleton."""
    global _provider
    if _provider is None:
        _provider = GeminiProvider()
    return _provider
