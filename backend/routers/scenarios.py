"""
Scenarios router - provides scenario analysis data for charting.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from backend.models.schemas import ScenarioResponse, ScenarioDataPoint

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/scenarios", response_model=ScenarioResponse)
async def get_scenarios(
    material: str = Query(..., description="Material ID"),
    region: str = Query(..., description="Region code"),
    volume: int = Query(100000, description="Annual volume"),
    years: int = Query(10, ge=1, le=20, description="Number of years to project")
):
    """
    Get scenario analysis data for charting energy costs and subsidies over time.
    
    Args:
        material: Material identifier
        region: Region code
        volume: Annual chip volume
        years: Number of years to project
    
    Returns:
        Baseline, optimistic, and pessimistic scenarios
    """
    try:
        logger.info(f"📊 Generating {years}-year scenarios for {material} in {region}")
        
        # Generate scenario projections
        scenarios = _generate_scenarios(material, region, volume, years)
        
        logger.info(f"✅ Generated {len(scenarios['baseline'])} data points per scenario")
        
        return ScenarioResponse(**scenarios)
    
    except Exception as e:
        logger.error(f"❌ Scenario generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _generate_scenarios(
    material: str,
    region: str,
    volume: int,
    years: int
) -> dict:
    """
    Generate baseline, optimistic, and pessimistic scenarios.
    
    Baseline: Current trends continue
    Optimistic: Energy costs decrease, subsidies increase
    Pessimistic: Energy costs increase, subsidies decrease
    """
    from backend.services.data_access import get_material_by_id, get_region_by_code
    
    mat = get_material_by_id(material)
    reg = get_region_by_code(region)
    
    current_year = 2025
    
    # Baseline assumptions
    base_energy_cost = reg.energy_cost
    base_subsidy = reg.subsidy_rate
    
    baseline = []
    optimistic = []
    pessimistic = []
    
    for year_offset in range(years):
        year = current_year + year_offset
        
        # BASELINE: 2% energy increase, stable subsidies
        baseline_energy = base_energy_cost * (1.02 ** year_offset)
        baseline_subsidy = base_subsidy * (0.98 ** year_offset)  # slight decrease
        baseline_cost = _calculate_annual_cost(
            mat, volume, baseline_energy, baseline_subsidy, reg.carbon_tax
        )
        
        baseline.append(ScenarioDataPoint(
            year=year,
            energy_cost=round(baseline_energy, 4),
            subsidy_rate=round(baseline_subsidy, 4),
            total_cost=round(baseline_cost, 2)
        ))
        
        # OPTIMISTIC: Energy decreases 3% annually, subsidies increase
        opt_energy = base_energy_cost * (0.97 ** year_offset)
        opt_subsidy = min(0.50, base_subsidy * (1.05 ** year_offset))
        opt_cost = _calculate_annual_cost(
            mat, volume, opt_energy, opt_subsidy, reg.carbon_tax * 0.8
        )
        
        optimistic.append(ScenarioDataPoint(
            year=year,
            energy_cost=round(opt_energy, 4),
            subsidy_rate=round(opt_subsidy, 4),
            total_cost=round(opt_cost, 2)
        ))
        
        # PESSIMISTIC: Energy increases 5%, subsidies decrease
        pess_energy = base_energy_cost * (1.05 ** year_offset)
        pess_subsidy = base_subsidy * (0.90 ** year_offset)
        pess_cost = _calculate_annual_cost(
            mat, volume, pess_energy, pess_subsidy, reg.carbon_tax * 1.2
        )
        
        pessimistic.append(ScenarioDataPoint(
            year=year,
            energy_cost=round(pess_energy, 4),
            subsidy_rate=round(pess_subsidy, 4),
            total_cost=round(pess_cost, 2)
        ))
    
    return {
        "baseline": baseline,
        "optimistic": optimistic,
        "pessimistic": pessimistic
    }


def _calculate_annual_cost(
    material,
    volume: int,
    energy_cost: float,
    subsidy_rate: float,
    carbon_tax: float
) -> float:
    """Quick annual cost calculation for scenarios"""
    
    # Direct costs
    chip_cost = material.chip_cost * volume
    
    # Energy costs (assume 5-year device lifetime, 24/7 operation)
    device_lifetime_hours = 5 * 365 * 24
    energy_kwh = (material.energy_consumption / 1000) * device_lifetime_hours * volume
    energy_total = energy_kwh * energy_cost
    
    # Carbon tax
    carbon_total = material.carbon_footprint * volume * carbon_tax
    
    # Maintenance (10% of chip cost)
    maintenance = chip_cost * 0.10
    
    # Total before subsidy
    total_before = chip_cost + energy_total + carbon_total + maintenance
    
    # Apply subsidy
    subsidy_amount = total_before * subsidy_rate
    
    return total_before - subsidy_amount
