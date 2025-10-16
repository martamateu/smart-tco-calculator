# API Usage Audit & Code Simplification Report

## Executive Summary

This report audits all external API integrations in the Smart TCO Calculator backend and provides recommendations for code simplification.

**Date:** October 14, 2025  
**Author:** Marta Mateu (with Copilot assistance)

---

## 1. API Usage Audit Results

### ✅ Currently Active (Used in Production)

#### 1.1 Mendeley Data API
- **Location**: `backend/data_knowledge_layer/loader.py`
- **Purpose**: Load global electricity price dataset (DOI: 10.17632/s54n4tyyz4.3)
- **Usage**: Static dataset loaded at startup
- **Status**: **ACTIVE** ✅
- **Recommendation**: Keep, but migrate to Cloud Storage for faster loading

#### 1.2 IEA Grid Carbon Intensity Database
- **Location**: `backend/data_knowledge_layer/loader.py`
- **Purpose**: Carbon intensity (g CO2/kWh) by country
- **Usage**: Static dataset loaded at startup
- **Status**: **ACTIVE** ✅ (via JSON file)
- **Recommendation**: Keep in Cloud Storage

#### 1.3 Google Vertex AI (Embeddings & Gemini)
- **Location**: `backend/data_knowledge_layer/retriever.py`, `rag_engine.py`
- **Purpose**: RAG system embeddings and text generation
- **Usage**: On-demand for chat queries
- **Status**: **ACTIVE** ✅ (with fallback when disabled)
- **Recommendation**: Keep, works correctly

### ⚠️ Partially Active (Has Code, Rarely Used)

#### 1.4 ENTSO-E Transparency Platform API
- **Location**: `backend/utils/fetch_energy_prices.py`, `backend/routers/admin.py`
- **Purpose**: Real-time EU day-ahead electricity prices
- **Usage**: Admin endpoint `/api/admin/fetch-energy-prices` (manual trigger only)
- **Status**: **PARTIALLY ACTIVE** ⚠️
- **Current behavior**: 
  - Code exists and is functional
  - Requires `ENTSOE_API_KEY` environment variable
  - Only called via admin endpoint (not scheduled)
  - **NOT** used in production TCO calculations (using Mendeley dataset instead)
- **Recommendation**: 
  - **Option A (Conservative)**: Keep code for future real-time updates, but don't schedule
  - **Option B (Aggressive)**: Remove to simplify codebase, re-add if real-time feature requested

### ❌ Not Used (Dead Code)

#### 1.5 Materials Project API
- **Location**: Mentioned in comments, no active API calls
- **Purpose**: Semiconductor material properties
- **Usage**: Using static `semiconductors_comprehensive.json` instead
- **Status**: **NOT USED** ❌
- **Recommendation**: **REMOVE** references from comments to avoid confusion

#### 1.6 EIA (USA) Energy Prices API
- **Location**: None found (may have been removed already)
- **Purpose**: US day-ahead market prices
- **Usage**: Using Mendeley dataset for US regions
- **Status**: **NOT USED** ❌
- **Recommendation**: Confirmed removed, no action needed

#### 1.7 OECD Energy Prices API
- **Location**: None found (using static CSV file)
- **Purpose**: OECD country energy prices
- **Usage**: Using `oecd_energy_prices.csv` instead
- **Status**: **NOT USED** ❌
- **Recommendation**: Confirmed removed, no action needed

---

## 2. Code Simplification Recommendations

### 2.1 Remove Unused Imports & Comments

**Files to clean:**

```python
# backend/data_knowledge_layer/loader.py
# Line ~197: Remove MaterialsProject reference if no API call

# Before:
"url": "https://materialsproject.org",

# After: (only if truly not calling the API)
"url": None,  # Using static semiconductors_comprehensive.json
```

### 2.2 Consolidate Data Loading

**Current issue**: Data loading is split across multiple files
- `loader.py` - PDFs and JSON
- `data_access.py` - Materials and regions
- `train_tco_model.py` - Training datasets

**Recommendation**: Create a single `DataService` class

```python
# backend/services/data_service.py (NEW FILE)
from google.cloud import storage
import json
import pandas as pd

class DataService:
    """Centralized data loading from Cloud Storage or local files"""
    
    def __init__(self, use_cloud=True, bucket_name='smart-tco-calculator-data'):
        self.use_cloud = use_cloud
        if use_cloud:
            self.client = storage.Client()
            self.bucket = self.client.bucket(bucket_name)
    
    def load_materials(self):
        """Load semiconductor materials"""
        if self.use_cloud:
            return self._load_json_from_cloud('reference/semiconductors_comprehensive.json')
        return self._load_json_local('data/semiconductors_comprehensive.json')
    
    def load_regions(self):
        """Load regions with energy prices"""
        if self.use_cloud:
            return self._load_json_from_cloud('energy_prices/global_electricity_data_2025.json')
        return self._load_json_local('data/global_electricity_data_2025.json')
    
    def load_ml_model(self):
        """Load trained Random Forest model"""
        if self.use_cloud:
            import pickle
            blob = self.bucket.blob('models/tco_random_forest.pkl')
            return pickle.loads(blob.download_as_string())
        import joblib
        return joblib.load('models/tco_random_forest.pkl')
    
    def _load_json_from_cloud(self, path):
        blob = self.bucket.blob(path)
        return json.loads(blob.download_as_string())
    
    def _load_json_local(self, path):
        with open(path) as f:
            return json.load(f)
```

**Benefits:**
- Single source of truth for data loading
- Easy toggle between local and cloud storage
- Reduced code duplication
- Easier testing

### 2.3 Remove Unused Admin Endpoints (Optional)

**Current admin endpoints:**
- `/api/admin/fetch-energy-prices` - Calls ENTSO-E API (rarely used)
- `/api/admin/health` - Health check (useful, keep)
- `/api/admin/retrain-model` - ML retraining (useful, keep)

**Recommendation:**
- **Keep** `/api/admin/health` and `/api/admin/retrain-model`
- **Consider removing** `/api/admin/fetch-energy-prices` if not using real-time data
- **Alternative**: Keep but document as "Optional - for real-time price updates"

### 2.4 Simplify Translation Loading

**Current**: Translations in `/locales/*.ts` (TypeScript files)

**Status**: This is **OPTIMAL** ✅

**Reason**:
- React i18n best practice
- Compiled at build time (no runtime overhead)
- Type-safe with TypeScript
- Version controlled with code

**Recommendation**: No changes needed

---

## 3. Dependency Cleanup

### 3.1 Python Dependencies to Review

**Check `requirements.txt` for unused packages:**

```bash
# Run this in backend/
pip-autoremove <package> --yes  # For confirmed unused packages
```

**Likely unused (verify before removing):**
- Any Materials Project API client (if exists)
- Any OECD API client (if exists)
- Specific date parsing libs only used for ENTSO-E (if removing ENTSO-E)

**Keep these (confirmed used):**
- `fastapi`
- `uvicorn`
- `scikit-learn` (Random Forest)
- `google-cloud-aiplatform` (Vertex AI)
- `google-cloud-storage` (new, for Cloud Storage migration)
- `pandas`, `numpy` (data processing)
- `requests` (general HTTP)

### 3.2 Frontend Dependencies

**Location**: `package.json`

**Status**: Generally well-maintained

**Recommendation**: Run security audit

```bash
npm audit fix
npm update
```

---

## 4. Code Structure Improvements

### 4.1 Current Structure (Good)

```
backend/
├── main.py                 # FastAPI app entry point
├── routers/               # API endpoints
│   ├── chat.py
│   ├── tco.py
│   └── admin.py
├── services/              # Business logic
│   ├── ml_service.py
│   └── data_access.py
├── data_knowledge_layer/  # RAG system
│   ├── loader.py
│   ├── retriever.py
│   └── rag_engine.py
├── models/                # Pydantic schemas
│   ├── entities.py
│   └── schemas.py
└── utils/                 # Utilities
    ├── fetch_energy_prices.py
    └── data_audit.py
```

### 4.2 Recommended Improvements

**Create new directories:**

```
backend/
├── services/
│   ├── data_service.py    # NEW: Centralized data loading
│   ├── ml_service.py
│   └── storage_service.py # NEW: Cloud Storage abstraction
├── config/
│   ├── __init__.py
│   └── settings.py        # NEW: Environment variables & config
└── tests/                 # NEW: Unit tests
    ├── test_data_service.py
    ├── test_ml_service.py
    └── test_rag_engine.py
```

**Example `config/settings.py`:**

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Cloud Storage
    USE_CLOUD_STORAGE: bool = True
    GCS_BUCKET_NAME: str = "smart-tco-calculator-data"
    
    # APIs
    ENTSOE_API_KEY: str = None
    VERTEX_AI_PROJECT: str = "calcium-land-466213-e0"
    VERTEX_AI_LOCATION: str = "europe-west1"
    
    # ML Model
    MODEL_PATH: str = "models/tco_random_forest.pkl"
    RETRAIN_ON_STARTUP: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 5. Testing Recommendations

### 5.1 Critical Tests to Add

```python
# backend/tests/test_data_service.py
def test_load_materials():
    """Ensure materials dataset loads correctly"""
    service = DataService(use_cloud=False)
    materials = service.load_materials()
    assert len(materials) > 0
    assert 'sic' in [m['id'] for m in materials]

def test_load_regions():
    """Ensure regions dataset loads correctly"""
    service = DataService(use_cloud=False)
    regions = service.load_regions()
    assert len(regions) > 0
    assert any(r['code'] == 'Germany' for r in regions)
```

### 5.2 Test Coverage Goals

- **Critical paths**: 80%+ coverage
- **Data loading**: 100% coverage
- **ML predictions**: 90%+ coverage
- **RAG retrieval**: 80%+ coverage

---

## 6. Migration Plan

### Phase 1: Immediate (Week 1)
- [ ] Audit and document all API usage (DONE ✅)
- [ ] Create `DataService` class
- [ ] Add unit tests for data loading
- [ ] Update `requirements.txt` (remove unused deps)

### Phase 2: Cloud Migration (Week 2-3)
- [ ] Create Cloud Storage bucket
- [ ] Upload datasets to bucket
- [ ] Update `DataService` to use Cloud Storage
- [ ] Test local vs cloud loading
- [ ] Deploy to Cloud Run with Cloud Storage integration

### Phase 3: Scheduler Setup (Week 4)
- [ ] Create service account
- [ ] Run `setup_cloud_schedulers.sh`
- [ ] Test quarterly data refresh
- [ ] Document monitoring procedures

### Phase 4: Code Cleanup (Ongoing)
- [ ] Remove unused ENTSO-E code (if decided)
- [ ] Remove Materials Project references
- [ ] Consolidate data loading logic
- [ ] Add comprehensive logging
- [ ] Security audit (dependency updates)

---

## 7. Final Recommendations Summary

| Action | Priority | Effort | Impact |
|--------|----------|--------|--------|
| Migrate to Cloud Storage | 🔴 High | Medium | High cost savings, faster loading |
| Create `DataService` class | 🟡 Medium | Low | Better code organization |
| Remove unused APIs | 🟢 Low | Low | Cleaner codebase |
| Add unit tests | 🔴 High | Medium | Production reliability |
| Setup Cloud Scheduler | 🟡 Medium | Low | Automated data refresh |
| Dependency cleanup | 🟢 Low | Low | Security & maintenance |

---

**Conclusion:**

The codebase is generally well-structured. Main improvements are:
1. Migrate data to Cloud Storage (cost + performance)
2. Centralize data loading logic
3. Add automated testing
4. Remove unused API code (optional, low priority)

The ENTSO-E API integration is **functional but unused in production**. Recommend keeping the code dormant for potential future real-time price feature.

---

**Last Updated:** October 14, 2025  
**Status:** Ready for implementation
