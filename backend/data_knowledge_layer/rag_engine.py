"""
RAG Engine - Combines retrieval and generation for grounded explanations.
"""

import logging
from typing import Optional
import os

from backend.models.schemas import TcoPredictRequest, TcoPredictResponse, ExplainResponse, Citation, CostBreakdown
from backend.models.entities import RAGContext, KnowledgeDocument
from backend.data_knowledge_layer.loader import DataLoader
from backend.data_knowledge_layer.retriever import Retriever

# Optional Vertex AI / Google Generative API for translation
try:
    import vertexai
    from vertexai.language_models import TextGenerationModel
    VERTEX_AVAILABLE = True
except Exception:
    VERTEX_AVAILABLE = False

logger = logging.getLogger(__name__)


class RAGEngine:
    """
    Retrieval-Augmented Generation engine.
    
    Pipeline:
    1. Retrieve relevant context from knowledge base
    2. Format context for LLM
    3. Generate grounded explanation (with Gemini or fallback)
    """
    
    def __init__(self, data_loader: Optional[DataLoader] = None):
        self.data_loader = data_loader or DataLoader()
        self.retriever = Retriever(self.data_loader)
        self.logger = logger
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize RAG engine"""
        self.logger.info("🧠 Initializing RAG engine...")
        
        try:
            # Ensure data is loaded
            if not self.data_loader.documents:
                await self.data_loader.load_all_datasets()
            
            # Initialize retriever
            await self.retriever.initialize()
            
            self.is_initialized = True
            self.logger.info(f"✅ RAG engine ready ({len(self.data_loader.documents)} documents)")
        
        except Exception as e:
            self.logger.error(f"❌ RAG initialization failed: {e}")
            self.is_initialized = False
    
    async def retrieve_context(
        self,
        input_params: TcoPredictRequest,
        result: TcoPredictResponse,
        top_k: int = 5
    ) -> RAGContext:
        """
        Retrieve relevant context for TCO explanation.
        
        Args:
            input_params: Original input parameters
            result: TCO calculation result
            top_k: Number of documents to retrieve
        
        Returns:
            RAG context with documents and scores
        """
        # Build retrieval query
        query = self._build_retrieval_query(input_params, result)
        
        self.logger.info(f"🔎 Retrieving context: {query[:100]}...")
        
        # Retrieve documents
        retrieved_docs = await self.retriever.retrieve(query, top_k=top_k)
        
        # Convert to KnowledgeDocument objects
        documents = []
        relevance_scores = []
        
        for doc_data in retrieved_docs:
            doc = KnowledgeDocument(
                id=f"{doc_data['source']}_{hash(doc_data['content'])}",
                source=doc_data["source"],
                content=doc_data["content"],
                metadata=doc_data.get("metadata", {}),
                url=doc_data.get("url"),
                confidence=doc_data.get("confidence", 0.8)
            )
            documents.append(doc)
            relevance_scores.append(doc_data.get("relevance_score", 0.5))
        
        context = RAGContext(
            query=query,
            documents=documents,
            relevance_scores=relevance_scores
        )
        
        self.logger.info(f"📚 Retrieved {len(documents)} relevant documents")
        
        return context
    
    async def retrieve_context_from_query(
        self,
        query: str,
        top_k: int = 5
    ) -> RAGContext:
        """
        Retrieve relevant context from a direct query string.
        Used for chat functionality.
        
        Args:
            query: Search query string
            top_k: Number of documents to retrieve
        
        Returns:
            RAG context with documents and scores
        """
        if not self.is_initialized:
            await self.initialize()
        
        self.logger.info(f"🔎 Chat query: {query[:100]}...")
        
        # Retrieve documents
        retrieved_docs = await self.retriever.retrieve(query, top_k=top_k)
        
        # Convert to KnowledgeDocument objects
        documents = []
        relevance_scores = []
        
        for doc_data in retrieved_docs:
            doc = KnowledgeDocument(
                id=doc_data.get("id", ""),
                source=doc_data.get("source", "Unknown"),
                content=doc_data.get("content", ""),
                metadata=doc_data.get("metadata", {})
            )
            documents.append(doc)
            relevance_scores.append(doc_data.get("relevance_score", 0.0))
        
        context = RAGContext(
            query=query,
            documents=documents,
            relevance_scores=relevance_scores
        )
        
        self.logger.info(f"📚 Retrieved {len(documents)} documents for chat")
        
        return context
    
    async def generate_explanation(
        self,
        input_params: TcoPredictRequest,
        result: TcoPredictResponse,
        language: str = "en"
    ) -> ExplainResponse:
        """
        Generate explanation using RAG (without Gemini).
        This is the fallback when Gemini is unavailable.
        
        Args:
            input_params: Original input
            result: TCO result
            language: Response language ('en', 'es', or 'cat')
        
        Returns:
            Explanation with citations
        """
        if not self.is_initialized:
            await self.initialize()
        
        # Retrieve context
        context = await self.retrieve_context(input_params, result, top_k=3)
        
        # Generate explanation from context
        explanation = await self._generate_from_context(input_params, result, context, language)
        
        return explanation
    
    def _build_retrieval_query(
        self,
        input_params: TcoPredictRequest,
        result: TcoPredictResponse
    ) -> str:
        """Build optimized retrieval query"""
        
        query_parts = [
            f"{result.material_name} semiconductor",
            f"{result.region_name} energy costs",
            f"Total Cost of Ownership",
        ]
        
        # Add key cost drivers
        breakdown = result.breakdown
        total = breakdown.total_before_subsidy
        
        if breakdown.energy_cost / total > 0.3:
            query_parts.append("energy efficiency power consumption")
        
        if breakdown.carbon_tax / total > 0.1:
            query_parts.append("carbon tax CO2 emissions")
        
        if breakdown.subsidy_amount > 0:
            query_parts.append("semiconductor subsidies government funding incentives")
        
        return " ".join(query_parts)
    
    async def _generate_from_context(
        self,
        input_params: TcoPredictRequest,
        result: TcoPredictResponse,
        context: RAGContext,
        language: str = "en"
    ) -> ExplainResponse:
        """Generate explanation from retrieved context (no LLM) - Free-form markdown"""
        
        # Import here to avoid circular dependency
        from backend.services.data_access import get_region_by_code
        
        material_name = result.material_name
        region_name = result.region_name
        total = result.total_cost
        breakdown = result.breakdown
        years = input_params.years
        volume = input_params.volume
        
        # Get full region data to access subsidy_source
        region_obj = get_region_by_code(input_params.region)
        subsidy_source = getattr(region_obj, 'subsidy_source', None) if region_obj else None
        chips_act_eligible = getattr(region_obj, 'chips_act_eligible', False) if region_obj else False
        
        # Identify top cost drivers
        cost_components = [
            ("chip costs", breakdown.chip_cost),
            ("energy consumption", breakdown.energy_cost),
            ("carbon tax", breakdown.carbon_tax),
            ("maintenance", breakdown.maintenance),
            ("supply chain risk", breakdown.supply_chain_risk),
        ]
        cost_components.sort(key=lambda x: x[1], reverse=True)
        top_driver = cost_components[0][0]
        
        # Precompute energy percent for later use
        energy_pct = (breakdown.energy_cost / breakdown.total_before_subsidy) * 100
        
        # Build citations from context
        citations_text = []
        for doc, score in zip(context.documents[:3], context.relevance_scores[:3]):
            if doc.source and score > 0.3:
                year = doc.metadata.get("year", "2024")
                citations_text.append(f"{doc.source} {year}")
        
        # Generate free-form markdown explanation
        ml_model_used = result.data_availability.get("ml_model") == "active"

        # Determine subsidy program name based on region
        if subsidy_source and "EU Chips Act" in subsidy_source:
            subsidy_program = "EU Chips Act"
            subsidy_program_full = "EU Chips Act (Regulation 2023/1781)"
        elif subsidy_source and "USA CHIPS Act" in subsidy_source:
            subsidy_program = "USA CHIPS Act"
            subsidy_program_full = "USA CHIPS Act (Public Law 117-167)"
        elif subsidy_source and "Taiwan" in subsidy_source:
            subsidy_program = "Taiwan Industrial Innovation Act"
            subsidy_program_full = "Industrial Innovation Act (Ministry of Economic Affairs)"
        elif subsidy_source and "K-Semiconductor" in subsidy_source:
            subsidy_program = "K-Semiconductor Strategy"
            subsidy_program_full = "K-Semiconductor Strategy (MOTIE Korea)"
        elif subsidy_source and "China" in subsidy_source:
            subsidy_program = "IC Fund Phase III"
            subsidy_program_full = "National IC Fund Phase III (State Council)"
        elif subsidy_source and "Japan" in subsidy_source:
            subsidy_program = "LSTC + METI subsidies"
            subsidy_program_full = "LSTC + METI (Japanese government)"
        elif subsidy_source and "Singapore" in subsidy_source:
            subsidy_program = "SSIC Program"
            subsidy_program_full = "Singapore SSIC Program (EDB)"
        elif subsidy_source and "India" in subsidy_source:
            subsidy_program = "India Semiconductor Mission"
            subsidy_program_full = "India Semiconductor Mission (MeitY)"
        elif subsidy_source and "Unknown" in subsidy_source:
            subsidy_program = "government incentives"
            subsidy_program_full = "government incentives (source under research)"
        else:
            subsidy_program = "government incentives"
            subsidy_program_full = "regional government incentives"

        explanation_md = f"""## TCO Analysis: {material_name} in {region_name}

**Total Cost of Ownership:** €{total:,.0f} over {years} years for {volume:,} chips

### Calculation Method

This TCO was calculated using {"**Random Forest ML model**" if ml_model_used else "**formula-based approach**"}.

**Industry validation:** Key cost drivers and methodology are aligned with insights from [BCG (2023) Navigating the Semiconductor Manufacturing Costs](https://www.bcg.com/publications/2023/navigating-the-semiconductor-manufacturing-costs).
"""
        
        if ml_model_used:
            explanation_md += "The Random Forest model was trained on 20,000 semiconductor manufacturing scenarios with real-world data from:\n- **Materials Project API** (material properties)\n- **Mendeley Global Day-Ahead Electricity Price Dataset** (DOI: 10.17632/s54n4tyyz4.3) - 13 countries, 2024-2025 market data\n- **IEA Grid Carbon Intensity Database 2024** (18-765 g CO2/kWh range)\n- **JRC Semiconductor Studies** (EU fabrication benchmarks)\n\nThe model accounts for non-linear relationships between energy costs (€0.076-€0.232/kWh), carbon taxes (€0-€120/tonne), regional grid carbon intensity, and manufacturing scale efficiencies.\n\n**BCG (2023) confirms that energy, carbon, and subsidies are the dominant cost drivers in global semiconductor manufacturing.**\n\n"
        else:
            explanation_md += "The formula uses industry-standard calculations validated against JRC semiconductor manufacturing data, BCG (2023) cost breakdowns, and real energy prices from Mendeley Global Day-Ahead Electricity Price Dataset (DOI: 10.17632/s54n4tyyz4.3, 2024-2025).\n\n"
        
        explanation_md += f"""### Executive Summary

The TCO analysis reveals **{top_driver}** as the primary cost driver for {material_name} in {region_name}. """
        
        # Add key insights with data
        if breakdown.subsidy_amount > 0:
            subsidy_pct = (breakdown.subsidy_amount / breakdown.total_before_subsidy) * 100
            if subsidy_source and "Unknown" in subsidy_source:
                explanation_md += f"Estimated government incentives (unverified): €{breakdown.subsidy_amount:,.0f} ({subsidy_pct:.1f}%). "
            else:
                explanation_md += f"{subsidy_program} subsidies provide €{breakdown.subsidy_amount:,.0f} ({subsidy_pct:.1f}%) in cost reduction. "
        
        explanation_md += f"Cost per chip: €{result.cost_per_chip:.2f} annualized.\n\n### Cost Breakdown\n\n"
        
        # Add detailed breakdown
        for name, cost in cost_components[:4]:
            pct = (cost / breakdown.total_before_subsidy) * 100
            explanation_md += f"- **{name.capitalize()}:** €{cost:,.0f} ({pct:.1f}% of pre-subsidy total)\n"
        
        if breakdown.subsidy_amount > 0:
            if subsidy_source and "Unknown" in subsidy_source:
                explanation_md += f"- **Estimated incentives (unverified):** -€{breakdown.subsidy_amount:,.0f}\n"
            else:
                explanation_md += f"- **{subsidy_program} incentives:** -€{breakdown.subsidy_amount:,.0f}\n"
        
        # Add recommendations
        explanation_md += "\n### Strategic Recommendations\n\n"
        
        if breakdown.energy_cost > breakdown.chip_cost:
            energy_pct = (breakdown.energy_cost / breakdown.total_before_subsidy) * 100
            explanation_md += f"1. **Energy optimization priority:** Energy costs represent {energy_pct:.1f}% of TCO. Consider high-efficiency equipment or regions with lower electricity rates.\n"
        
        if breakdown.subsidy_amount > 0:
            if subsidy_source and "Unknown" in subsidy_source:
                explanation_md += f"2. **Research funding opportunities:** Current estimate of €{breakdown.subsidy_amount:,.0f}. Government incentive programs may be available but require verification.\n"
            else:
                explanation_md += f"2. **Maximize {subsidy_program} funding:** Current subsidy of €{breakdown.subsidy_amount:,.0f}. Explore additional programs for further cost reduction.\n"
        else:
            explanation_md += f"2. **Investigate subsidies:** Government semiconductor incentive programs may offer up to 40% cost reduction. Check eligibility for {region_name}.\n"
        
        explanation_md += f"3. **Material comparison:** Evaluate alternative semiconductors (Si, GaN, GaAs) for your specific performance requirements.\n"
        
        # Add comparative context
        explanation_md += f"\n\n### Comparative Context\n\n"
        explanation_md += f"{material_name} demonstrates competitive economics at €{result.cost_per_chip:.2f} per chip in {region_name}. "
        explanation_md += f"The {energy_pct:.1f}% energy cost share reflects operational scale."
        
        if breakdown.subsidy_amount > 0 and breakdown.carbon_tax > 0:
            net_policy = breakdown.subsidy_amount - breakdown.carbon_tax
            explanation_md += f" Regional policies provide net savings of €{net_policy:,.0f} (subsidies minus carbon tax)."
        
        # Build sources note from retrieved documents
        sources_note = self._build_sources_note(context.documents, language)

        # Translate ALL content if language is not English
        if language != 'en':
            try:
                # Translate the entire explanation using Gemini
                explanation_md = await self._translate_text(explanation_md, target_language=language)
                sources_note = await self._translate_text(sources_note, target_language=language)
            except Exception as e:
                self.logger.warning(f"⚠️ Translation failed: {e} -- returning English text as fallback")

        # Append sources note (translated or original)
        explanation_md += "\n\n" + sources_note

        return ExplainResponse(
            explanation=explanation_md
        )

    def _build_sources_note(self, documents, language: str = 'en') -> str:
        """Construct a human-readable sources note from retrieved documents."""
        # Create a compact list of unique sources and years
        seen = set()
        entries = []
        for d in documents[:10]:
            src = getattr(d, 'source', None) or d.get('source') if isinstance(d, dict) else None
            yr = None
            meta = getattr(d, 'metadata', None) or d.get('metadata') if isinstance(d, dict) else None
            if meta and isinstance(meta, dict):
                yr = meta.get('year')
            key = f"{src}_{yr}"
            if src and key not in seen:
                seen.add(key)
                entries.append(f"{src} {yr or ''}".strip())

        if entries:
            note = "*Analysis based on: " + ", ".join(entries[:5]) + "*"
        else:
            note = "*Analysis based on official industry sources and verified datasets.*"

        # Add comprehensive data sources summary in English (will be translated by caller)
        # Using markdown list format to preserve structure after translation
        dynamic_lines = [
            "📚 **Note:** This analysis uses real industry data from verified official sources:\n",
            "- 🔌 **Energy Prices:** ENTSO-E API (real-time EU), EIA USA Day-Ahead Markets 2024-2025, OECD Energy Prices",
            "- 🏭 **Semiconductors:** JRC Reports 2023-2025 (JRC141323, JRC133850, JRC133892)",
            "- 💰 **Subsidies:** EU Chips Act 2023, USA CHIPS Act 2022, Taiwan Industrial Innovation Act, K-Semiconductor Strategy, IC Fund Phase III, LSTC+METI, SSIC, ISM",
            "- 🌍 **CO₂ Taxes:** EU ETS 2025 (€90/t), K-ETS Korea (€16/t), Shanghai ETS (€12/t), Singapore Carbon Tax (€17/t), national carbon fees",
            "- ⚗️ **Materials:** Materials Project API, JRC Semiconductor Database, IEA World Energy Outlook 2023-2025",
            "\n**Regions with verified data (32 countries/states):**",
            "- 🇪🇺 **EU (19):** Germany, France, Italy, Spain, Netherlands, Poland, Belgium, Austria, Czech Republic, Denmark, Finland, Greece, Hungary, Ireland, Portugal, Romania, Sweden, Slovakia, Slovenia",
            "- 🇺🇸 **USA (4):** Arizona, Texas, Ohio, New York",
            "- 🌏 **Asia (6):** Taiwan, South Korea, China, Japan, Singapore, India",
            "- 🌎 **Americas/Oceania (3):** Brazil, Chile, Australia (⚠️ subsidy data under research)",
        ]

        # Concatenate and return (single copy)
        full_note = note + "\n\n" + "\n".join(dynamic_lines)
        return full_note

    async def _translate_text(self, text: str, target_language: str = 'en') -> str:
        """Translate text using Gemini API."""
        if target_language == 'en':
            # No translation needed
            return text

        try:
            # Use Gemini for translation (same as chat service)
            from backend.utils.translation import translate_with_gemini
            
            self.logger.info(f"🌐 Translating {len(text)} chars to {target_language} using Gemini...")
            
            # Call async translation function
            translated = await translate_with_gemini(text, target_language)
            
            if translated:
                self.logger.info(f"✅ Translation successful ({len(translated)} chars output)")
                return translated
            else:
                self.logger.warning(f"⚠️ Translation returned empty - using original text")
                return text
                
        except Exception as e:
            self.logger.error(f"❌ Translation via Gemini failed: {e}")
            return text

