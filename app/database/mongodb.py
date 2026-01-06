"""
MongoDB database connection and configuration.
"""

import os
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure

# MongoDB configuration from environment
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ingredient_pal")

# Global database client
_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongodb():
    """Connect to MongoDB database."""
    global _client, _database
    
    try:
        _client = AsyncIOMotorClient(MONGODB_URL)
        _database = _client[MONGODB_DB_NAME]
        
        # Test connection
        await _client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")
        
        # Create indexes
        await create_indexes()
        
    except ConnectionFailure as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection."""
    global _client
    
    if _client:
        _client.close()
        print("👋 Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for better performance."""
    global _database
    
    if _database is None:
        return
    
    # Users collection indexes
    await _database.users.create_index("email", unique=True)
    
    # Analysis history indexes
    await _database.analysis_history.create_index("user_id")
    await _database.analysis_history.create_index("created_at")
    await _database.analysis_history.create_index([("user_id", 1), ("created_at", -1)])
    
    print("✅ Database indexes created")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    global _database
    
    if _database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")
    
    return _database


def get_collection(name: str):
    """Get a collection from the database."""
    db = get_database()
    return db[name]
