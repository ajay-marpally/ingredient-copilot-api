"""
User repository - MongoDB operations for users.
"""

from datetime import datetime
from typing import Optional
from bson import ObjectId

from app.database.mongodb import get_collection
from app.models.auth import UserCreate, UserInDB
from app.services.auth import hash_password


class UserRepository:
    """MongoDB repository for user operations."""
    
    def __init__(self):
        self.collection_name = "users"
    
    @property
    def collection(self):
        return get_collection(self.collection_name)
    
    async def create(self, user_data: UserCreate) -> UserInDB:
        """Create a new user."""
        user_doc = {
            "email": user_data.email.lower(),
            "name": user_data.name,
            "hashed_password": hash_password(user_data.password),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        result = await self.collection.insert_one(user_doc)
        user_doc["id"] = str(result.inserted_id)
        
        return UserInDB(
            id=user_doc["id"],
            email=user_doc["email"],
            name=user_doc["name"],
            hashed_password=user_doc["hashed_password"],
            created_at=user_doc["created_at"]
        )
    
    async def get_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        user_doc = await self.collection.find_one({"email": email.lower()})
        
        if not user_doc:
            return None
        
        return UserInDB(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            name=user_doc["name"],
            hashed_password=user_doc["hashed_password"],
            created_at=user_doc["created_at"]
        )
    
    async def get_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID."""
        try:
            user_doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
        
        if not user_doc:
            return None
        
        return UserInDB(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            name=user_doc["name"],
            hashed_password=user_doc["hashed_password"],
            created_at=user_doc["created_at"]
        )
    
    async def exists(self, email: str) -> bool:
        """Check if user exists."""
        count = await self.collection.count_documents({"email": email.lower()})
        return count > 0
    
    async def update(self, user_id: str, update_data: dict) -> Optional[UserInDB]:
        """Update user data."""
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        try:
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                return_document=True
            )
        except Exception:
            return None
        
        if not result:
            return None
        
        return UserInDB(
            id=str(result["_id"]),
            email=result["email"],
            name=result["name"],
            hashed_password=result["hashed_password"],
            created_at=result["created_at"]
        )
    
    async def delete(self, user_id: str) -> bool:
        """Delete a user."""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception:
            return False


# Singleton instance
_user_repo: Optional[UserRepository] = None


def get_user_repository() -> UserRepository:
    """Get the user repository instance."""
    global _user_repo
    if _user_repo is None:
        _user_repo = UserRepository()
    return _user_repo
