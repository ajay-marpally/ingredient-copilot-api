"""
Analysis history routes for the API.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, Query

from app.models.auth import UserResponse
from app.models.request import SaveHistoryRequest
from app.routes.auth import get_current_user
from app.database.analysis_repository import get_analysis_history_repository


router = APIRouter(prefix="/history", tags=["History"])


@router.post("", summary="Save analysis to history")
async def save_history(
    request: SaveHistoryRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Save an analysis result to history.
    
    This endpoint allows saving analysis results from external API calls
    to the user's history.
    """
    repo = get_analysis_history_repository()
    
    content = request.content if isinstance(request.content, str) else ", ".join(request.content)
    
    # Create document directly since we have raw data, not AnalyzeResponse
    doc = {
        "user_id": current_user.id,
        "input_type": request.input_type,
        "content": content,
        "user_context": request.user_context,
        "result": {
            "summary": request.result.summary,
            "key_concerns": request.result.key_concerns,
            "positives": request.result.positives,
            "confidence_level": request.result.confidence_level,
            "uncertainty_notes": request.result.uncertainty_notes,
            "ingredient_insights": [
                {
                    "name": i.name,
                    "concern_level": i.concern_level,
                    "brief": i.brief
                }
                for i in request.result.ingredient_insights
            ],
            "reasoning_time_ms": request.result.reasoning_time_ms
        },
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = await repo.collection.insert_one(doc)
    
    return {
        "id": str(result.inserted_id),
        "message": "Analysis saved to history"
    }


@router.get("", summary="Get user's analysis history")
async def get_history(
    limit: int = Query(default=20, ge=1, le=100, description="Number of items to return"),
    skip: int = Query(default=0, ge=0, description="Number of items to skip"),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get the current user's analysis history.
    
    Returns a paginated list of past ingredient analyses.
    """
    repo = get_analysis_history_repository()
    history = await repo.get_user_history(current_user.id, limit=limit, skip=skip)
    count = await repo.get_user_history_count(current_user.id)
    
    return {
        "items": history,
        "total": count,
        "limit": limit,
        "skip": skip
    }


@router.get("/{analysis_id}", summary="Get a specific analysis")
async def get_analysis(
    analysis_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get a specific analysis by ID.
    
    Only returns analyses belonging to the current user.
    """
    repo = get_analysis_history_repository()
    analysis = await repo.get_by_id(analysis_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Verify ownership
    if analysis.get("user_id") != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis


@router.delete("/{analysis_id}", summary="Delete an analysis")
async def delete_analysis(
    analysis_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a specific analysis by ID.
    
    Only allows deleting analyses belonging to the current user.
    """
    repo = get_analysis_history_repository()
    success = await repo.delete(analysis_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {"message": "Analysis deleted successfully"}


@router.delete("", summary="Clear all history")
async def clear_history(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete all analyses for the current user.
    """
    repo = get_analysis_history_repository()
    deleted_count = await repo.delete_all_for_user(current_user.id)
    
    return {
        "message": f"Deleted {deleted_count} analyses",
        "deleted_count": deleted_count
    }
