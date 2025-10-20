"""
Cloud Storage cache utilities for persistent data storage.
"""

import json
import logging
import os
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# GCS Configuration
BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "tco-calculator-cache")
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "calcium-land-466213-e0")

def _get_gcs_client():
    """Get or create GCS client."""
    try:
        from google.cloud import storage
        return storage.Client(project=PROJECT_ID)
    except Exception as e:
        logger.error(f"Failed to create GCS client: {e}")
        return None


def upload_to_gcs(local_path: Path, gcs_path: str) -> bool:
    """
    Upload a file to Google Cloud Storage.
    
    Args:
        local_path: Local file path
        gcs_path: Path in GCS bucket (e.g., 'cache/energy_prices_live.json')
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = _get_gcs_client()
        if not client:
            logger.warning("GCS client not available, skipping upload")
            return False
        
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_path)
        
        blob.upload_from_filename(str(local_path))
        logger.info(f"✅ Uploaded {local_path.name} to gs://{BUCKET_NAME}/{gcs_path}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to upload to GCS: {e}")
        return False


def download_from_gcs(gcs_path: str, local_path: Path) -> bool:
    """
    Download a file from Google Cloud Storage.
    
    Args:
        gcs_path: Path in GCS bucket
        local_path: Local destination path
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = _get_gcs_client()
        if not client:
            logger.warning("GCS client not available, skipping download")
            return False
        
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_path)
        
        if not blob.exists():
            logger.warning(f"File not found in GCS: gs://{BUCKET_NAME}/{gcs_path}")
            return False
        
        # Ensure local directory exists
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        blob.download_to_filename(str(local_path))
        logger.info(f"✅ Downloaded gs://{BUCKET_NAME}/{gcs_path} to {local_path.name}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to download from GCS: {e}")
        return False


def save_json_to_gcs(data: Dict[Any, Any], gcs_path: str) -> bool:
    """
    Save JSON data directly to GCS without local file.
    
    Args:
        data: Dictionary to save as JSON
        gcs_path: Path in GCS bucket
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = _get_gcs_client()
        if not client:
            logger.warning("GCS client not available, skipping save")
            return False
        
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_path)
        
        json_string = json.dumps(data, indent=2)
        blob.upload_from_string(json_string, content_type='application/json')
        
        logger.info(f"✅ Saved JSON to gs://{BUCKET_NAME}/{gcs_path}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to save JSON to GCS: {e}")
        return False


def load_json_from_gcs(gcs_path: str) -> Optional[Dict[Any, Any]]:
    """
    Load JSON data directly from GCS.
    
    Args:
        gcs_path: Path in GCS bucket
    
    Returns:
        Dictionary if successful, None otherwise
    """
    try:
        client = _get_gcs_client()
        if not client:
            logger.warning("GCS client not available")
            return None
        
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_path)
        
        if not blob.exists():
            logger.warning(f"File not found in GCS: gs://{BUCKET_NAME}/{gcs_path}")
            return None
        
        json_string = blob.download_as_text()
        data = json.loads(json_string)
        
        logger.info(f"✅ Loaded JSON from gs://{BUCKET_NAME}/{gcs_path}")
        return data
        
    except Exception as e:
        logger.error(f"❌ Failed to load JSON from GCS: {e}")
        return None


def get_cache_age_hours(gcs_path: str) -> Optional[float]:
    """
    Get age of cached file in hours.
    
    Args:
        gcs_path: Path in GCS bucket
    
    Returns:
        Age in hours if file exists, None otherwise
    """
    try:
        client = _get_gcs_client()
        if not client:
            return None
        
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_path)
        
        if not blob.exists():
            return None
        
        blob.reload()  # Get latest metadata
        updated = blob.updated
        
        if updated:
            age = (datetime.now(updated.tzinfo) - updated).total_seconds() / 3600
            return round(age, 1)
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to get cache age: {e}")
        return None
