"""
Internal domain entities and data structures.
These are used internally and may differ from API schemas.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime


@dataclass
class MaterialEntity:
    """Internal material entity with extended properties"""
    id: str
    name: str
    category: str
    
    # Pricing
    chip_cost_per_unit: float
    fab_setup_cost: float = 0.0
    tooling_cost: float = 0.0
    
    # Energy
    fabrication_kwh_per_wafer: float = 0.0
    device_power_consumption_w: float = 0.0
    
    # Carbon
    co2_kg_per_wafer: float = 0.0
    co2_kg_per_chip: float = 0.0
    
    # Supply chain
    supply_chain_risk: str = "medium"  # low, medium, high
    lead_time_weeks: int = 12
    num_suppliers: int = 1
    
    # Technology
    trl: int = 5
    maturity: str = "Research"
    
    # Metadata
    manufacturers: List[str] = field(default_factory=list)
    applications: List[str] = field(default_factory=list)
    last_updated: Optional[datetime] = None


@dataclass
class RegionEntity:
    """Internal region entity with economic data"""
    code: str
    name: str
    
    # Energy economics
    energy_cost_per_kwh: float
    carbon_tax_per_ton: float
    
    # Trends
    energy_cost_trend: float = 0.0  # annual % change
    carbon_tax_trend: float = 0.0
    
    # Subsidies
    chips_act_eligible: bool = False
    max_subsidy_percentage: float = 0.0
    green_tech_bonus: float = 0.0
    
    # Risk factors
    supply_chain_stability: float = 1.0  # 0-1 multiplier
    regulatory_stability: float = 1.0
    
    # Metadata
    last_updated: Optional[datetime] = None


@dataclass
class TcoCalculation:
    """Internal TCO calculation result with full details"""
    # Input parameters
    material: MaterialEntity
    region: RegionEntity
    volume: int
    years: int
    usage_hours: int
    
    # Cost breakdown
    direct_costs: float = 0.0
    energy_costs: float = 0.0
    carbon_tax: float = 0.0
    maintenance_costs: float = 0.0
    supply_chain_risk_cost: float = 0.0
    
    # Subsidies
    subsidy_amount: float = 0.0
    
    # Totals
    total_before_subsidy: float = 0.0
    total_after_subsidy: float = 0.0
    
    # Per-unit metrics
    cost_per_chip: float = 0.0
    annual_cost: float = 0.0
    
    # Calculation metadata
    calculation_timestamp: datetime = field(default_factory=datetime.now)
    assumptions: Dict[str, any] = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for serialization"""
        return {
            "direct_costs": self.direct_costs,
            "energy_costs": self.energy_costs,
            "carbon_tax": self.carbon_tax,
            "maintenance_costs": self.maintenance_costs,
            "supply_chain_risk_cost": self.supply_chain_risk_cost,
            "subsidy_amount": self.subsidy_amount,
            "total_before_subsidy": self.total_before_subsidy,
            "total_after_subsidy": self.total_after_subsidy,
            "cost_per_chip": self.cost_per_chip,
            "annual_cost": self.annual_cost,
        }


@dataclass
class KnowledgeDocument:
    """Document in the knowledge base"""
    id: str
    source: str
    content: str
    metadata: Dict[str, any] = field(default_factory=dict)
    embedding: Optional[List[float]] = None
    
    # Provenance
    url: Optional[str] = None
    year: Optional[int] = None
    confidence: float = 1.0
    
    def to_citation(self) -> dict:
        """Convert to citation format"""
        return {
            "source": self.source,
            "url": self.url,
            "year": self.year,
            "confidence": self.confidence
        }


@dataclass
class RAGContext:
    """Retrieved context for RAG generation"""
    query: str
    documents: List[KnowledgeDocument]
    relevance_scores: List[float]
    
    def format_context(self, max_docs: int = 5) -> str:
        """Format context for LLM prompt"""
        context_parts = []
        
        for doc, score in zip(self.documents[:max_docs], self.relevance_scores[:max_docs]):
            context_parts.append(
                f"[Source: {doc.source} (confidence: {score:.2f})]\n{doc.content}\n"
            )
        
        return "\n---\n".join(context_parts)
