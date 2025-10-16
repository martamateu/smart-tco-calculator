# Smart TCO Calculator

**Total Cost of Ownership Calculator for Semiconductor Materials**

## Overview

Smart TCO Calculator is a full-stack web application for comparing the total cost of ownership (TCO) of semiconductor chips across regions, materials, and production scenarios. It features AI-powered analysis, live energy price integration, and multi-language support.

## Key Features

- Advanced TCO predictions using ML (Random Forest or formulas)
- Real-time energy prices from ENTSO-E/EIA APIs
- Government subsidies (EU Chips Act, USA CHIPS Act, Asia programs) automatically factored in
- Region/material catalogs with live data
- AI explanations using Gemini + RAG
- Interactive scenario comparison
- Multi-language UI (English, Spanish, Catalan)

## Architecture

- **Backend:** FastAPI, Python (ML/data logic, REST APIs)
  - Services for data access, ML calculations, RAG knowledge engine
- **Frontend:** React + TypeScript (UI, forms, API integration)
  - Contexts for language, scenario data
  - Modular components and services
- **Data:** Regional energy prices, material properties, subsidy info
- **CI/CD:** GitHub Actions deploys frontend to GitHub Pages

## Project Structure

- `backend/`: FastAPI server, ML and RAG logic
- `components/`: React UI components
- `contexts/`: State management/context providers (e.g., language)
- `services/`: API service modules
- `data/`: Datasets and ETL logic
- `locales/`: Translation/localization files

## Getting Started

### Prerequisites

- Node.js (>=18)
- Python (>=3.10)
- (Optional) Google Vertex/Gemini API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Deployment

- Frontend deployed via GitHub Actions to GitHub Pages
- Backend can be deployed to Cloud Run or any FastAPI-compatible service

## API Endpoints

| Route                | Method    | Purpose                                               |
|----------------------|-----------|-------------------------------------------------------|
| `/api/materials`     | GET       | Returns catalog of available semiconductor materials  |
| `/api/regions`       | GET       | Returns region catalog with live energy prices        |
| `/api/scenarios`     | GET       | Gets scenario comparisons for given material/region   |
| `/api/predict`       | POST      | Calculates TCO (Total Cost of Ownership) for inputs   |
| `/api/explain`       | POST      | Returns AI-generated explanation for TCO result       |
| `/api/chat`          | POST      | Q&A about results, scenarios, and context (Gemini+RAG)|
| `/health`            | GET       | Basic server health check                             |
| `/health/ready`      | GET       | Backend readiness check (data load, RAG status)       |
| `/api/ml_visualization` | GET/POST | ML model visualization endpoints                      |
| `/api/rag_visualization`| GET/POST | RAG knowledge base visualization endpoints            |
| `/api/admin`         | Various   | Admin and management utilities                        |
| `/`                  | GET       | API root endpoint, metadata docs and status           |

**All endpoints are documented at `/docs` when the backend is running.**

## Contribution Guidelines

- Fork the repository and create a feature branch
- Run all tests before submitting a pull request
- Document new features in README and/or relevant code files
- For backend: add test cases with `pytest`
- For frontend: use React Testing Library

