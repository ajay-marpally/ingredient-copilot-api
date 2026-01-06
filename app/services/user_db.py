"""
Simple in-memory user database.
In production, replace with a real database (PostgreSQL, MongoDB, etc.)
"""

import json
import os
from typing import Optional, Dict
from datetime import datetime

from app.models.auth import UserInDB, UserCreate
from app.services.auth import hash_password


# File-based storage for persistence across restarts
USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "users.json")


class UserDatabase:
    """Simple file-based user storage."""
    
    def __init__(self):
        self.users: Dict[str, UserInDB] = {}
        self._load()
    
    def _load(self):
        """Load users from file."""
        try:
            if os.path.exists(USERS_FILE):
                with open(USERS_FILE, "r") as f:
                    data = json.load(f)
                    for user_data in data:
                        user = UserInDB(**user_data)
                        self.users[user.email.lower()] = user
        except Exception as e:
            print(f"Warning: Could not load users: {e}")
    
    def _save(self):
        """Save users to file."""
        try:
            data = [user.model_dump() for user in self.users.values()]
            with open(USERS_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save users: {e}")
    
    def get_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        return self.users.get(email.lower())
    
    def get_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID."""
        for user in self.users.values():
            if user.id == user_id:
                return user
        return None
    
    def create(self, user_data: UserCreate) -> UserInDB:
        """Create a new user."""
        user = UserInDB(
            id=str(len(self.users) + 1),
            email=user_data.email.lower(),
            name=user_data.name,
            hashed_password=hash_password(user_data.password),
            created_at=datetime.utcnow().isoformat()
        )
        self.users[user.email] = user
        self._save()
        return user
    
    def exists(self, email: str) -> bool:
        """Check if user exists."""
        return email.lower() in self.users


# Singleton instance
_db: Optional[UserDatabase] = None


def get_user_db() -> UserDatabase:
    """Get the user database instance."""
    global _db
    if _db is None:
        _db = UserDatabase()
    return _db
