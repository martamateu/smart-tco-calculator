"""
Materials router - provides semiconductor material catalog.
"""

from fastapi import APIRouter, HTTPException
from typing import List
import logging

from backend.models.schemas import Material
from backend.services.data_access import get_materials_catalog

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/materials", response_model=List[Material])
async def get_materials():
    """
    Get list of all available semiconductor materials.
    
    Returns:
        List of materials with properties and costs
    """
    try:
        materials = get_materials_catalog()
        logger.info(f"📦 Retrieved {len(materials)} materials")
        return materials
    
    except Exception as e:
        logger.error(f"❌ Failed to retrieve materials: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/materials/{material_id}", response_model=Material)
async def get_material(material_id: str):
    """
    Get details for a specific material.
    
    Args:
        material_id: Material identifier (e.g., 'sic', 'gan')
    
    Returns:
        Material details
    """
    try:
        materials = get_materials_catalog()
        material = next((m for m in materials if m.id == material_id), None)
        
        if not material:
            raise HTTPException(
                status_code=404,
                detail=f"Material '{material_id}' not found"
            )
        
        logger.info(f"📦 Retrieved material: {material.name}")
        return material
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to retrieve material {material_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
