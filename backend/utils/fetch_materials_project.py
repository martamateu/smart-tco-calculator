"""
Fetch and update semiconductor material properties from Materials Project API.

This module updates physical properties (band gap, density, formation energy)
while preserving manual data (costs, TRL, carbon footprint).
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

try:
    from mp_api.client import MPRester
    MP_API_AVAILABLE = True
except ImportError:
    MP_API_AVAILABLE = False
    print("⚠️  mp-api not installed. Run: pip install mp-api")


def get_materials_project_api_key() -> str:
    """Get Materials Project API key from environment."""
    api_key = os.getenv("MATERIALS_PROJECT_API_KEY")
    if not api_key:
        raise ValueError("MATERIALS_PROJECT_API_KEY not found in environment")
    return api_key


def fetch_material_properties(material_id: str, api_key: str) -> Optional[Dict]:
    """
    Fetch material properties from Materials Project API.
    
    Args:
        material_id: Materials Project ID (e.g., 'mp-149')
        api_key: Materials Project API key
        
    Returns:
        Dict with band_gap_ev, density_g_cm3, formation_energy_ev_atom, is_stable
        or None if fetch fails
    """
    if not MP_API_AVAILABLE:
        print(f"   ⚠️  Skipping {material_id}: mp-api not available")
        return None
    
    try:
        with MPRester(api_key) as mpr:
            # Get material data
            docs = mpr.materials.summary.search(
                material_ids=[material_id],
                fields=[
                    "material_id",
                    "band_gap",
                    "density",
                    "formation_energy_per_atom",
                    "is_stable"
                ]
            )
            
            if not docs:
                print(f"   ⚠️  Material {material_id} not found in Materials Project")
                return None
            
            doc = docs[0]
            
            return {
                "band_gap_ev": float(doc.band_gap) if doc.band_gap is not None else 0.0,
                "density_g_cm3": float(doc.density) if doc.density is not None else 0.0,
                "formation_energy_ev_atom": float(doc.formation_energy_per_atom) if doc.formation_energy_per_atom is not None else 0.0,
                "is_stable": bool(doc.is_stable) if doc.is_stable is not None else False
            }
            
    except Exception as e:
        print(f"   ❌ Error fetching {material_id}: {e}")
        return None


def update_materials_database(dry_run: bool = False) -> Dict[str, any]:
    """
    Update semiconductors_comprehensive.json with latest Materials Project data.
    
    Args:
        dry_run: If True, show what would be updated without saving
        
    Returns:
        Dict with update statistics
    """
    if not MP_API_AVAILABLE:
        return {
            "success": False,
            "error": "mp-api package not installed",
            "updated": 0,
            "failed": 0,
            "skipped": 0
        }
    
    # Load current database
    data_dir = Path(__file__).parent.parent / "data"
    json_path = data_dir / "semiconductors_comprehensive.json"
    
    if not json_path.exists():
        return {
            "success": False,
            "error": f"Database file not found: {json_path}",
            "updated": 0,
            "failed": 0,
            "skipped": 0
        }
    
    with open(json_path, 'r', encoding='utf-8') as f:
        materials = json.load(f)
    
    print(f"\n📊 Updating {len(materials)} materials from Materials Project API...")
    
    api_key = get_materials_project_api_key()
    
    stats = {
        "success": True,
        "updated": 0,
        "failed": 0,
        "skipped": 0,
        "changes": []
    }
    
    for material in materials:
        material_id = material.get("material_id")
        formula = material.get("formula", "Unknown")
        
        if not material_id:
            print(f"   ⏭️  Skipping {formula}: no material_id")
            stats["skipped"] += 1
            continue
        
        print(f"   🔄 Fetching {formula} ({material_id})...")
        
        new_props = fetch_material_properties(material_id, api_key)
        
        if new_props is None:
            stats["failed"] += 1
            continue
        
        # Track changes
        changes = {}
        for key, new_value in new_props.items():
            old_value = material.get(key)
            if old_value != new_value:
                changes[key] = {
                    "old": old_value,
                    "new": new_value
                }
                material[key] = new_value
        
        if changes:
            stats["updated"] += 1
            stats["changes"].append({
                "formula": formula,
                "material_id": material_id,
                "changes": changes
            })
            print(f"      ✅ Updated {len(changes)} properties")
        else:
            print(f"      ✓  No changes needed")
    
    # Save updated database
    if not dry_run and stats["updated"] > 0:
        # Backup old file
        backup_path = json_path.with_suffix('.json.bak')
        json_path.rename(backup_path)
        print(f"\n💾 Backup saved to: {backup_path.name}")
        
        # Save new file
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(materials, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Database updated: {json_path}")
        
        # Upload to GCS for persistence
        try:
            from backend.utils.gcs_cache import upload_to_gcs
            gcs_path = "data/semiconductors_comprehensive.json"
            upload_to_gcs(str(json_path), gcs_path)
            print(f"☁️  Uploaded to Cloud Storage: gs://tco-calculator-cache/{gcs_path}")
        except Exception as e:
            print(f"⚠️  Failed to upload to GCS: {e}")
    
    elif dry_run:
        print("\n🔍 DRY RUN - No changes saved")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📈 Update Summary:")
    print(f"   ✅ Updated: {stats['updated']}")
    print(f"   ❌ Failed:  {stats['failed']}")
    print(f"   ⏭️  Skipped: {stats['skipped']}")
    print(f"{'='*60}\n")
    
    stats["timestamp"] = datetime.utcnow().isoformat()
    
    return stats


def get_materials_update_status() -> Dict[str, any]:
    """
    Get status of materials database (last update time, material count).
    
    Returns:
        Dict with database status info
    """
    data_dir = Path(__file__).parent.parent / "data"
    json_path = data_dir / "semiconductors_comprehensive.json"
    
    if not json_path.exists():
        return {
            "exists": False,
            "error": "Database file not found"
        }
    
    stat = json_path.stat()
    
    with open(json_path, 'r', encoding='utf-8') as f:
        materials = json.load(f)
    
    # Calculate how old the data is
    modified_time = datetime.fromtimestamp(stat.st_mtime)
    age_hours = (datetime.now() - modified_time).total_seconds() / 3600
    
    return {
        "exists": True,
        "file_path": str(json_path),
        "material_count": len(materials),
        "file_size_kb": round(stat.st_size / 1024, 2),
        "last_modified": modified_time.isoformat(),
        "age_hours": round(age_hours, 1),
        "api_available": MP_API_AVAILABLE
    }


if __name__ == "__main__":
    # Test script
    print("🧪 Testing Materials Project API connection...\n")
    
    # Check status
    status = get_materials_update_status()
    print(f"📁 Database Status:")
    print(json.dumps(status, indent=2))
    
    # Dry run update
    print("\n" + "="*60)
    result = update_materials_database(dry_run=True)
    print("\n📊 Update Result:")
    print(json.dumps(result, indent=2))
