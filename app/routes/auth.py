"""
Authentication routes for the API.
"""

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Header

from app.models.auth import UserCreate, UserLogin, UserResponse, Token
from app.services.auth import (
    verify_password,
    create_access_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database.user_repository import get_user_repository


router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(authorization: Optional[str] = Header(None)) -> UserResponse:
    """
    Dependency to get the current authenticated user from the Authorization header.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    repo = get_user_repository()
    user = await repo.get_by_id(token_data.user_id)
    
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at
    )


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[UserResponse]:
    """
    Dependency to optionally get the current user (doesn't raise if not authenticated).
    """
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


@router.post("/register", response_model=Token, summary="Register a new user")
async def register(user_data: UserCreate):
    """
    Register a new user account.
    
    - **name**: User's display name
    - **email**: User's email address (must be unique)
    - **password**: Password (minimum 6 characters)
    
    Returns a JWT token for immediate authentication.
    """
    repo = get_user_repository()
    
    # Check if user already exists
    if await repo.exists(user_data.email):
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists"
        )
    
    # Create user
    user = await repo.create(user_data)
    
    # Generate token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at
        )
    )


@router.post("/login", response_model=Token, summary="Login to get access token")
async def login(credentials: UserLogin):
    """
    Authenticate with email and password.
    
    Returns a JWT token for subsequent authenticated requests.
    """
    repo = get_user_repository()
    
    # Find user
    user = await repo.get_by_email(credentials.email)
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Generate token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at
        )
    )


@router.get("/me", response_model=UserResponse, summary="Get current user")
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get the currently authenticated user's information.
    
    Requires a valid JWT token in the Authorization header.
    """
    return current_user


@router.post("/logout", summary="Logout (client-side)")
async def logout():
    """
    Logout endpoint.
    
    Note: Since we use stateless JWT tokens, logout is handled client-side
    by removing the token. This endpoint is provided for API completeness.
    """
    return {"message": "Successfully logged out", "detail": "Please remove the token from client storage"}
