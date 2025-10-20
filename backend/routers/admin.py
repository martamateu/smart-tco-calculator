"""
Admin router - Endpoints for automated data updates and maintenance.
These endpoints are called by Cloud Scheduler jobs.
"""

import logging
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks, Request
from typing import Optional
from datetime import datetime

from backend.utils.data_audit import DataAudit
from backend.utils.fetch_energy_prices import update_energy_cache
from backend.utils.fetch_eia_prices import update_eia_prices_cache
from backend.train_tco_model import train_model

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger(__name__)

# Simple auth for admin endpoints (in production, use proper authentication)
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "dev-only-key-please-change")


def verify_admin_auth(
    request: Request,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Verify admin authentication using either:
    1. OIDC token from Cloud Scheduler (production - more secure)
    2. Admin API key (manual testing)
    """
    # Check if request has OIDC token (from Cloud Scheduler)
    # Cloud Run automatically validates OIDC tokens, so if the request reaches here, it's authenticated
    # We can check for the presence of Google OIDC headers
    if authorization and authorization.startswith("Bearer "):
        # OIDC token present - request from Cloud Scheduler is already authenticated by Cloud Run
        logger.info("✅ Authenticated via OIDC token (Cloud Scheduler)")
        return True
    
    # Fallback to API key for manual testing
    if x_api_key == ADMIN_API_KEY:
        logger.info("✅ Authenticated via Admin API Key")
        return True
    
    logger.warning("❌ Authentication failed - no valid OIDC token or API key")
    raise HTTPException(
        status_code=401,
        detail="Unauthorized - requires OIDC token (Cloud Scheduler) or valid API key"
    )


@router.get("/audit-data")
async def run_data_audit(
    request: Request,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Run comprehensive data audit and return report.
    Called by Cloud Scheduler daily at 6 AM.
    """
    verify_admin_auth(request, x_api_key, authorization)
    
    logger.info("🔍 Running scheduled data audit...")
    
    try:
        auditor = DataAudit()
        results = auditor.run_full_audit()
        auditor.save_report()
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "healthy_data": len(results["healthy_data"]),
                "expired_data": len(results["expired_data"]),
                "missing_data": len(results["missing_data"]),
                "ml_models": len(results["ml_models"]),
                "rag_documents": sum(s.get('total_documents', 0) for s in results["rag_knowledge_base"])
            },
            "recommendations": results["recommendations"],
            "report_path": str(Path(__file__).parent.parent / "data" / "audit_report.json")
        }
    
    except Exception as e:
        logger.error(f"❌ Data audit failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/update-energy-prices")
async def update_energy_prices(
    request: Request,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Fetch latest energy prices from ENTSO-E API.
    Called by Cloud Scheduler every 12 hours.
    
    DEPRECATED: Use /refresh-prices/entsoe instead
    """
    verify_admin_auth(request, x_api_key, authorization)
    
    logger.info("⚡ Starting energy price update...")
    
    # Get API key from environment
    entsoe_api_key = os.getenv("ENTSOE_API_KEY")
    if not entsoe_api_key:
        raise HTTPException(
            status_code=500,
            detail="ENTSOE_API_KEY not configured in environment"
        )
    
    try:
        # Run update in background
        def update_prices():
            try:
                update_energy_cache(entsoe_api_key)
                logger.info("✅ Energy prices updated successfully")
            except Exception as e:
                logger.error(f"❌ Energy price update failed: {e}")
        
        background_tasks.add_task(update_prices)
        
        return {
            "status": "started",
            "message": "Energy price update started in background",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Failed to start energy price update: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh-prices/entsoe")
async def refresh_entsoe_prices(
    request: Request,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Fetch latest EU electricity prices from ENTSO-E Transparency Platform.
    Called by Cloud Scheduler every 8 hours.
    
    Updates live cache for: Germany, France, Italy, Spain, Netherlands, 
    Poland, Belgium, Denmark, Austria, Czech Republic, Finland, Greece, 
    Hungary, Ireland, Portugal, Romania, Slovakia, Slovenia, Sweden (19 countries).
    """
    verify_admin_auth(request, x_api_key, authorization)
    
    logger.info("🇪🇺 Starting ENTSO-E price update...")
    
    # Get API key from environment
    entsoe_api_key = os.getenv("ENTSOE_API_KEY")
    if not entsoe_api_key:
        raise HTTPException(
            status_code=500,
            detail="ENTSOE_API_KEY not configured in environment"
        )
    
    try:
        # Run update in background
        def update_prices():
            try:
                cache_path = Path(__file__).parent.parent / "data" / "cache" / "energy_prices_live.json"
                update_energy_cache(entsoe_api_key, cache_path)
                logger.info("✅ ENTSO-E prices updated successfully")
            except Exception as e:
                logger.error(f"❌ ENTSO-E price update failed: {e}")
        
        background_tasks.add_task(update_prices)
        
        return {
            "status": "started",
            "source": "ENTSO-E Transparency Platform",
            "regions": "19 EU countries",
            "message": "ENTSO-E price update started in background",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Failed to start ENTSO-E price update: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh-prices/eia")
async def refresh_eia_prices(
    request: Request,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Fetch latest USA electricity prices from EIA API.
    Called by Cloud Scheduler daily at 6 AM EST.
    
    Updates live cache for: California, Texas, Arizona, Ohio, New York (5 states).
    """
    verify_admin_auth(request, x_api_key, authorization)
    
    logger.info("🇺🇸 Starting EIA price update...")
    
    # Get API key from environment
    eia_api_key = os.getenv("EIA_API_KEY")
    if not eia_api_key:
        raise HTTPException(
            status_code=500,
            detail="EIA_API_KEY not configured in environment"
        )
    
    try:
        # Run update in background
        def update_prices():
            try:
                update_eia_prices_cache()  # Function gets API key from environment internally
                logger.info("✅ EIA prices updated successfully")
            except Exception as e:
                logger.error(f"❌ EIA price update failed: {e}")
        
        background_tasks.add_task(update_prices)
        
        return {
            "status": "started",
            "source": "EIA Electricity Data Browser",
            "states": ["California", "Texas", "Arizona", "Ohio", "New York"],
            "message": "EIA price update started in background",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Failed to start EIA price update: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrain-model")
async def retrain_ml_model(
    request: Request,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Retrain Random Forest TCO prediction model.
    Called by Cloud Scheduler weekly on Sunday at 2 AM.
    """
    verify_admin_auth(request, x_api_key, authorization)
    
    logger.info("🤖 Starting model retraining...")
    
    try:
        # Run training in background
        def retrain():
            try:
                train_model()
                logger.info("✅ Model retrained successfully")
            except Exception as e:
                logger.error(f"❌ Model retraining failed: {e}")
        
        background_tasks.add_task(retrain)
        
        return {
            "status": "started",
            "message": "Model retraining started in background",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"❌ Failed to start model retraining: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-check")
async def health_check():
    """
    Health check endpoint for monitoring.
    Returns data freshness and system status.
    """
    auditor = DataAudit()
    
    # Quick audit (don't print full report)
    energy_audit = auditor.audit_energy_prices()
    model_audit = auditor.audit_random_forest_model()
    rag_audit = auditor.audit_rag_documents()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "data_status": {
            "energy_prices": {
                "status": energy_audit["status"],
                "age_hours": energy_audit.get("age_hours")
            },
            "ml_model": {
                "status": model_audit["status"],
                "loaded": model_audit.get("model_loaded", False)
            },
            "rag_documents": {
                "status": rag_audit["status"],
                "total": rag_audit.get("total_documents", 0)
            }
        },
        "needs_attention": [
            f"Energy prices: {energy_audit['message']}" if energy_audit["status"] != "healthy" else None,
            f"ML model: {model_audit['message']}" if model_audit["status"] not in ["healthy", "warning"] else None,
            f"RAG docs: {rag_audit['message']}" if rag_audit["status"] != "healthy" else None
        ]
    }


@router.get("/status")
async def get_system_status():
    """
    Get current system status without running full audit.
    Public endpoint for monitoring dashboards.
    """
    cache_file = Path(__file__).parent.parent / "data" / "cache" / "energy_prices_live.json"
    model_file = Path(__file__).parent.parent / "models" / "tco_random_forest.pkl"
    
    return {
        "timestamp": datetime.now().isoformat(),
        "energy_prices_available": cache_file.exists(),
        "ml_model_available": model_file.exists(),
        "rag_engine_status": "operational",
        "api_version": "1.0.0"
    }


@router.get("/cache-status")
async def get_cache_status():
    """
    Get detailed cache status for debugging price updates.
    Public endpoint - no auth required.
    """
    import json
    from datetime import datetime, timezone
    
    entso_cache = Path(__file__).parent.parent / "data" / "cache" / "energy_prices_live.json"
    eia_cache = Path(__file__).parent.parent / "data" / "eia_prices_cache.json"
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "entso_cache": {},
        "eia_cache": {}
    }
    
    # Check ENTSO-E cache
    if entso_cache.exists():
        try:
            with open(entso_cache) as f:
                data = json.load(f)
            last_update = data.get("metadata", {}).get("last_update")
            if last_update:
                last_update_dt = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                age_hours = (datetime.now(timezone.utc) - last_update_dt).total_seconds() / 3600
            else:
                age_hours = None
            
            result["entso_cache"] = {
                "exists": True,
                "last_update": last_update,
                "age_hours": round(age_hours, 1) if age_hours else None,
                "regions_count": data.get("metadata", {}).get("regions_covered", 0),
                "file_size_kb": round(entso_cache.stat().st_size / 1024, 2)
            }
        except Exception as e:
            result["entso_cache"] = {"exists": True, "error": str(e)}
    else:
        result["entso_cache"] = {"exists": False}
    
    # Check EIA cache
    if eia_cache.exists():
        try:
            with open(eia_cache) as f:
                data = json.load(f)
            last_update = data.get("last_updated")
            if last_update:
                last_update_dt = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                age_hours = (datetime.now(timezone.utc) - last_update_dt).total_seconds() / 3600
            else:
                age_hours = None
                
            result["eia_cache"] = {
                "exists": True,
                "last_update": last_update,
                "age_hours": round(age_hours, 1) if age_hours else None,
                "states_count": len(data.get("prices", {})),
                "file_size_kb": round(eia_cache.stat().st_size / 1024, 2)
            }
        except Exception as e:
            result["eia_cache"] = {"exists": True, "error": str(e)}
    else:
        result["eia_cache"] = {"exists": False}
    
    return result
