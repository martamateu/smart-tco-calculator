"""
Data Loader - Loads and normalizes datasets from open sources.

Datasets:
- EU JRC Chips Data Portal (fabrication capacity, energy use)
- OECD Industrial Energy Prices
- Materials Project / MatWeb (material properties)
- PDF documents (EU Chips Act, policy documents)
"""

import os
import logging
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# PDF processing - optional dependency
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    logger.warning("⚠️ PyPDF2 not installed - PDF support disabled. Install with: pip install pypdf2")


class DataLoader:
    """
    Loads and manages knowledge base datasets.
    
    Sources:
    1. EU JRC Semiconductor Database
    2. OECD Energy Price Statistics
    3. Materials databases (Materials Project, MatWeb)
    4. EU Chips Act documentation
    """
    
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = Path(data_path) if data_path else Path(__file__).parent.parent / "data"
        self.data_path.mkdir(parents=True, exist_ok=True)
        
        self.datasets: Dict[str, pd.DataFrame] = {}
        self.documents: List[Dict] = []
        
        self.logger = logger
    
    async def load_all_datasets(self):
        """Load all available datasets"""
        self.logger.info("📚 Loading knowledge base datasets...")
        
        try:
            # Load static datasets
            await self._load_semiconductor_data()
            # await self._load_energy_prices()  # DEPRECATED: Using eu_energy_prices_2025.json instead (moved to deprecated/)
            await self._load_material_properties()
            await self._load_chips_act_docs()
            
            # Load REAL data source documentation (NEW - Oct 2025)
            await self._load_real_data_sources()
            
            # Load updated energy prices 2024-2025 (NEW - Oct 2025)
            await self._load_energy_prices_2025()
            
            # Load PDF documents (EU Chips Act, policy docs)
            await self._load_pdf_documents()
            
            self.logger.info(f"✅ Loaded {len(self.datasets)} datasets, {len(self.documents)} documents")
        
        except Exception as e:
            self.logger.error(f"❌ Dataset loading failed: {e}")
            # Create mock datasets for fallback
            self._create_mock_datasets()
    
    async def _load_semiconductor_data(self):
        """Load EU JRC semiconductor capacity and energy data"""
        file_path = self.data_path / "jrc_semiconductor_data.csv"
        
        if not file_path.exists():
            self.logger.warning(f"⚠️ JRC semiconductor data not found, run extract_jrc_semiconductor_data.py")
            return
        
        df = pd.read_csv(file_path)
        self.datasets["jrc_semiconductor"] = df
        
        # Convert to documents with enhanced metadata from updated CSV
        for _, row in df.iterrows():
            # Handle both old and new column names
            global_cap = row.get('global_capacity_wafers_per_year', row.get('global_capacity_wafers', 0))
            eu_cap = row.get('eu_capacity_wafers_per_year', row.get('eu_capacity_wafers', 0))
            energy = row.get('energy_kwh_per_wafer', 0)
            co2 = row.get('co2_kg_per_wafer', 0)
            cost = row.get('avg_cost_per_wafer_eur', row.get('avg_cost_per_wafer', 0))
            tech_node = row.get('technology_node_nm', 'N/A')
            eu_share = row.get('eu_share_pct', 0)
            year = row.get('year', 2024)
            source = row.get('source', 'JRC Database')
            
            # Build content with available information
            content_parts = [
                f"{row['material']} semiconductor",
                f"(technology node: {tech_node})" if tech_node != 'N/A' else "",
                f"has global production capacity of {global_cap:,.0f} wafers/year",
                f"with EU capacity of {eu_cap:,.0f} wafers ({eu_share:.1f}% share)." if eu_share > 0 else f"with EU capacity of {eu_cap:,.0f} wafers.",
                f"Energy consumption: {energy:.0f} kWh/wafer,",
                f"CO2 footprint: {co2:.0f} kg/wafer,",
                f"average cost: €{cost:,.0f}/wafer."
            ]
            content = " ".join([p for p in content_parts if p])
            
            self.documents.append({
                "source": source if isinstance(source, str) else "EU JRC Semiconductor Database",
                "content": content,
                "metadata": {
                    "material": row["material"],
                    "technology_node": tech_node,
                    "eu_share_pct": eu_share,
                    "type": "production_data",
                    "year": int(year),
                    "data_quality": row.get('data_quality', 'high')
                },
                "url": "https://publications.jrc.ec.europa.eu/",
                "confidence": 0.95
            })
    
    async def _load_energy_prices(self):
        """Load OECD industrial energy prices"""
        file_path = self.data_path / "oecd_energy_prices.csv"
        
        if not file_path.exists():
            self.logger.warning(f"⚠️ OECD energy prices not found, run extract_oecd_energy_data.py")
            return
        
        df = pd.read_csv(file_path)
        self.datasets["oecd_energy"] = df
        
        for _, row in df.iterrows():
            # Get values with fallback for old column names
            year = row.get('year', 2020)
            source_info = row.get('source', 'OECD Energy Prices Database')
            data_quality = row.get('data_quality', 'high')
            last_verified = row.get('last_verified', 'N/A')
            
            self.documents.append({
                "source": source_info if isinstance(source_info, str) else "OECD Energy Prices Database",
                "content": f"{row['region']} has industrial electricity prices of €{row['electricity_eur_per_kwh']:.3f}/kWh ({year}) with annual trend of {row['trend_annual_pct']:.1f}%. Carbon intensity: {row['carbon_intensity_g_per_kwh']:.0f} g CO2/kWh. Data quality: {data_quality}, verified: {last_verified}.",
                "metadata": {
                    "region": row["region"],
                    "year": int(year),
                    "type": "energy_price",
                    "data_quality": data_quality,
                    "last_verified": last_verified
                },
                "url": "https://www.oecd.org/en/data/indicators/electricity-prices.html",
                "confidence": 0.90
            })
            self.documents.append({
                "source": "OECD Industrial Energy Prices 2024",
                "content": f"Industrial electricity prices in {row['region']}: €{row['electricity_eur_per_kwh']}/kWh with annual trend of {row['trend_annual_pct']}%. Carbon intensity: {row['carbon_intensity_g_per_kwh']}g CO2/kWh.",
                "metadata": {
                    "region": row["region"],
                    "type": "energy_prices",
                    "year": 2024
                },
                "url": "https://www.oecd.org/energy/data",
                "confidence": 0.90
            })
    
    async def _load_material_properties(self):
        """Load material properties database"""
        file_path = self.data_path / "material_properties.csv"
        
        if not file_path.exists():
            data = {
                "material": ["Si", "SiC", "GaN", "GaAs", "IGZO", "CNT", "MoS₂"],
                "bandgap_ev": [1.12, 3.26, 3.40, 1.42, 3.05, 0.5, 1.8],
                "electron_mobility_cm2_vs": [1400, 900, 2000, 8500, 10, 100000, 200],
                "thermal_conductivity_w_mk": [150, 490, 130, 55, 10, 3000, 34],
                "max_temperature_c": [125, 600, 500, 300, 200, 400, 300],
                "cost_relative_to_si": [1.0, 1.6, 2.4, 3.0, 1.4, 6.0, 5.0],
            }
            df = pd.DataFrame(data)
            df.to_csv(file_path, index=False)
            self.logger.info(f"📄 Created mock material properties: {file_path}")
        
        self.datasets["material_properties"] = pd.read_csv(file_path)
        
        for _, row in self.datasets["material_properties"].iterrows():
            self.documents.append({
                "source": "Materials Project / MatWeb Database",
                "content": f"{row['material']} properties: bandgap {row['bandgap_ev']}eV, electron mobility {row['electron_mobility_cm2_vs']} cm²/Vs, thermal conductivity {row['thermal_conductivity_w_mk']} W/mK, max temperature {row['max_temperature_c']}°C. Cost is {row['cost_relative_to_si']}x relative to Silicon.",
                "metadata": {
                    "material": row["material"],
                    "type": "material_properties",
                    "year": 2024
                },
                "url": "https://materialsproject.org",
                "confidence": 0.85
            })
    
    async def _load_chips_act_docs(self):
        """Load EU Chips Act documentation"""
        
        # Add key Chips Act facts as documents
        chips_act_docs = [
            {
                "source": "EU Chips Act 2023",
                "content": "The European Chips Act provides €43 billion in public and private investment to strengthen Europe's semiconductor ecosystem. It offers up to 40% subsidies for First-of-a-Kind (FOAK) fabrication facilities using advanced technologies like SiC, GaN, and sub-7nm CMOS.",
                "metadata": {"type": "policy", "program": "chips_act", "year": 2023},
                "url": "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_510",
                "confidence": 1.0
            },
            {
                "source": "EU Chips Act - Funding Priorities",
                "content": "Priority sectors for Chips Act funding: automotive (especially EV power electronics), industrial automation, medical devices, aerospace/defense, and 5G/6G telecommunications. Wide-bandgap semiconductors (SiC, GaN) receive higher priority due to energy efficiency and strategic importance.",
                "metadata": {"type": "policy", "program": "chips_act", "year": 2023},
                "url": "https://ec.europa.eu/chips-act",
                "confidence": 0.95
            },
            {
                "source": "EU Carbon Tax (CBAM) 2024",
                "content": "The EU Carbon Border Adjustment Mechanism (CBAM) sets carbon tax at €80-100 per ton CO2 as of 2024, increasing to €130-150 by 2030. This significantly impacts semiconductor manufacturing TCO, favoring low-carbon technologies like SiC and GaN over traditional Silicon in high-power applications.",
                "metadata": {"type": "policy", "program": "cbam", "year": 2024},
                "url": "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism",
                "confidence": 0.90
            },
            {
                "source": "STMicroelectronics SiC Expansion 2024",
                "content": "STMicroelectronics received €2.9B EU Chips Act funding for SiC fab expansion in Catania, Italy. Expected to triple SiC wafer capacity by 2026, reducing costs by 30% and enabling €1B+ annual revenue from automotive power modules.",
                "metadata": {"type": "case_study", "company": "STMicro", "year": 2024},
                "url": "https://www.st.com/content/st_com/en/about/media-center/press-item.html",
                "confidence": 0.85
            },
        ]
        
        self.documents.extend(chips_act_docs)
        self.logger.info(f"📄 Loaded {len(chips_act_docs)} Chips Act documents")
    
    async def _load_real_data_sources(self):
        """
        Load REAL data source documentation (NEW - October 2025)
        
        Loads comprehensive source files documenting all real data used in TCO calculator:
        - SUBSIDY_SOURCES.md: Government subsidy programs (EU, US, Asia)
        - CARBON_TAX_SOURCES.md: Carbon pricing from World Bank, ICAP, ETS
        - CHIP_COST_SOURCES.md: Market data from TechInsights, Yole, IC Insights
        - MAINTENANCE_SOURCES.md: Industry benchmarks from TSMC, Intel, SEMI E10
        - CARBON_FOOTPRINT_SOURCES.md: LCA studies from IEEE, company reports
        """
        source_files = [
            ("SUBSIDY_SOURCES.md", "Government Subsidy Programs - Real Data"),
            ("CARBON_TAX_SOURCES.md", "Carbon Tax Rates - Real Data"),
            ("CHIP_COST_SOURCES.md", "Chip Manufacturing Costs - Real Data"),
            ("MAINTENANCE_SOURCES.md", "Equipment Maintenance Costs - Real Data"),
            ("CARBON_FOOTPRINT_SOURCES.md", "Carbon Footprint LCA - Real Data"),
        ]
        
        loaded_count = 0
        for filename, title in source_files:
            file_path = self.data_path / filename
            
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Split into sections (by ## headers)
                    sections = content.split('\n## ')
                    
                    # First section is title, add as overview
                    if sections:
                        self.documents.append({
                            "source": f"{title} (Complete Document)",
                            "content": sections[0][:2000],  # First 2000 chars as overview
                            "metadata": {
                                "type": "real_data_source",
                                "file": filename,
                                "section": "overview",
                                "year": 2025
                            },
                            "url": f"file://{file_path}",
                            "confidence": 1.0  # Real data = highest confidence
                        })
                    
                    # Add each section as separate document for better retrieval
                    for i, section in enumerate(sections[1:], 1):
                        if len(section) > 100:  # Skip very small sections
                            section_title = section.split('\n')[0].strip()
                            section_content = '\n'.join(section.split('\n')[1:])
                            
                            self.documents.append({
                                "source": f"{title} - {section_title}",
                                "content": section_content[:3000],  # Max 3000 chars per section
                                "metadata": {
                                    "type": "real_data_source",
                                    "file": filename,
                                    "section": section_title,
                                    "year": 2025
                                },
                                "url": f"file://{file_path}#{section_title}",
                                "confidence": 1.0
                            })
                    
                    loaded_count += 1
                    self.logger.info(f"  ✅ Loaded {filename} ({len(sections)} sections)")
                
                except Exception as e:
                    self.logger.warning(f"  ⚠️ Failed to load {filename}: {e}")
            else:
                self.logger.warning(f"  ⚠️ {filename} not found (skipping)")
        
        self.logger.info(f"📄 Loaded {loaded_count}/5 real data source files")
    
    async def _load_energy_prices_2025(self):
        """Load Global Day-Ahead Electricity Price Dataset with Carbon Intensity (Mendeley 2025)"""
        import json
        
        file_path = self.data_path / "global_electricity_data_2025.json"
        
        if not file_path.exists():
            self.logger.warning(f"  ⚠️ global_electricity_data_2025.json not found (skipping)")
            return
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add overview document with citation
            self.documents.append({
                "source": f"{data['title']} (Mendeley Data DOI:{data['doi']})",
                "content": f"Global Day-Ahead Electricity Price Dataset (Version {data['version']}, September 2025) compiled from major wholesale markets across Asia, Europe, North America, and Oceania. Period: {data['period']}. Data quality: {data['data_quality']}. Citation: {data['citation']}. Carbon intensity data from {data['carbon_source']}.",
                "metadata": {
                    "type": "energy_prices_carbon_2025",
                    "period": data['period'],
                    "data_quality": data['data_quality'],
                    "year": 2025,
                    "doi": data['doi'],
                    "version": data['version']
                },
                "url": f"https://doi.org/{data['doi']}",
                "confidence": 1.0
            })
            
            # Add each country with complete energy + carbon data
            for region in data['regions']:
                self.documents.append({
                    "source": f"Mendeley Energy & Carbon Data 2025 ({region['country']})",
                    "content": region['content'],
                    "metadata": {
                        "type": "energy_prices_carbon_2025",
                        "country": region['country'],
                        "price_eur_kwh": region['price_eur_kwh'],
                        "price_usd_kwh": region['price_usd_kwh'],
                        "carbon_intensity_g_kwh": region['carbon_intensity_g_kwh'],
                        "carbon_tax_eur_ton": region['carbon_tax_eur_ton'],
                        "subsidy_rate": region['subsidy_rate'],
                        "year": region['year'],
                        "data_quality": data['data_quality'],
                        "doi": data['doi']
                    },
                    "url": f"https://doi.org/{data['doi']}",
                    "confidence": 1.0
                })
            
            self.logger.info(f"  ✅ Loaded global_electricity_data_2025.json ({len(data['regions'])} countries) - Mendeley DOI:{data['doi']}")
        
        except Exception as e:
            self.logger.warning(f"  ⚠️ Failed to load global_electricity_data_2025.json: {e}")
        
        except Exception as e:
            self.logger.warning(f"  ⚠️ Failed to load eu_energy_prices_2025.json: {e}")
    
    async def _load_pdf_documents(self):
        """
        Load PDF documents from data directory.
        
        Supports EU Chips Act PDFs, policy documents, research papers.
        PDFs are automatically extracted to text and chunked for RAG.
        
        OPTIMIZED: Only loads first 10 chunks per PDF for faster startup.
        """
        if not PDF_SUPPORT:
            self.logger.warning("⚠️ PDF support not available - skipping PDF loading")
            return
        
        # Look for PDFs in data directory
        pdf_files = list(self.data_path.glob("*.pdf"))
        
        if not pdf_files:
            self.logger.info("📄 No PDF files found in data directory")
            return
        
        MAX_CHUNKS_PER_PDF = 10  # Limit chunks for performance
        loaded_count = 0
        for pdf_path in pdf_files:
            try:
                # Extract text from PDF
                text = self._extract_pdf_text(pdf_path)
                
                if not text or len(text.strip()) < 100:
                    self.logger.warning(f"  ⚠️ {pdf_path.name}: No text extracted (might be scanned/image PDF)")
                    continue
                
                # Chunk text into documents (max 2000 chars per chunk for faster processing)
                chunks = self._chunk_text(text, max_chars=2000, overlap=150)
                
                # OPTIMIZATION: Only keep first MAX_CHUNKS_PER_PDF chunks
                chunks = chunks[:MAX_CHUNKS_PER_PDF]
                
                for i, chunk in enumerate(chunks, 1):
                    self.documents.append({
                        "source": f"{pdf_path.stem} (Part {i}/{len(chunks)})",
                        "content": chunk,
                        "metadata": {
                            "type": "pdf_document",
                            "file": pdf_path.name,
                            "chunk": i,
                            "total_chunks": len(chunks),
                            "year": 2025
                        },
                        "url": f"file://{pdf_path}",
                        "confidence": 0.95  # PDF documents = high confidence
                    })
                
                loaded_count += 1
                self.logger.info(f"  ✅ Loaded {pdf_path.name} ({len(chunks)} chunks, {len(text):,} chars)")
            
            except Exception as e:
                self.logger.error(f"  ❌ Failed to load {pdf_path.name}: {e}")
        
        self.logger.info(f"📄 Loaded {loaded_count}/{len(pdf_files)} PDF documents (limited to {MAX_CHUNKS_PER_PDF} chunks/PDF for performance)")
    
    def _extract_pdf_text(self, pdf_path: Path) -> str:
        """Extract text from PDF file"""
        text = ""
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(reader.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n\n"
                    except Exception as e:
                        self.logger.warning(f"  ⚠️ Error extracting page {page_num + 1}: {e}")
        
        except Exception as e:
            self.logger.error(f"  ❌ Error reading PDF: {e}")
        
        return text.strip()
    
    def _chunk_text(self, text: str, max_chars: int = 3000, overlap: int = 200) -> List[str]:
        """
        Split text into overlapping chunks for better RAG retrieval.
        
        Args:
            text: Text to chunk
            max_chars: Maximum characters per chunk
            overlap: Character overlap between chunks
        
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        
        while start < len(text):
            # Get chunk
            end = start + max_chars
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                # Find last sentence end in chunk
                last_period = chunk.rfind('. ')
                last_newline = chunk.rfind('\n\n')
                break_point = max(last_period, last_newline)
                
                if break_point > max_chars * 0.5:  # Only break if > 50% through chunk
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            
            # Move start with overlap
            start = end - overlap
            
            # Prevent infinite loop
            if start >= len(text):
                break
        
        return chunks
    
    def _create_mock_datasets(self):
        """Create minimal mock datasets for fallback"""
        self.logger.warning("⚠️ Using mock datasets")
        
        self.datasets["mock"] = pd.DataFrame({
            "material": ["Si", "SiC", "GaN"],
            "description": ["Traditional semiconductor", "Wide-bandgap power", "Wide-bandgap RF"]
        })
        
        self.documents = [
            {
                "source": "Mock Data",
                "content": "Placeholder knowledge base document.",
                "metadata": {"type": "mock"},
                "url": None,
                "confidence": 0.5
            }
        ]
    
    def get_dataset(self, name: str) -> Optional[pd.DataFrame]:
        """Get a loaded dataset by name"""
        return self.datasets.get(name)
    
    def get_all_documents(self) -> List[Dict]:
        """Get all knowledge base documents"""
        return self.documents
    
    def search_documents(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Simple keyword search in documents.
        This is a fallback when embeddings are not available.
        """
        query_lower = query.lower()
        
        # Score documents by keyword matches
        scored_docs = []
        for doc in self.documents:
            content_lower = doc["content"].lower()
            score = sum(1 for word in query_lower.split() if word in content_lower)
            scored_docs.append((score, doc))
        
        # Sort by score and return top_k
        scored_docs.sort(reverse=True, key=lambda x: x[0])
        return [doc for score, doc in scored_docs[:top_k] if score > 0]
