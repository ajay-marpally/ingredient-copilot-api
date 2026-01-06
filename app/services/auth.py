"""
Authentication utilities - password hashing and JWT handling.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets
import json
import base64

from app.models.auth import TokenData


# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt."""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        salt, password_hash = hashed_password.split(":")
        return hashlib.sha256((plain_password + salt).encode()).hexdigest() == password_hash
    except ValueError:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT-like access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire.isoformat()})
    
    # Create a simple signed token (in production, use proper JWT library)
    payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode()
    signature = hashlib.sha256((payload + SECRET_KEY).encode()).hexdigest()[:32]
    
    return f"{payload}.{signature}"


def decode_access_token(token: str) -> Optional[TokenData]:
    """Decode and verify an access token."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        
        payload, signature = parts
        
        # Verify signature
        expected_signature = hashlib.sha256((payload + SECRET_KEY).encode()).hexdigest()[:32]
        if signature != expected_signature:
            return None
        
        # Decode payload
        data = json.loads(base64.urlsafe_b64decode(payload.encode()).decode())
        
        # Check expiration
        exp = datetime.fromisoformat(data.get("exp", ""))
        if datetime.utcnow() > exp:
            return None
        
        return TokenData(user_id=data.get("user_id"), email=data.get("email"))
    
    except Exception:
        return None
