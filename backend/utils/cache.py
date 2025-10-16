"""
Simple in-memory cache for API responses.
"""

import time
from typing import Any, Optional
from functools import wraps
import hashlib
import json


class SimpleCache:
    """Thread-safe in-memory cache"""
    
    def __init__(self, ttl_seconds: int = 300):
        self.cache = {}
        self.ttl = ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any):
        """Set value in cache"""
        self.cache[key] = (value, time.time())
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()


# Global cache instance
cache = SimpleCache(ttl_seconds=300)


def cached(ttl: int = 300):
    """
    Decorator for caching function results.
    
    Usage:
        @cached(ttl=600)
        async def expensive_function(param1, param2):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            key_data = {
                "func": func.__name__,
                "args": args,
                "kwargs": kwargs
            }
            key_str = json.dumps(key_data, sort_keys=True, default=str)
            cache_key = hashlib.md5(key_str.encode()).hexdigest()
            
            # Try cache first
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result)
            
            return result
        
        return wrapper
    return decorator
