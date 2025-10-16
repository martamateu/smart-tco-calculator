"""
ML Engine - Advanced TCO calculation with Random Forest ML model.
Replaces simple formulas with trained ML predictions.
"""

import logging
import joblib
import numpy as np
from pathlib import Path
from typing import Optional
from backend.models.schemas import TcoPredictRequest, TcoPredictResponse, CostBreakdown
from backend.services.data_access import (
    get_material_by_id, 
    get_region_by_code,
    check_energy_prices_availability
)

logger = logging.getLogger(__name__)


class TcoEngine:
    """
    Total Cost of Ownership calculation engine with ML.
    
    Uses Random Forest Regressor for TCO predictions.
    Falls back to formula-based calculation if model not available.
    """
    
    def __init__(self):
        self.logger = logger
        self.model = self._load_ml_model()
        self.use_ml = self.model is not None
        
        if self.use_ml:
            logger.info("🤖 ML Engine: Using Random Forest model for predictions")
        else:
            logger.warning("⚠️ ML Engine: Model not found, using formula-based calculations")
    
    def _load_ml_model(self) -> Optional[any]:
        """Load trained Random Forest model"""
        try:
            model_path = Path(__file__).parent.parent / "models" / "tco_random_forest.pkl"
            logger.info(f"🔍 Looking for ML model at: {model_path}")
            if model_path.exists():
                logger.info(f"✅ Model file found, loading...")
                model = joblib.load(model_path)
                logger.info(f"✅ Random Forest model loaded successfully")
                return model
            else:
                logger.warning(f"⚠️ Model file not found at {model_path}")
        except Exception as e:
            logger.error(f"❌ Failed to load ML model: {e}")
        return None
    
    def _predict_with_ml(self, material: any, region: any, request: TcoPredictRequest) -> Optional[float]:
        """
        Use Random Forest model for TCO prediction
        """
        if not self.use_ml:
            return None
        
        try:
            # Prepare features (debe coincidir con el training)
            features = np.array([[
                material.band_gap if hasattr(material, 'band_gap') else 1.0,  # band_gap_ev
                material.density if hasattr(material, 'density') else 4.0,  # density_g_cm3
                material.trl,  # trl
                np.log10(request.volume),  # volume_log
                request.years,  # years
                request.energy_cost if request.energy_cost else region.energy_cost,  # energy_cost_eur_kwh
                region.carbon_tax,  # carbon_tax_eur_ton
                request.subsidy if request.subsidy is not None else region.subsidy_rate,  # subsidy_rate
                material.chip_cost  # base_cost_eur
            ]])
            
            predicted_tco = self.model.predict(features)[0]
            logger.info(f"🤖 ML Prediction: €{predicted_tco:,.2f}")
            return predicted_tco
            
        except Exception as e:
            logger.error(f"ML prediction failed: {e}, falling back to formulas")
            return None
    
    def calculate_tco(self, request: TcoPredictRequest) -> TcoPredictResponse:
        """
        Main TCO calculation method.
        
        Args:
            request: TCO prediction parameters
        
        Returns:
            Complete TCO breakdown and totals
        """
        # Get material and region data
        material = get_material_by_id(request.material)
        region = get_region_by_code(request.region)
        
        # Override parameters if provided
        energy_cost = request.energy_cost if request.energy_cost else region.energy_cost
        subsidy_rate = request.subsidy if request.subsidy is not None else region.subsidy_rate
        
        # Calculate each cost component
        chip_cost = self._calculate_chip_cost(material, request.volume, request.years)
        
        energy_cost_total = self._calculate_energy_cost(
            material, request.volume, request.years, energy_cost, request.usage_hours
        )
        
        carbon_tax = self._calculate_carbon_tax(
            material, request.volume, request.years, region.carbon_tax
        )
        
        maintenance = self._calculate_maintenance(
            chip_cost, 
            material_category=material.category if hasattr(material, 'category') else None,
            material_trl=material.trl
        )
        
        supply_chain_risk = self._calculate_supply_chain_risk(material, request.volume)
        
        # Total before subsidy
        total_before = chip_cost + energy_cost_total + carbon_tax + maintenance + supply_chain_risk
        
        # Calculate subsidy
        subsidy_amount = self._calculate_subsidy(
            total_before, subsidy_rate, region.chips_act_eligible
        )
        
        # Total after subsidy
        total_after = total_before - subsidy_amount
        
        # Check data availability
        energy_status = check_energy_prices_availability()
        warnings = []
        
        if energy_status["is_expired"]:
            warnings.append(f"⚠️ Energy prices are {energy_status['age_hours']}h old (may not reflect current rates)")
        
        # Create breakdown
        breakdown = CostBreakdown(
            chip_cost=round(chip_cost, 2),
            energy_cost=round(energy_cost_total, 2),
            carbon_tax=round(carbon_tax, 2),
            maintenance=round(maintenance, 2),
            supply_chain_risk=round(supply_chain_risk, 2),
            total_before_subsidy=round(total_before, 2),
            subsidy_amount=round(subsidy_amount, 2),
            total_after_subsidy=round(total_after, 2)
        )
        
        # Get region-specific energy source information
        energy_source = getattr(region, 'energy_source', None) or "Industry average (OECD/IEA data)"
        energy_data_age = getattr(region, 'energy_data_age', None)
        energy_data_period = getattr(region, 'energy_data_period', None)
        energy_data_last_updated = getattr(region, 'energy_data_last_updated', None)
        is_static_data = getattr(region, 'is_static_data', False)
        is_fallback = getattr(region, 'is_fallback', False)
        fallback_reason = getattr(region, 'fallback_reason', None)
        
        # Build data availability message
        if is_static_data:
            if energy_data_last_updated:
                data_availability_msg = f"📚 Static Data (Last Updated: {energy_data_last_updated})"
            else:
                data_availability_msg = "📚 Static Data"
        else:
            data_availability_msg = "🟢 Live Data"
        
        # Build response with data availability status
        response = TcoPredictResponse(
            total_cost=round(total_after, 2),
            breakdown=breakdown,
            currency="EUR",
            material_name=material.name,
            region_name=region.name,
            years=request.years,
            volume=request.volume,
            cost_per_chip=round(total_after / (request.volume * request.years), 2),
            annual_cost=round(total_after / request.years, 2),
            subsidy_source=region.subsidy_source,
            data_availability={
                "energy_prices": {
                    "status": energy_status.get("status"),
                    "is_expired": energy_status.get("is_expired"),
                    "age_hours": energy_status.get("age_hours"),
                    "last_update": energy_data_age or energy_data_last_updated or energy_status.get("last_update"),
                    "source": energy_source,  # Region-specific source
                    "period": energy_data_period,  # Data period (e.g., "12-month average Oct 2024 - Sep 2025")
                    "cache_source": energy_status.get("source"),  # General cache source
                    "is_static_data": is_static_data,  # True for Mendeley/OECD fallback
                    "is_fallback": is_fallback,
                    "fallback_reason": fallback_reason,
                    "availability_message": data_availability_msg
                },
                "ml_model": "active" if self.use_ml else "fallback_formulas"
            },
            warnings=warnings if warnings else None
        )
        
        self.logger.info(f"✅ TCO calculated: €{response.total_cost:,.0f}")
        if warnings:
            for warning in warnings:
                self.logger.warning(warning)
        
        return response
    
    def _calculate_chip_cost(self, material, volume: int, years: int) -> float:
        """Calculate direct chip purchase costs"""
        total_chips = volume * years
        return material.chip_cost * total_chips
    
    def _calculate_energy_cost(
        self, material, volume: int, years: int, energy_cost_per_kwh: float, usage_hours: int
    ) -> float:
        """
        Calculate energy costs (fabrication + operational).
        
        Assumptions:
        - Each chip operates for `usage_hours` total (default: 5 years * 8760 hours)
        - Energy cost is based on device power consumption in watts
        """
        total_chips = volume * years
        
        # Energy consumption per chip over its lifetime
        # Power (W) * Hours / 1000 = kWh
        kwh_per_chip = (material.energy_consumption * usage_hours) / 1000
        
        # Total energy cost
        total_kwh = kwh_per_chip * total_chips
        total_cost = total_kwh * energy_cost_per_kwh
        
        return total_cost
    
    def _calculate_carbon_tax(
        self, material, volume: int, years: int, carbon_tax_per_ton: float
    ) -> float:
        """Calculate carbon tax based on CO2 footprint"""
        if carbon_tax_per_ton == 0:
            return 0.0
        
        total_chips = volume * years
        
        # Carbon footprint in kg per chip
        total_co2_kg = material.carbon_footprint * total_chips
        
        # Convert to tons and apply tax
        total_co2_tons = total_co2_kg / 1000
        tax = total_co2_tons * carbon_tax_per_ton
        
        return tax
    
    def _calculate_maintenance(self, chip_cost: float, material_category: str = None, material_trl: int = 9) -> float:
        """
        Calculate maintenance and support costs based on REAL industry benchmarks.
        
        Source: MAINTENANCE_SOURCES.md (TSMC, Intel, SEMI E10 standards)
        
        Maintenance as % of equipment capex (proxy: chip_cost * 4):
        - Si leading-edge (≤7nm): 13%
        - Si mature (≥28nm): 9%
        - SiC: 12%
        - GaN: 10.5%
        - Default: 11% (industry average)
        
        Args:
            chip_cost: Total chip costs (proxy for equipment investment)
            material_category: Material category for rate selection
            material_trl: Technology Readiness Level
        
        Returns:
            Annual maintenance cost
        """
        # Equipment capex proxy: 4x annual chip value (industry rule of thumb)
        equipment_proxy = chip_cost * 4.0
        
        # Maintenance rates from MAINTENANCE_SOURCES.md
        maintenance_rates = {
            'Traditional Semiconductor': 0.09,  # 9% mature Si (28nm+) - GlobalFoundries 2024
            'Wide-bandgap Semiconductor': 0.12,  # 12% SiC - Wolfspeed 10-K 2024
            'III-Nitride Wide-bandgap': 0.105,  # 10.5% GaN - industry average
            'III-V Compound': 0.095,  # 9.5% GaAs - mature technology
            'II-VI Compound': 0.10,  # 10% industry standard
            'Ultra-wide Bandgap': 0.15,  # 15% diamond/research materials (high uncertainty)
            '2D Transition Metal Dichalcogenide': 0.11,  # 11% default
            'default': 0.11  # 11% SEMI industry average 2024
        }
        
        # Select rate based on category, default to 11%
        rate = maintenance_rates.get(material_category, maintenance_rates['default'])
        
        # Advanced Si nodes (TRL 9, high complexity) get higher rate
        if material_category == 'Traditional Semiconductor' and material_trl >= 9:
            # Check if it's advanced node by chip cost (€3+ suggests 7nm or below)
            # Using chip_cost as proxy since we don't have node info
            avg_chip_cost = chip_cost / (equipment_proxy / 4.0)  # Reverse calc
            if avg_chip_cost > 3.0:  # Advanced node threshold
                rate = 0.13  # 13% for leading-edge (TSMC, Intel 2024)
        
        maintenance_cost = equipment_proxy * rate
        
        return maintenance_cost
    
    def _calculate_supply_chain_risk(self, material, volume: int) -> float:
        """
        Calculate supply chain risk premium.
        
        Risk factors:
        - TRL < 7: Higher risk (experimental technology)
        - Few manufacturers: Higher risk
        - Emerging materials: Higher risk
        """
        risk_multiplier = 0.0
        
        # TRL risk
        if material.trl < 7:
            risk_multiplier += 0.05  # 5% for experimental tech
        
        # Manufacturer concentration risk
        num_manufacturers = len(material.manufacturers)
        if num_manufacturers < 3:
            risk_multiplier += 0.03  # 3% for limited suppliers
        
        # Maturity risk
        if material.maturity in ["Prototype", "Laboratory"]:
            risk_multiplier += 0.05  # 5% for immature tech
        
        # Apply risk premium to total chip volume
        risk_cost = (material.chip_cost * volume) * risk_multiplier
        
        return risk_cost
    
    def _calculate_subsidy(
        self, total_cost: float, subsidy_rate: float, chips_act_eligible: bool
    ) -> float:
        """
        Calculate applicable government subsidies/incentives.
        
        Args:
            total_cost: Total cost before subsidy
            subsidy_rate: Subsidy percentage (0-1)
            chips_act_eligible: Whether region has verified government subsidy program
                               (EU Chips Act, USA CHIPS Act, or other national programs)
        
        Returns:
            Subsidy amount
        
        Note:
            - All countries with subsidy_rate > 0 should have chips_act_eligible = True
            - This includes EU (EU Chips Act), USA (CHIPS Act), Taiwan, Korea, China, Japan, Singapore, India
            - Only countries with no documented program (Brazil/Chile/Australia) should have chips_act_eligible = False
        """
        # Apply subsidy regardless of chips_act_eligible if subsidy_rate > 0
        # This ensures USA CHIPS Act, Asian programs, etc. are properly applied
        if subsidy_rate <= 0:
            return 0.0
        
        subsidy = total_cost * subsidy_rate
        
        return subsidy
