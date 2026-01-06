"""
Authentication models for the API.
"""

from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=1, max_length=100, description="User's display name")


class UserCreate(UserBase):
    """Model for user registration."""
    password: str = Field(..., min_length=6, max_length=100, description="User password (min 6 characters)")


class UserLogin(BaseModel):
    """Model for user login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserResponse(UserBase):
    """Model for user response (without password)."""
    id: str = Field(..., description="User ID")
    created_at: str = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True


class UserInDB(UserBase):
    """Model for user stored in database."""
    id: str
    hashed_password: str
    created_at: str


class Token(BaseModel):
    """JWT token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")


class TokenData(BaseModel):
    """Data encoded in JWT token."""
    user_id: Optional[str] = None
    email: Optional[str] = None
