"""
Core analyzer service for the AI Ingredient Co-Pilot.
Orchestrates the analysis pipeline from input to structured response.
"""

from typing import Optional

from app.models.request import AnalyzeTextRequest
from app.models.response import AnalyzeResponse
from app.services.gemini_provider import get_gemini_provider
from app.prompts.system_prompt import get_analysis_prompt, get_image_analysis_prompt


class IngredientAnalyzer:
    """Main analyzer service that coordinates LLM calls and response formatting."""
    
    def __init__(self):
        """Initialize the analyzer with the Gemini provider."""
        self.provider = get_gemini_provider()
    
    async def analyze_text(self, request: AnalyzeTextRequest) -> AnalyzeResponse:
        """
        Analyze ingredients from text-based input.
        
        Args:
            request: The analysis request with input type, content, and optional context
            
        Returns:
            AnalyzeResponse with structured insights
        """
        # Normalize content to string
        if isinstance(request.content, list):
            content_str = ", ".join(request.content)
        else:
            content_str = request.content
        
        # Generate the full prompt
        prompt = get_analysis_prompt(
            input_type=request.input_type,
            content=content_str,
            user_context=request.user_context
        )
        
        # Run analysis
        return await self.provider.analyze_text(prompt)
    
    async def analyze_image(
        self, 
        image_bytes: bytes, 
        user_context: Optional[str] = None
    ) -> AnalyzeResponse:
        """
        Analyze ingredients from an image.
        
        Args:
            image_bytes: Raw image bytes (JPEG, PNG, etc.)
            user_context: Optional user context for personalized analysis
            
        Returns:
            AnalyzeResponse with structured insights
        """
        # Generate the image analysis prompt
        prompt = get_image_analysis_prompt(user_context=user_context)
        
        # Run vision analysis
        return await self.provider.analyze_image(image_bytes, prompt)


# Singleton instance
_analyzer: Optional[IngredientAnalyzer] = None


def get_analyzer() -> IngredientAnalyzer:
    """Get or create the analyzer singleton."""
    global _analyzer
    if _analyzer is None:
        _analyzer = IngredientAnalyzer()
    return _analyzer
