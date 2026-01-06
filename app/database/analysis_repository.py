"""
Analysis history repository - MongoDB operations for analysis history.
"""

from datetime import datetime
from typing import Optional, List
from bson import ObjectId

from app.database.mongodb import get_collection
from app.models.response import AnalyzeResponse


class AnalysisHistoryRepository:
    """MongoDB repository for analysis history operations."""
    
    def __init__(self):
        self.collection_name = "analysis_history"
    
    @property
    def collection(self):
        return get_collection(self.collection_name)
    
    async def save_analysis(
        self,
        user_id: str,
        input_type: str,
        content: str,
        user_context: Optional[str],
        result: AnalyzeResponse
    ) -> str:
        """Save an analysis to history."""
        doc = {
            "user_id": user_id,
            "input_type": input_type,
            "content": content,
            "user_context": user_context,
            "result": {
                "summary": result.summary,
                "key_concerns": result.key_concerns,
                "positives": result.positives,
                "confidence_level": result.confidence_level,
                "uncertainty_notes": result.uncertainty_notes,
                "ingredient_insights": [
                    {
                        "name": i.name,
                        "concern_level": i.concern_level,
                        "brief": i.brief
                    }
                    for i in result.ingredient_insights
                ],
                "reasoning_time_ms": result.reasoning_time_ms
            },
            "created_at": datetime.utcnow().isoformat(),
        }
        
        result_insert = await self.collection.insert_one(doc)
        return str(result_insert.inserted_id)
    
    async def get_by_id(self, analysis_id: str) -> Optional[dict]:
        """Get analysis by ID."""
        try:
            doc = await self.collection.find_one({"_id": ObjectId(analysis_id)})
        except Exception:
            return None
        
        if not doc:
            return None
        
        doc["id"] = str(doc.pop("_id"))
        return doc
    
    async def get_user_history(
        self,
        user_id: str,
        limit: int = 20,
        skip: int = 0
    ) -> List[dict]:
        """Get user's analysis history."""
        cursor = self.collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        history = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            history.append(doc)
        
        return history
    
    async def get_user_history_count(self, user_id: str) -> int:
        """Get count of user's analysis history."""
        return await self.collection.count_documents({"user_id": user_id})
    
    async def delete(self, analysis_id: str, user_id: str) -> bool:
        """Delete an analysis (only if owned by user)."""
        try:
            result = await self.collection.delete_one({
                "_id": ObjectId(analysis_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception:
            return False
    
    async def delete_all_for_user(self, user_id: str) -> int:
        """Delete all analysis history for a user."""
        result = await self.collection.delete_many({"user_id": user_id})
        return result.deleted_count


# Singleton instance
_history_repo: Optional[AnalysisHistoryRepository] = None


def get_analysis_history_repository() -> AnalysisHistoryRepository:
    """Get the analysis history repository instance."""
    global _history_repo
    if _history_repo is None:
        _history_repo = AnalysisHistoryRepository()
    return _history_repo
