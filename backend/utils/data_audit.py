"""
Data Audit System - Verifies data freshness, availability, and model health.
Reports on data sources, ML models, RAG knowledge base, and missing data.
Provides recommendations for improvements and additional data sources.
"""

import json
import joblib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sys
import os


class DataAudit:
    """Comprehensive auditor for all data sources, ML models, and RAG system"""
    
    def __init__(self):
        self.backend_dir = Path(__file__).parent.parent
        self.data_dir = self.backend_dir / "data"
        self.cache_dir = self.data_dir / "cache"
        self.models_dir = self.backend_dir / "models"
        self.rag_dir = self.backend_dir / "data_knowledge_layer"
        
        self.results = {
            "audit_timestamp": datetime.now().isoformat(),
            "data_sources": [],
            "ml_models": [],
            "rag_knowledge_base": [],
            "missing_data": [],
            "expired_data": [],
            "healthy_data": [],
            "recommendations": [],
            "suggested_improvements": []
        }
    
    def audit_energy_prices(self) -> Dict:
        """Audit ENTSO-E energy prices cache"""
        cache_file = self.cache_dir / "energy_prices_live.json"
        
        audit = {
            "name": "Energy Prices (ENTSO-E)",
            "file": str(cache_file),
            "status": "unknown",
            "last_update": None,
            "age_hours": None,
            "ttl_hours": 24,
            "regions": 0,
            "message": ""
        }
        
        if not cache_file.exists():
            audit["status"] = "missing"
            audit["message"] = "Cache file not found - need to fetch from ENTSO-E API"
            self.results["missing_data"].append(audit)
            return audit
        
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
            
            last_update = datetime.fromisoformat(data['metadata']['last_update'])
            age_hours = (datetime.now() - last_update).total_seconds() / 3600
            regions = data['metadata']['regions_covered']
            
            audit["last_update"] = last_update.isoformat()
            audit["age_hours"] = round(age_hours, 1)
            audit["regions"] = regions
            
            if age_hours > 24:
                audit["status"] = "expired"
                audit["message"] = f"Data is {age_hours:.1f}h old (TTL: 24h) - needs refresh"
                self.results["expired_data"].append(audit)
            else:
                audit["status"] = "healthy"
                audit["message"] = f"Fresh data ({age_hours:.1f}h old) covering {regions} regions"
                self.results["healthy_data"].append(audit)
        
        except Exception as e:
            audit["status"] = "error"
            audit["message"] = f"Error reading cache: {str(e)}"
            self.results["missing_data"].append(audit)
        
        self.results["data_sources"].append(audit)
        return audit
    
    def audit_semiconductor_data(self) -> Dict:
        """Audit semiconductor materials database"""
        json_file = self.data_dir / "semiconductors_comprehensive.json"
        
        audit = {
            "name": "Semiconductor Materials (JRC/Materials Project)",
            "file": str(json_file),
            "status": "unknown",
            "materials": 0,
            "last_modified": None,
            "message": ""
        }
        
        if not json_file.exists():
            audit["status"] = "missing"
            audit["message"] = "Materials database not found"
            self.results["missing_data"].append(audit)
            return audit
        
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            audit["materials"] = len(data)
            
            # Get file modification time
            mtime = datetime.fromtimestamp(json_file.stat().st_mtime)
            audit["last_modified"] = mtime.isoformat()
            age_days = (datetime.now() - mtime).days
            
            if age_days > 90:
                audit["status"] = "expired"
                audit["message"] = f"Data is {age_days} days old - consider updating"
                self.results["expired_data"].append(audit)
            else:
                audit["status"] = "healthy"
                audit["message"] = f"{len(data)} materials loaded ({age_days} days old)"
                self.results["healthy_data"].append(audit)
        
        except Exception as e:
            audit["status"] = "error"
            audit["message"] = f"Error reading database: {str(e)}"
            self.results["missing_data"].append(audit)
        
        self.results["data_sources"].append(audit)
        return audit
    
    def audit_oecd_energy_prices(self) -> Dict:
        """Audit OECD energy prices (static baseline)"""
        csv_file = self.data_dir / "oecd_energy_prices.csv"
        
        audit = {
            "name": "OECD Energy Prices (Baseline)",
            "file": str(csv_file),
            "status": "unknown",
            "message": ""
        }
        
        if not csv_file.exists():
            audit["status"] = "missing"
            audit["message"] = "OECD baseline data not found"
            self.results["missing_data"].append(audit)
        else:
            audit["status"] = "healthy"
            audit["message"] = "Static baseline data available"
            self.results["healthy_data"].append(audit)
        
        self.results["data_sources"].append(audit)
        return audit
    
    def audit_jrc_semiconductor_data(self) -> Dict:
        """Audit JRC semiconductor manufacturing data"""
        csv_file = self.data_dir / "jrc_semiconductor_data.csv"
        
        audit = {
            "name": "JRC Semiconductor Manufacturing Data",
            "file": str(csv_file),
            "status": "unknown",
            "message": ""
        }
        
        if not csv_file.exists():
            audit["status"] = "missing"
            audit["message"] = "JRC data not found"
            self.results["missing_data"].append(audit)
        else:
            audit["status"] = "healthy"
            audit["message"] = "JRC data available"
            self.results["healthy_data"].append(audit)
        
        self.results["data_sources"].append(audit)
        return audit
    
    # ============================================================================
    # ML MODELS AUDIT
    # ============================================================================
    
    def audit_random_forest_model(self) -> Dict:
        """Audit Random Forest TCO prediction model"""
        pkl_file = self.models_dir / "tco_random_forest.pkl"
        json_file = self.models_dir / "tco_random_forest.json"
        
        audit = {
            "name": "Random Forest TCO Predictor",
            "model_file": str(pkl_file),
            "metadata_file": str(json_file),
            "status": "unknown",
            "model_type": "RandomForestRegressor",
            "training_date": None,
            "features": [],
            "accuracy_metrics": {},
            "message": ""
        }
        
        # Check if model file exists
        if not pkl_file.exists():
            audit["status"] = "missing"
            audit["message"] = "Model file not found - run train_tco_model.py"
            self.results["missing_data"].append(audit)
            self.results["ml_models"].append(audit)
            return audit
        
        try:
            # Load model
            model = joblib.load(pkl_file)
            audit["model_loaded"] = True
            
            # Get model info
            if hasattr(model, 'n_estimators'):
                audit["n_estimators"] = model.n_estimators
            if hasattr(model, 'max_depth'):
                audit["max_depth"] = model.max_depth
            if hasattr(model, 'n_features_in_'):
                audit["n_features"] = model.n_features_in_
            
            # Check metadata file
            if json_file.exists():
                with open(json_file, 'r') as f:
                    metadata = json.load(f)
                audit["training_date"] = metadata.get("training_date")
                audit["features"] = metadata.get("features", [])
                audit["accuracy_metrics"] = metadata.get("metrics", {})
                
                # Check model age
                if audit["training_date"]:
                    train_date = datetime.fromisoformat(audit["training_date"])
                    age_days = (datetime.now() - train_date).days
                    
                    if age_days > 90:
                        audit["status"] = "expired"
                        audit["message"] = f"Model is {age_days} days old - consider retraining"
                        self.results["expired_data"].append(audit)
                    else:
                        audit["status"] = "healthy"
                        audit["message"] = f"Model trained {age_days} days ago with {audit.get('n_features', '?')} features"
                        self.results["healthy_data"].append(audit)
            else:
                audit["status"] = "warning"
                audit["message"] = "Model exists but metadata missing"
                self.results["healthy_data"].append(audit)
        
        except Exception as e:
            audit["status"] = "error"
            audit["message"] = f"Error loading model: {str(e)}"
            self.results["missing_data"].append(audit)
        
        self.results["ml_models"].append(audit)
        return audit
    
    def suggest_additional_models(self):
        """Suggest additional ML models that could improve the system"""
        suggestions = [
            {
                "model_name": "Time Series Forecaster (Prophet/LSTM)",
                "purpose": "Predict energy price trends over 5-10 years",
                "priority": "HIGH",
                "benefits": "More accurate cost projections, better long-term planning",
                "data_needed": "Historical energy prices (5+ years), seasonal patterns",
                "complexity": "Medium"
            },
            {
                "model_name": "Subsidy Eligibility Classifier",
                "purpose": "Predict which regions/materials qualify for EU Chips Act subsidies",
                "priority": "MEDIUM",
                "benefits": "Automated subsidy recommendations, policy compliance",
                "data_needed": "EU Chips Act criteria, regional policy documents",
                "complexity": "Low"
            },
            {
                "model_name": "Carbon Footprint Estimator",
                "purpose": "Predict CO2 emissions by material/region with uncertainty bounds",
                "priority": "MEDIUM",
                "benefits": "Sustainability insights, carbon tax optimization",
                "data_needed": "Regional electricity carbon intensity, material lifecycle data",
                "complexity": "Medium"
            },
            {
                "model_name": "Supply Chain Risk Scorer",
                "purpose": "Assess geopolitical and supply chain risks for each region/material",
                "priority": "LOW",
                "benefits": "Risk-adjusted TCO, better strategic planning",
                "data_needed": "Trade data, geopolitical risk indices, supplier diversity metrics",
                "complexity": "High"
            }
        ]
        
        self.results["suggested_improvements"].extend(suggestions)
    
    # ============================================================================
    # RAG KNOWLEDGE BASE AUDIT
    # ============================================================================
    
    def audit_rag_documents(self) -> Dict:
        """Audit RAG knowledge base documents"""
        audit = {
            "name": "RAG Knowledge Base Documents",
            "status": "unknown",
            "document_sources": [],
            "total_documents": 0,
            "missing_sources": [],
            "message": ""
        }
        
        # Check for key document sources
        doc_sources = [
            ("EU Chips Act PDFs", "No official EU policy documents found"),
            ("JRC Research Papers", "No JRC research papers indexed"),
            ("OECD Energy Reports", "No OECD reports indexed"),
            ("Carbon Tax Legislation", "No carbon policy documents found"),
            ("Subsidy Programs", "No subsidy program guidelines indexed")
        ]
        
        # Check if markdown documentation exists
        markdown_docs = list(self.data_dir.glob("*.md"))
        if markdown_docs:
            audit["document_sources"].append({
                "source": "Markdown Documentation",
                "count": len(markdown_docs),
                "files": [d.name for d in markdown_docs]
            })
            audit["total_documents"] += len(markdown_docs)
        
        # Check CSV data files (used as documents)
        csv_files = list(self.data_dir.glob("*.csv"))
        if csv_files:
            audit["document_sources"].append({
                "source": "CSV Data Files",
                "count": len(csv_files),
                "files": [d.name for d in csv_files]
            })
            audit["total_documents"] += len(csv_files)
        
        # Check JSON data files
        json_files = [f for f in self.data_dir.glob("*.json") if f.name != "audit_report.json"]
        if json_files:
            audit["document_sources"].append({
                "source": "JSON Data Files",
                "count": len(json_files),
                "files": [d.name for d in json_files]
            })
            audit["total_documents"] += len(json_files)
        
        # Check PDF documents (NEW - for EU Chips Act, policy docs)
        pdf_files = list(self.data_dir.glob("*.pdf"))
        if pdf_files:
            audit["document_sources"].append({
                "source": "PDF Documents",
                "count": len(pdf_files),
                "files": [d.name for d in pdf_files]
            })
            audit["total_documents"] += len(pdf_files)
        
        if audit["total_documents"] > 0:
            audit["status"] = "healthy"
            audit["message"] = f"{audit['total_documents']} documents available for RAG"
            self.results["healthy_data"].append(audit)
        else:
            audit["status"] = "warning"
            audit["message"] = "Limited knowledge base - only using generated mock data"
            self.results["expired_data"].append(audit)
        
        # Note missing official documents
        audit["missing_sources"] = [
            "Official EU Chips Act policy PDFs",
            "EU Commission subsidy program guidelines",
            "JRC technical research papers",
            "OECD comprehensive energy statistics reports",
            "Regional carbon tax legislation documents"
        ]
        
        self.results["rag_knowledge_base"].append(audit)
        return audit
    
    def audit_rag_embeddings(self) -> Dict:
        """Audit RAG vector embeddings and FAISS index"""
        audit = {
            "name": "RAG Vector Embeddings (FAISS)",
            "status": "unknown",
            "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
            "index_file": None,
            "vector_dimensions": 384,
            "message": ""
        }
        
        # Check for FAISS index file (if saved)
        possible_index_paths = [
            self.data_dir / "faiss_index.bin",
            self.cache_dir / "faiss_index.bin",
            self.rag_dir / "faiss_index.bin"
        ]
        
        index_exists = False
        for path in possible_index_paths:
            if path.exists():
                audit["index_file"] = str(path)
                index_exists = True
                break
        
        if index_exists:
            audit["status"] = "healthy"
            audit["message"] = "FAISS index found - fast vector search available"
            self.results["healthy_data"].append(audit)
        else:
            audit["status"] = "runtime"
            audit["message"] = "FAISS index built at runtime (not persisted) - acceptable for small knowledge bases"
            self.results["healthy_data"].append(audit)
        
        self.results["rag_knowledge_base"].append(audit)
        return audit
    
    def suggest_additional_data_sources(self):
        """Suggest additional data sources to improve accuracy"""
        suggestions = [
            {
                "source": "European Commission DG CONNECT",
                "data_type": "Official EU Chips Act implementation guidelines",
                "url": "https://digital-strategy.ec.europa.eu/en/policies/european-chips-act",
                "priority": "HIGH",
                "benefits": "Accurate subsidy calculations, policy compliance",
                "format": "PDF documents"
            },
            {
                "source": "ENTSO-E Historical Data",
                "data_type": "5-10 years of electricity price history",
                "url": "https://transparency.entsoe.eu/",
                "priority": "HIGH",
                "benefits": "Train time series forecasting models, trend analysis",
                "format": "CSV/API"
            },
            {
                "source": "World Bank Carbon Pricing Dashboard",
                "data_type": "Carbon tax rates by country, historical trends",
                "url": "https://carbonpricingdashboard.worldbank.org/",
                "priority": "MEDIUM",
                "benefits": "Accurate carbon cost projections",
                "format": "Excel/CSV"
            },
            {
                "source": "IEA Electricity Information",
                "data_type": "Detailed electricity generation mix by country",
                "url": "https://www.iea.org/data-and-statistics",
                "priority": "MEDIUM",
                "benefits": "Carbon intensity calculations, sustainability insights",
                "format": "Excel/API"
            },
            {
                "source": "Semiconductor Industry Association (SIA)",
                "data_type": "Chip pricing trends, production volume statistics",
                "url": "https://www.semiconductors.org/",
                "priority": "MEDIUM",
                "benefits": "More accurate chip cost estimates",
                "format": "Reports/PDF"
            },
            {
                "source": "YOLE Développement Market Research",
                "data_type": "SiC/GaN market forecasts, pricing trends",
                "url": "https://www.yolegroup.com/",
                "priority": "LOW",
                "benefits": "Advanced materials cost projections",
                "format": "Commercial reports"
            },
            {
                "source": "EU Regional Policy Database",
                "data_type": "Regional development funds, innovation grants",
                "url": "https://ec.europa.eu/regional_policy/",
                "priority": "LOW",
                "benefits": "Additional subsidy opportunities beyond Chips Act",
                "format": "Database/PDF"
            }
        ]
        
        self.results["suggested_improvements"].extend(suggestions)
    
    def generate_recommendations(self):
        """Generate action recommendations based on audit"""
        if self.results["missing_data"]:
            self.results["recommendations"].append({
                "priority": "HIGH",
                "action": "Fetch missing data sources",
                "details": f"{len(self.results['missing_data'])} sources missing",
                "commands": [
                    "python backend/utils/fetch_energy_prices.py",
                    "python backend/train_tco_model.py"
                ]
            })
        
        if self.results["expired_data"]:
            self.results["recommendations"].append({
                "priority": "MEDIUM",
                "action": "Refresh expired data",
                "details": f"{len(self.results['expired_data'])} sources need update"
            })
        
        # Check if energy prices need refresh
        energy_audit = next((s for s in self.results["data_sources"] if "Energy Prices" in s["name"]), None)
        if energy_audit and energy_audit.get("age_hours", 0) > 12:
            self.results["recommendations"].append({
                "priority": "MEDIUM",
                "action": "Set up Cloud Scheduler for ENTSO-E API",
                "details": "Run fetch_energy_prices.py every 12 hours",
                "command": "gcloud scheduler jobs create http energy-price-update --schedule='0 */12 * * *' --uri='https://your-cloud-run-url/api/update-energy-prices'"
            })
        
        # Check ML model freshness
        ml_audit = next((s for s in self.results["ml_models"] if "Random Forest" in s["name"]), None)
        if ml_audit and ml_audit.get("status") in ["missing", "expired"]:
            self.results["recommendations"].append({
                "priority": "HIGH",
                "action": "Train/Retrain Random Forest model",
                "details": "Model missing or outdated",
                "command": "python backend/train_tco_model.py"
            })
        
        # Check RAG knowledge base
        rag_audit = next((s for s in self.results["rag_knowledge_base"] if "Documents" in s["name"]), None)
        if rag_audit and rag_audit.get("total_documents", 0) < 20:
            self.results["recommendations"].append({
                "priority": "MEDIUM",
                "action": "Expand RAG knowledge base",
                "details": f"Only {rag_audit.get('total_documents', 0)} documents - add EU policy PDFs, research papers",
                "next_steps": "See 'suggested_improvements' section for data sources"
            })
    
    def run_full_audit(self) -> Dict:
        """Run complete audit of all data sources, models, and RAG system"""
        print("🔍 Running Comprehensive Data & Model Audit...")
        print("=" * 80)
        
        # === DATA SOURCES ===
        print("\n📊 DATA SOURCES")
        print("-" * 80)
        self.audit_energy_prices()
        self.audit_semiconductor_data()
        self.audit_oecd_energy_prices()
        self.audit_jrc_semiconductor_data()
        
        # === ML MODELS ===
        print("\n🤖 ML MODELS")
        print("-" * 80)
        self.audit_random_forest_model()
        
        # === RAG KNOWLEDGE BASE ===
        print("\n📚 RAG KNOWLEDGE BASE")
        print("-" * 80)
        self.audit_rag_documents()
        self.audit_rag_embeddings()
        
        # === SUGGESTIONS ===
        print("\n💡 GENERATING RECOMMENDATIONS...")
        print("-" * 80)
        self.suggest_additional_models()
        self.suggest_additional_data_sources()
        self.generate_recommendations()
        
        # === SUMMARY ===
        print(f"\n� AUDIT SUMMARY")
        print("=" * 80)
        print(f"✅ Healthy Data:     {len(self.results['healthy_data'])} sources")
        print(f"⚠️  Expired Data:     {len(self.results['expired_data'])} sources")
        print(f"❌ Missing Data:     {len(self.results['missing_data'])} sources")
        print(f"🤖 ML Models:        {len(self.results['ml_models'])} models")
        print(f"📚 RAG Documents:    {sum(s.get('total_documents', 0) for s in self.results['rag_knowledge_base'])} docs")
        
        if self.results["recommendations"]:
            print(f"\n💡 IMMEDIATE ACTIONS ({len(self.results['recommendations'])})")
            print("=" * 80)
            for i, rec in enumerate(self.results["recommendations"], 1):
                print(f"{i}. [{rec['priority']:6s}] {rec['action']}")
                print(f"   → {rec['details']}")
                if 'command' in rec:
                    print(f"   $ {rec['command']}")
                if 'commands' in rec:
                    for cmd in rec['commands']:
                        print(f"   $ {cmd}")
                print()
        
        if self.results["suggested_improvements"]:
            print(f"\n🚀 SUGGESTED IMPROVEMENTS ({len(self.results['suggested_improvements'])})")
            print("=" * 80)
            
            # Group by type
            models = [s for s in self.results["suggested_improvements"] if 'model_name' in s]
            data_sources = [s for s in self.results["suggested_improvements"] if 'source' in s]
            
            if models:
                print("\n📈 Additional ML Models:")
                for model in models:
                    print(f"\n  • {model['model_name']} [{model['priority']}]")
                    print(f"    Purpose: {model['purpose']}")
                    print(f"    Benefits: {model['benefits']}")
                    print(f"    Complexity: {model['complexity']}")
            
            if data_sources:
                print("\n📊 Additional Data Sources:")
                for ds in data_sources:
                    print(f"\n  • {ds['source']} [{ds['priority']}]")
                    print(f"    Data: {ds['data_type']}")
                    print(f"    URL: {ds['url']}")
                    print(f"    Benefits: {ds['benefits']}")
        
        return self.results
    
    def save_report(self, output_path: Optional[Path] = None):
        """Save audit report to JSON file"""
        if not output_path:
            output_path = self.data_dir / "audit_report.json"
        
        with open(output_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"📄 Audit report saved: {output_path}")
        return output_path


if __name__ == "__main__":
    auditor = DataAudit()
    results = auditor.run_full_audit()
    auditor.save_report()
    
    # Exit with error code if there are missing sources
    if results["missing_data"]:
        sys.exit(1)
