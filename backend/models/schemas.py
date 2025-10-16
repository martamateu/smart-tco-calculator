"""
Pydantic schemas for request/response validation.
These schemas match the frontend TypeScript interfaces exactly.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class MaterialType(str, Enum):
    """Semiconductor material types"""
    SI = "Si"
    SIC = "SiC"
    GAN = "GaN"
    GAAS = "GaAs"
    IGO = "IGZO"
    CNT = "CNT-FET"
    MOS2 = "MoS₂"


class RegionCode(str, Enum):
    """Geographic regions"""
    EU = "EU"
    USA = "USA"
    ASIA = "Asia"
    GERMANY = "Germany"
    FRANCE = "France"
    ITALY = "Italy"
    SPAIN = "Spain"


# ============================================================================
# MATERIAL MODELS
# ============================================================================

class Material(BaseModel):
    """Semiconductor material with properties"""
    id: str
    name: str
    category: str
    chip_cost: float = Field(..., description="Cost per chip in EUR")
    energy_consumption: float = Field(..., description="Watts per device")
    carbon_footprint: float = Field(..., description="kg CO2 per chip")
    trl: int = Field(..., ge=1, le=9, description="Technology Readiness Level")
    maturity: str
    manufacturers: List[str]
    applications: List[str]
    band_gap: Optional[float] = Field(None, description="Band gap in eV (for ML model)")
    density: Optional[float] = Field(None, description="Density in g/cm³ (for ML model)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "sic",
                "name": "SiC (Silicon Carbide)",
                "category": "Wide-bandgap",
                "chip_cost": 0.80,
                "energy_consumption": 2.5,
                "carbon_footprint": 0.08,
                "trl": 9,
                "maturity": "Commercial",
                "manufacturers": ["Wolfspeed", "STMicroelectronics"],
                "applications": ["Power electronics", "EV inverters"],
                "band_gap": 2.3,
                "density": 3.21
            }
        }


# ============================================================================
# REGION MODELS
# ============================================================================

class Region(BaseModel):
    """Geographic region with energy costs and subsidies"""
    code: str
    name: str
    energy_cost: float = Field(..., description="EUR per kWh")
    carbon_tax: float = Field(..., description="EUR per ton CO2")
    subsidy_rate: float = Field(..., ge=0, le=1, description="Subsidy as fraction (0-1)")
    chips_act_eligible: bool
    subsidy_source: Optional[str] = Field(None, description="Source of subsidy program (EU Chips Act, USA CHIPS Act, etc.)")
    energy_source: Optional[str] = Field(None, description="Data source for energy prices")
    energy_period: Optional[str] = Field(None, description="Time period for energy prices")
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "EU",
                "name": "European Union",
                "energy_cost": 0.25,
                "carbon_tax": 80.0,
                "subsidy_rate": 0.40,
                "chips_act_eligible": True,
                "energy_source": "ENTSO-E Transparency Platform",
                "energy_period": "2025-10-03 to 2025-10-10"
            }
        }


# ============================================================================
# TCO PREDICTION MODELS
# ============================================================================

class TcoPredictRequest(BaseModel):
    """Request for TCO prediction"""
    material: str = Field(..., description="Material ID")
    region: str = Field(..., description="Region code")
    volume: int = Field(..., gt=0, description="Annual volume of chips")
    years: int = Field(5, ge=1, le=20, description="Analysis period in years")
    energy_cost: Optional[float] = Field(None, description="Override energy cost EUR/kWh")
    subsidy: Optional[float] = Field(None, ge=0, le=1, description="Override subsidy rate")
    usage_hours: Optional[int] = Field(43800, description="Annual usage hours (default 5 years * 8760)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "material": "sic",
                "region": "EU",
                "volume": 100000,
                "years": 5,
                "energy_cost": 0.25,
                "subsidy": 0.40,
                "usage_hours": 43800
            }
        }


class CostBreakdown(BaseModel):
    """Detailed cost breakdown"""
    chip_cost: float = Field(..., description="Direct chip purchase cost")
    energy_cost: float = Field(..., description="Operational energy cost")
    carbon_tax: float = Field(..., description="Carbon tax cost")
    maintenance: float = Field(..., description="Maintenance and support")
    supply_chain_risk: float = Field(..., description="Supply chain risk premium")
    
    total_before_subsidy: float
    subsidy_amount: float
    total_after_subsidy: float


class TcoPredictResponse(BaseModel):
    """Response for TCO prediction"""
    total_cost: float = Field(..., description="Total TCO after subsidies")
    breakdown: CostBreakdown
    currency: str = "EUR"
    material_name: str
    region_name: str
    years: int
    volume: int
    
    # Additional insights
    cost_per_chip: float
    annual_cost: float
    
    # Subsidy information
    subsidy_source: Optional[str] = Field(None, description="Source of subsidy program (EU Chips Act, USA CHIPS Act, etc.)")
    
    # Data availability status
    data_availability: Optional[Dict[str, Any]] = Field(None, description="Status of data sources used")
    warnings: Optional[List[str]] = Field(None, description="Warnings about missing or stale data")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_cost": 1500000,
                "breakdown": {
                    "chip_cost": 800000,
                    "energy_cost": 547500,
                    "carbon_tax": 64000,
                    "maintenance": 80000,
                    "supply_chain_risk": 40000,
                    "total_before_subsidy": 1531500,
                    "subsidy_amount": 320000,
                    "total_after_subsidy": 1211500
                },
                "currency": "EUR",
                "material_name": "SiC (Silicon Carbide)",
                "region_name": "European Union",
                "years": 5,
                "volume": 100000,
                "cost_per_chip": 12.12,
                "annual_cost": 242300
            }
        }


# ============================================================================
# AI EXPLANATION MODELS
# ============================================================================

class ExplainRequest(BaseModel):
    """Request for AI explanation"""
    input: TcoPredictRequest
    result: TcoPredictResponse
    language: Optional[str] = Field("en", description="Response language: 'en', 'es', or 'cat'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "input": {
                    "material": "sic",
                    "region": "EU",
                    "volume": 100000,
                    "years": 5
                },
                "result": {
                    "total_cost": 1500000,
                    "breakdown": {},
                    "currency": "EUR"
                }
            }
        }


class Citation(BaseModel):
    """Data source citation"""
    source: str
    url: Optional[str] = None
    year: Optional[int] = None
    confidence: float = Field(..., ge=0, le=1)


class ExplainResponse(BaseModel):
    """AI-generated explanation of TCO results - FREE FORM from Gemini"""
    explanation: str = Field(..., description="Complete AI-generated explanation with inline citations")
    
    class Config:
        json_schema_extra = {
            "example": {
                "explanation": """**TCO Analysis: SiC in Netherlands**

The total cost of ownership for 100,000 SiC chips over 5 years in Netherlands is €8,007,122.

**Cost Breakdown:**
- Energy costs dominate at €11.7M based on Netherlands electricity price of €0.1067/kWh (ENTSO-E Day-Ahead Market Oct 2025)
- SiC chip costs €0.85 per unit totaling €425k (Yole SiC Power Devices 2024)
- Carbon tax €6k with Netherlands rate €120/tonne (EU ETS €90 + Dutch Carbon Tax €30, 2025)
- Maintenance costs €204k at 12% rate (Wolfspeed 10-K Filing 2024)
- EU Chips Act subsidy reduces TCO by 35% or €4.3M (European Commission 2023)

**Recommendations:**
Netherlands offers competitive electricity prices with live ENTSO-E market data. SiC's energy efficiency justifies the premium over traditional silicon (€0.85 vs €0.55 per chip, Yole 2024). Maximize EU Chips Act funding opportunities.

**Comparison:**
SiC achieves 17% lower TCO than Si despite 55% higher chip cost due to 40% energy savings (IEEE LCA Study 2023) and favorable carbon tax treatment in Netherlands."""
            }
        }


# ============================================================================
# CHAT MODELS
# ============================================================================

class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Request for chat with RAG"""
    message: str = Field(..., description="User's question")
    tco_context: Optional[TcoPredictResponse] = Field(None, description="Current TCO calculation context")
    chat_history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation")
    language: Optional[str] = Field("en", description="Response language: 'en', 'es', or 'cat'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Why is energy cost so high?",
                "tco_context": {
                    "material_id": "sic",
                    "region_id": "netherlands",
                    "total_cost": 8007122,
                    "breakdown": {}
                },
                "chat_history": []
            }
        }


class ChatResponse(BaseModel):
    """Response from chat with RAG"""
    message: str = Field(..., description="Assistant's response in markdown")
    sources: List[str] = Field(default_factory=list, description="Sources used for this response")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Energy costs are high because SiC chips consume significant power over their lifetime. At €0.1067/kWh (ENTSO-E Oct 2025), running 100k chips for 5 years costs €11.7M.",
                "sources": ["ENTSO-E Day-Ahead Market Oct 2025", "Yole SiC Power Devices 2024"]
            }
        }


# ============================================================================
# SCENARIO MODELS
# ============================================================================

class ScenarioDataPoint(BaseModel):
    """Single data point in scenario chart"""
    year: int
    energy_cost: float
    subsidy_rate: float
    total_cost: float


class ScenarioResponse(BaseModel):
    """Scenario analysis data for charting"""
    baseline: List[ScenarioDataPoint]
    optimistic: List[ScenarioDataPoint]
    pessimistic: List[ScenarioDataPoint]
    
    class Config:
        json_schema_extra = {
            "example": {
                "baseline": [
                    {"year": 2025, "energy_cost": 0.25, "subsidy_rate": 0.40, "total_cost": 242300},
                    {"year": 2026, "energy_cost": 0.26, "subsidy_rate": 0.38, "total_cost": 251000}
                ],
                "optimistic": [],
                "pessimistic": []
            }
        }
