"""
Regions router - provides geographic region data with energy costs and subsidies.
"""

from fastapi import APIRouter, HTTPException
from typing import List
import logging

from backend.models.schemas import Region
from backend.services.data_access import get_regions_catalog

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/regions", response_model=List[Region])
async def get_regions():
    """
    Get list of all available geographic regions.
    
    Returns:
        List of regions with energy costs, carbon tax, and subsidy info
    """
    try:
        regions = get_regions_catalog()
        logger.info(f"🌍 Retrieved {len(regions)} regions")
        return regions
    
    except Exception as e:
        logger.error(f"❌ Failed to retrieve regions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regions/{region_code}", response_model=Region)
async def get_region(region_code: str):
    """
    Get details for a specific region.
    
    Args:
        region_code: Region code (e.g., 'EU', 'USA', 'Germany')
    
    Returns:
        Region details
    """
    try:
        regions = get_regions_catalog()
        region = next((r for r in regions if r.code == region_code), None)
        
        if not region:
            raise HTTPException(
                status_code=404,
                detail=f"Region '{region_code}' not found"
            )
        
        logger.info(f"🌍 Retrieved region: {region.name}")
        return region
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to retrieve region {region_code}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
