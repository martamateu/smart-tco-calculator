# Smart TCO Calculator

**Total Cost of Ownership Calculator for Semiconductor Materials**

[![Deploy Frontend](https://github.com/martamateu/smart-tco-calculator/actions/workflows/deploy.yml/badge.svg)](https://github.com/martamateu/smart-tco-calculator/actions/workflows/deploy.yml)

Real-time TCO analysis for semiconductor manufacturing across 27 materials and 18 global regions with automated price updates and AI-powered insights.

🌐 **Live Demo:** [https://martamateu.github.io/smart-tco-calculator/](https://martamateu.github.io/smart-tco-calculator/)

---

## 📊 Data Sources & Update Frequency

### ✅ Live Data (Auto-Updated)

| Data Type | Source | Update Frequency | Regions | API Status |
|-----------|--------|------------------|---------|------------|
| **EU Energy Prices** | [ENTSO-E Transparency Platform](https://transparency.entsoe.eu/) | Every 8 hours | 19 EU countries | ✅ Active |
| **USA Energy Prices** | [EIA Open Data](https://www.eia.gov/opendata/) | Daily at 6 AM EST | 5 states (CA, TX, AZ, OH, NY) | ✅ Active |
| **Material Properties** | [Materials Project REST API](https://materialsproject.org/) | Quarterly (Jan/Apr/Jul/Oct) | 27 semiconductors | ✅ Active |

**EU Regions (ENTSO-E):** Austria, Belgium, Bulgaria, Croatia, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Netherlands, Poland, Portugal, Spain, United Kingdom

**USA Regions (EIA):** California, Texas, Arizona, Ohio, New York

**Materials (Properties from Materials Project):**
- Traditional: Si, Ge
- Wide-bandgap: SiC  
- Ultra-wide: C (Diamond)
- III-V Compounds: GaAs, GaP, GaSb, InP, InAs, InSb, AlP, AlAs, AlSb
- III-Nitrides: GaN, AlN, InN
- II-VI Compounds: ZnO, ZnS, ZnSe, ZnTe, CdS, CdSe, CdTe
- 2D Materials: MoS₂, WS₂, WSe₂, MoSe₂

### 📁 Static Data (Manual Updates)

| Data Type | Source | Update Method | Last Updated |
|-----------|--------|---------------|--------------|
| **Chip Costs** | IC Insights, Yole, TSMC reports | Manual quarterly | 2024 Q4 |
| **Subsidies** | EU Chips Act, USA CHIPS Act, national programs | Manual annually | 2025 Jan |
| **Carbon Taxes** | EU ETS, national carbon pricing schemes | Manual quarterly | 2025 Jan |
| **TRL Levels** | Industry reports, academic publications | Manual annually | 2024 |
| **Material Costs** | Industry pricing, wafer costs | Manual quarterly | 2024 Q4 |

**Why Static?**
- No public APIs available for semiconductor pricing or government subsidy programs
- Data changes infrequently (quarterly/annually)
- Requires manual verification from official sources

---

## 🏗️ Architecture

### Backend (FastAPI + Cloud Run)
- **Hosting:** Google Cloud Run (europe-west1)
- **URL:** https://smart-tco-backend-859997094469.europe-west1.run.app
- **Storage:** Cloud Storage (`tco-calculator-cache`) for persistent data
- **Schedulers:** Cloud Scheduler with OIDC authentication
  - `refresh-entsoe-prices`: Every 8 hours (Europe/Madrid)
  - `refresh-eia-prices`: Daily at 6 AM (America/New_York)
  - `refresh-materials-project`: Quarterly - 1st of Jan/Apr/Jul/Oct at 3 AM (Europe/Madrid)

### Frontend (React + GitHub Pages)
- **Hosting:** GitHub Pages
- **URL:** https://martamateu.github.io/smart-tco-calculator/
- **CI/CD:** GitHub Actions auto-deploy on push to main
- **Languages:** English, Spanish, Catalan

### Data Pipeline
```
┌─────────────────┐
│  External APIs  │
│  ENTSO-E / EIA  │
│  Materials Proj │
└────────┬────────┘
         │ Cloud Schedulers
         ▼
┌─────────────────┐
│  Cloud Run      │
│  FastAPI Backend│
└────────┬────────┘
         │ Upload
         ▼
┌─────────────────┐
│  Cloud Storage  │
│  GCS Bucket     │
│  (Persistent)   │
└────────┬────────┘
         │ Load on startup
         ▼
┌─────────────────┐
│  API Endpoints  │
│  /api/regions   │
│  /api/materials │
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18
- Python ≥3.10
- Google Cloud SDK (for deployment)

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables (create .env file)
cp .env.example .env
# Add your API keys: ENTSOE_API_KEY, EIA_API_KEY, MATERIALS_PROJECT_API_KEY

# Run server
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

#### Frontend
```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📡 API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API root with metadata |
| `/health` | GET | Server health check |
| `/health/ready` | GET | Readiness check (data loaded) |
| `/api/materials` | GET | 27 semiconductor materials |
| `/api/regions` | GET | 18 regions with live energy prices |
| `/api/scenarios` | POST | TCO scenario comparison |
| `/api/predict` | POST | Calculate TCO for inputs |
| `/api/explain` | POST | AI explanation (Gemini) |
| `/api/chat` | POST | Q&A chatbot (RAG + Gemini) |
| `/api/admin/status` | GET | System status (cache age, materials DB) |
| `/api/admin/cache-status` | GET | Detailed cache debugging info |

### Admin Endpoints (Require Auth)

| Endpoint | Method | Description | Trigger |
|----------|--------|-------------|---------|
| `/api/admin/refresh-prices/entsoe` | POST | Update EU energy prices | Cloud Scheduler (8h) |
| `/api/admin/refresh-prices/eia` | POST | Update USA energy prices | Cloud Scheduler (daily) |
| `/api/admin/refresh-prices/materials-project` | POST | Update material properties | Cloud Scheduler (monthly) |
| `/api/admin/retrain-model` | POST | Retrain ML model | Manual |
| `/api/admin/audit` | POST | Run data quality audit | Manual |

**Authentication:** OIDC tokens (Cloud Scheduler) or Admin API Key

**Full API documentation:** [https://smart-tco-backend-859997094469.europe-west1.run.app/docs](https://smart-tco-backend-859997094469.europe-west1.run.app/docs)

---

## 🔧 Environment Variables

### Backend (.env)
```bash
# APIs
ENTSOE_API_KEY=your_entsoe_key          # Get from https://transparency.entsoe.eu/
EIA_API_KEY=your_eia_key                # Get from https://www.eia.gov/opendata/
MATERIALS_PROJECT_API_KEY=your_mp_key   # Get from https://materialsproject.org/
GEMINI_API_KEY=your_gemini_key          # Get from Google AI Studio

# Admin
ADMIN_API_KEY=your_admin_key            # For manual scheduler triggers

# GCP
GOOGLE_CLOUD_PROJECT=your-project-id
GCS_BUCKET_NAME=your-bucket-name

# Optional
USE_EMBEDDINGS=true                     # Enable RAG knowledge base
GEMINI_MODEL=gemini-2.5-flash          # AI model version
```

---

## 🌍 Deployment

### Backend (Cloud Run)

```bash
cd backend

# Build and deploy
gcloud run deploy smart-tco-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300s \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=tco-calculator-cache,GCP_PROJECT_ID=your-project

# Setup schedulers
./setup_cloud_schedulers.sh
./setup_materials_scheduler.sh
```

### Frontend (GitHub Pages)

Automatic deployment on push to main via GitHub Actions (`.github/workflows/deploy.yml`)

Manual deployment:
```bash
npm run build
npm run deploy
```

---

## 📦 Project Structure

```
smart-tco-calculator/
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Container build
│   ├── app.yaml                     # Cloud Run config
│   ├── routers/
│   │   ├── admin.py                 # Admin/scheduler endpoints
│   │   ├── tco.py                   # TCO calculation endpoints
│   │   └── rag.py                   # AI/RAG endpoints
│   ├── services/
│   │   ├── data_access.py           # Material/region catalog
│   │   ├── tco_calculator.py        # TCO calculation logic
│   │   └── rag_service.py           # RAG knowledge engine
│   ├── utils/
│   │   ├── fetch_energy_prices.py   # ENTSO-E API client
│   │   ├── fetch_eia_prices.py      # EIA API client
│   │   ├── fetch_materials_project.py # Materials Project client
│   │   ├── gcs_cache.py             # Cloud Storage operations
│   │   └── data_audit.py            # Data quality checks
│   ├── data/
│   │   ├── semiconductors_comprehensive.json  # 27 materials
│   │   ├── global_electricity_data_2025.json  # Subsidies/carbon
│   │   └── *.pdf                    # RAG knowledge base docs
│   └── models/
│       └── tco_random_forest.pkl    # Trained ML model
├── components/
│   ├── InputForm.tsx                # Material/region selection
│   ├── ResultsCard.tsx              # TCO results display
│   ├── ScenarioChart.tsx            # Scenario comparison charts
│   └── NavBar.tsx                   # Navigation/language switcher
├── contexts/
│   └── LanguageContext.tsx          # i18n state management
├── locales/
│   ├── en.ts                        # English translations
│   ├── es.ts                        # Spanish translations
│   └── cat.ts                       # Catalan translations
├── services/
│   └── api.ts                       # Frontend API client
├── types.ts                         # TypeScript interfaces
├── App.tsx                          # React app root
└── README.md                        # This file
```

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
npm test
```

### Manual API Testing
```bash
# Test health
curl https://smart-tco-backend-859997094469.europe-west1.run.app/health

# Test materials
curl https://smart-tco-backend-859997094469.europe-west1.run.app/api/materials

# Test cache status
curl https://smart-tco-backend-859997094469.europe-west1.run.app/api/admin/cache-status

# Trigger manual update (requires API key)
curl -X POST \
  https://smart-tco-backend-859997094469.europe-west1.run.app/api/admin/refresh-prices/entsoe \
  -H "X-API-Key: your-admin-key"
```

---

## 📊 Monitoring

### Cache Status
```bash
# Check cache age and status
curl https://smart-tco-backend-859997094469.europe-west1.run.app/api/admin/cache-status
```

### Cloud Scheduler Logs
```bash
gcloud logging read 'resource.type=cloud_scheduler_job' \
  --limit=20 \
  --project=calcium-land-466213-e0
```

### Cloud Run Logs
```bash
gcloud logging read 'resource.type=cloud_run_revision' \
  --limit=50 \
  --project=calcium-land-466213-e0
```

---

## 🔐 Security

- **OIDC Authentication:** Cloud Schedulers use service account OIDC tokens (no API keys in config)
- **Secret Manager:** All API keys stored in Google Secret Manager
- **CORS:** Configured for GitHub Pages origin only
- **Rate Limiting:** Implemented on all public endpoints
- **Admin Endpoints:** Protected with Admin API Key + OIDC

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m '✨ Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style:**
- Backend: PEP 8 (Python), type hints required
- Frontend: ESLint + Prettier (React/TypeScript)
- Commits: [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Marta Mateu** - *Initial work* - [martamateu](https://github.com/martamateu)

---

## 🙏 Acknowledgments

- **ENTSO-E** for European energy price data
- **EIA** for USA energy price data
- **Materials Project** for semiconductor material properties
- **Google Gemini** for AI-powered explanations
- **EU Chips Act & USA CHIPS Act** for subsidy data

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check API documentation at `/docs` endpoint
- Review data sources in `/backend/data/`

---

**Last Updated:** October 2025
**Version:** 1.0.0
**Status:** ✅ Production