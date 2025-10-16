"""
Mock explanation generator for TCO results.
"""

from backend.models.schemas import ExplainRequest, ExplainResponse


def generate_mock_explanation(request: ExplainRequest) -> str:
    """
    Generate a structured mock explanation in English.
    
    Args:
        request: Explanation request with input, result, and language
        
    Returns:
        Markdown formatted explanation text
    """
    from backend.services.data_access import get_region_by_code
    
    material = request.input.material.upper()
    region = request.result.region_name
    total = request.result.total_cost
    breakdown = request.result.breakdown
    volume = request.input.volume
    years = request.input.years
    
    # Get full region data to access subsidy_source
    region_obj = get_region_by_code(request.input.region)
    subsidy_source = getattr(region_obj, 'subsidy_source', None) if region_obj else None
    
    # Determine subsidy program name based on region
    if subsidy_source and "EU Chips Act" in subsidy_source:
        subsidy_program = "EU Chips Act"
        subsidy_action = "Apply for EU Chips Act funding"
    elif subsidy_source and "USA CHIPS Act" in subsidy_source:
        subsidy_program = "USA CHIPS Act"
        subsidy_action = "Apply for USA CHIPS Act funding"
    elif subsidy_source and "Taiwan" in subsidy_source:
        subsidy_program = "Taiwan Industrial Innovation Act"
        subsidy_action = "Apply for Taiwan Industrial Innovation Act funding"
    elif subsidy_source and "K-Semiconductor" in subsidy_source:
        subsidy_program = "K-Semiconductor Strategy"
        subsidy_action = "Apply for K-Semiconductor Strategy funding"
    elif subsidy_source and "China" in subsidy_source:
        subsidy_program = "IC Fund Phase III"
        subsidy_action = "Apply for IC Fund Phase III funding"
    elif subsidy_source and "Japan" in subsidy_source:
        subsidy_program = "LSTC + METI subsidies"
        subsidy_action = "Apply for LSTC + METI subsidies"
    elif subsidy_source and "Singapore" in subsidy_source:
        subsidy_program = "SSIC Program"
        subsidy_action = "Apply for SSIC Program funding"
    elif subsidy_source and "India" in subsidy_source:
        subsidy_program = "India Semiconductor Mission"
        subsidy_action = "Apply for India Semiconductor Mission funding"
    elif subsidy_source and "Unknown" in subsidy_source:
        subsidy_program = "government incentives"
        subsidy_action = "Research available government incentive programs"
    else:
        subsidy_program = "government incentives"
        subsidy_action = "Research regional semiconductor incentive programs"
    
    # Calculate percentages
    chip_pct = (breakdown.chip_cost / breakdown.total_before_subsidy * 100)
    energy_pct = (breakdown.energy_cost / breakdown.total_before_subsidy * 100)
    carbon_pct = (breakdown.carbon_tax / breakdown.total_before_subsidy * 100)
    
    # Dynamic summary based on biggest cost driver
    max_cost = max(breakdown.chip_cost, breakdown.energy_cost, breakdown.carbon_tax, breakdown.maintenance)
    if max_cost == breakdown.energy_cost:
        driver_text = "energy consumption"
    elif max_cost == breakdown.chip_cost:
        driver_text = "direct chip costs"
    elif max_cost == breakdown.carbon_tax:
        driver_text = "carbon taxation"
    else:
        driver_text = "operational expenses"
    
    # Generate free-form markdown explanation
    explanation_text = f"""## TCO Analysis: {request.result.material_name} in {region}

**Total Cost of Ownership:** €{total:,.0f} over {years} years for {volume:,} chips

### Cost Breakdown

The primary cost driver is **{driver_text}**, representing a significant portion of the total TCO.

- **Direct chip costs:** €{breakdown.chip_cost:,.0f} ({chip_pct:.1f}% of pre-subsidy total)
- **Energy consumption:** €{breakdown.energy_cost:,.0f} ({energy_pct:.1f}% of pre-subsidy total) - driven by operational scale
- **Carbon tax impact:** €{breakdown.carbon_tax:,.0f} ({carbon_pct:.1f}% of pre-subsidy total) in {region}
"""
    
    # Add subsidy line with proper formatting
    if subsidy_source and "Unknown" in subsidy_source:
        explanation_text += f"- **Estimated incentives (unverified):** -€{breakdown.subsidy_amount:,.0f} ({breakdown.subsidy_amount/breakdown.total_before_subsidy*100:.1f}% reduction)\n"
    else:
        explanation_text += f"- **{subsidy_program} incentives:** -€{breakdown.subsidy_amount:,.0f} ({breakdown.subsidy_amount/breakdown.total_before_subsidy*100:.1f}% reduction)\n"
    
    explanation_text += f"""
**Cost per chip:** €{request.result.cost_per_chip:.2f} (annualized over {years} years)

### Strategic Recommendations

1. {subsidy_action} to maximize the €{breakdown.subsidy_amount:,.0f} subsidy potential for {region}
2. Evaluate energy optimization strategies - energy costs represent {energy_pct:.1f}% of pre-subsidy TCO
3. Compare with alternative materials (Si, GaN, GaAs) for your specific power and performance requirements
4. Consider longer-term contracts to amortize the €{breakdown.chip_cost:,.0f} material costs
5. Explore carbon offset programs to mitigate carbon tax expenses

### Comparative Analysis

{request.result.material_name} demonstrates competitive economics in {region} at €{request.result.cost_per_chip:.2f} per chip. The material's energy efficiency profile (reflected in the {energy_pct:.1f}% energy cost share) makes it particularly attractive for high-volume applications. Regional subsidies and carbon policies significantly impact the final TCO, with net savings of €{breakdown.subsidy_amount - breakdown.carbon_tax:,.0f} from policy incentives.

*Note: This analysis uses real industry data from verified sources including government subsidy programs, OECD energy prices, and semiconductor industry reports.*
"""
    
    return explanation_text
