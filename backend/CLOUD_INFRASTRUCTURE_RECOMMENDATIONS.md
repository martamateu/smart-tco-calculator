# Cloud Infrastructure Recommendations for Smart TCO Calculator

## Executive Summary

This document provides recommendations for deploying the Smart TCO Calculator backend to Google Cloud Platform with optimal data storage, API scheduling, and cost efficiency.

---

## 1. Data Storage Strategy

### Current Data Types

The backend uses the following datasets:

1. **Static Reference Data** (rarely changes):
   - `semiconductors_comprehensive.json` (semiconductor materials properties)
   - `material_properties.csv` (JRC data)
   - `jrc_semiconductor_data.csv`
   
2. **Semi-Static Data** (monthly/quarterly updates):
   - `global_electricity_data_2025.json` (Mendeley + IEA data)
   - `oecd_energy_prices.csv`
   
3. **PDF Documents** (RAG knowledge base):
   - 20+ PDF files (EU regulations, JRC reports, energy market reports)
   - Total size: ~100 MB
   
4. **ML Model Files**:
   - `tco_random_forest.pkl` (~5-10 MB)
   - `tco_random_forest.json` (metadata)

### Recommended Storage Solution

#### **Google Cloud Storage (Bucket)** ✅ RECOMMENDED

**Why Cloud Storage:**
- **Cost-effective**: $0.020/GB/month for Standard storage
- **Fast read access**: Excellent for frequently accessed data
- **Easy integration**: Python client library works seamlessly with FastAPI
- **Version control**: Built-in versioning for datasets
- **CDN integration**: Can serve PDFs via Cloud CDN if needed

**Bucket Structure:**
```
gs://smart-tco-calculator-data/
├── reference/
│   ├── semiconductors_comprehensive.json
│   ├── material_properties.csv
│   └── jrc_semiconductor_data.csv
├── energy_prices/
│   ├── global_electricity_data_2025.json
│   ├── oecd_energy_prices.csv
│   └── all_industrial_electricity_2025.csv
├── pdfs/
│   ├── regulations/
│   │   ├── EU_Chips_Act_Regulation_2023.pdf
│   │   └── CELEX_32022R2560_EN_TXT.pdf
│   └── reports/
│       ├── JRC133736_01.pdf
│       └── GlobalEnergyReview2025.pdf
└── models/
    ├── tco_random_forest.pkl
    └── tco_random_forest.json
```

**Implementation:**
```python
# backend/services/cloud_storage.py
from google.cloud import storage
import json
import pickle

class CloudStorageService:
    def __init__(self, bucket_name='smart-tco-calculator-data'):
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)
    
    def load_json(self, blob_path):
        """Load JSON from Cloud Storage"""
        blob = self.bucket.blob(blob_path)
        return json.loads(blob.download_as_string())
    
    def load_model(self, model_path):
        """Load pickled ML model"""
        blob = self.bucket.blob(model_path)
        return pickle.loads(blob.download_as_string())
    
    def load_pdf(self, pdf_path):
        """Load PDF for RAG processing"""
        blob = self.bucket.blob(pdf_path)
        return blob.download_as_bytes()
```

#### **NOT BigQuery** ❌

BigQuery is **not recommended** for this use case because:
- Designed for analytical queries on large datasets (TB/PB scale)
- Our data is small (< 1 GB total)
- We need fast key-value lookups, not SQL analytics
- More expensive for small data ($0.02/GB storage + $5/TB query)
- Overkill for static reference data

**When to use BigQuery:** Only if you plan to add:
- Real-time ENTSO-E API streaming data (hourly price updates)
- Historical TCO calculations for analytics
- User query logs for machine learning

---

## 2. API Scheduling & Data Refresh

### Current APIs Used

#### ✅ **Still Used:**

1. **Mendeley Data API** (DOI: 10.17632/s54n4tyyz4.3)
   - **Purpose**: Global electricity price dataset
   - **Update frequency**: Quarterly (static dataset, published Feb 2024)
   - **Recommendation**: Manual refresh only when new version published
   
2. **IEA Grid Carbon Intensity Database**
   - **Purpose**: g CO2/kWh by country
   - **Update frequency**: Annually
   - **Recommendation**: Annual refresh (January)

3. **Materials Project API** (currently unused but available)
   - **Purpose**: Semiconductor material properties
   - **Update frequency**: On-demand
   - **Recommendation**: No scheduler needed (static data)

#### ⚠️ **Potentially Unused (verify):**

4. **ENTSO-E Transparency Platform API**
   - **Status**: Originally planned for real-time EU energy prices
   - **Current usage**: Replaced by Mendeley dataset
   - **Recommendation**: **REMOVE** from active schedulers if not calling API
   - **Alternative**: Keep for future real-time price updates (optional feature)

5. **EIA USA Day-Ahead Markets API**
   - **Status**: Originally planned for real-time US energy prices
   - **Current usage**: Replaced by Mendeley dataset
   - **Recommendation**: **REMOVE** from active schedulers if not calling API

#### ❌ **Not Used:**

6. **OECD Energy Prices API**
   - **Status**: Using static CSV file instead
   - **Recommendation**: **REMOVE** from schedulers

---

### Recommended Cloud Scheduler Configuration

#### **Option 1: Quarterly Data Refresh (Conservative)** ✅ RECOMMENDED

```yaml
# cloud_scheduler_quarterly.yaml
jobs:
  - name: refresh-mendeley-electricity-data
    description: "Refresh global electricity prices from Mendeley"
    schedule: "0 0 1 */3 *"  # Every 3 months (Jan, Apr, Jul, Oct)
    time_zone: "Europe/Madrid"
    http_target:
      uri: "https://YOUR_BACKEND_URL/api/admin/refresh-data/mendeley"
      http_method: POST
      headers:
        Content-Type: "application/json"
      body: '{"dataset": "global_electricity_data_2025"}'
      oidc_token:
        service_account_email: "scheduler@YOUR_PROJECT.iam.gserviceaccount.com"
  
  - name: refresh-iea-carbon-intensity
    description: "Refresh IEA grid carbon intensity data"
    schedule: "0 0 15 1 *"  # January 15th annually
    time_zone: "Europe/Madrid"
    http_target:
      uri: "https://YOUR_BACKEND_URL/api/admin/refresh-data/iea-carbon"
      http_method: POST
      oidc_token:
        service_account_email: "scheduler@YOUR_PROJECT.iam.gserviceaccount.com"
  
  - name: retrain-ml-model
    description: "Retrain Random Forest model with updated data"
    schedule: "0 2 2 */3 *"  # Day after Mendeley refresh
    time_zone: "Europe/Madrid"
    http_target:
      uri: "https://YOUR_BACKEND_URL/api/admin/retrain-model"
      http_method: POST
      oidc_token:
        service_account_email: "scheduler@YOUR_PROJECT.iam.gserviceaccount.com"
```

#### **Option 2: Real-Time Price Updates (Advanced)** ⚠️ OPTIONAL

Only if you implement real-time ENTSO-E/EIA API calls:

```yaml
# cloud_scheduler_realtime.yaml (OPTIONAL)
jobs:
  - name: fetch-entsoe-hourly-prices
    description: "Fetch hourly EU day-ahead electricity prices"
    schedule: "0 * * * *"  # Every hour
    time_zone: "Europe/Madrid"
    http_target:
      uri: "https://YOUR_BACKEND_URL/api/admin/fetch-entsoe-prices"
      http_method: POST
      oidc_token:
        service_account_email: "scheduler@YOUR_PROJECT.iam.gserviceaccount.com"
```

**Cost warning:** Hourly API calls = 8,760 requests/year. ENTSO-E API is free, but Cloud Scheduler costs $0.10/job/month.

---

### Setup Script for Cloud Scheduler

```bash
#!/bin/bash
# backend/setup_cloud_schedulers.sh

PROJECT_ID="YOUR_GCP_PROJECT_ID"
REGION="europe-west1"
SERVICE_ACCOUNT="scheduler@${PROJECT_ID}.iam.gserviceaccount.com"
BACKEND_URL="https://YOUR_BACKEND_URL"

# Create service account if doesn't exist
gcloud iam service-accounts create scheduler \
    --display-name="Cloud Scheduler Service Account" \
    --project=${PROJECT_ID} || true

# Grant permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudscheduler.jobRunner"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/run.invoker"

# Create quarterly Mendeley data refresh job
gcloud scheduler jobs create http refresh-mendeley-electricity-data \
    --location=${REGION} \
    --schedule="0 0 1 */3 *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/refresh-data/mendeley" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"dataset": "global_electricity_data_2025"}' \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID}

# Create annual IEA carbon intensity refresh job
gcloud scheduler jobs create http refresh-iea-carbon-intensity \
    --location=${REGION} \
    --schedule="0 0 15 1 *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/refresh-data/iea-carbon" \
    --http-method=POST \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID}

# Create ML model retraining job (runs after data refresh)
gcloud scheduler jobs create http retrain-ml-model \
    --location=${REGION} \
    --schedule="0 2 2 */3 *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/retrain-model" \
    --http-method=POST \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID}

echo "✅ Cloud Scheduler jobs created successfully"
echo "View jobs at: https://console.cloud.google.com/cloudscheduler?project=${PROJECT_ID}"
```

---

## 3. Translation Storage Strategy

### Current Translations

Location: `/locales/` (en.ts, es.ts, cat.ts)
- Total size: ~50 KB
- Update frequency: Rarely (only when adding features)

### Recommendation: **Keep in Code Repository** ✅

**Why NOT move to Cloud Storage:**
- Translations are bundled with frontend code
- Need to be available at build time for React
- Extremely small size (no storage cost impact)
- Version controlled with code (easier rollback)
- No network latency for i18n lookups

**When to use Cloud Storage for translations:**
- If you add 20+ languages
- If translations are user-editable (CMS)
- If you implement dynamic language loading

---

## 4. Cost Estimate

### Recommended Setup (Cloud Storage + Quarterly Scheduler)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **Cloud Storage** | 1 GB Standard | $0.02 |
| **Cloud Scheduler** | 3 jobs | $0.30 |
| **Cloud Run** (backend) | 100k requests/month | $5-10 |
| **Vertex AI** (embeddings) | 1M tokens/month | $0.25 |
| **Total** | | **~$6-11/month** |

### Alternative Setup (BigQuery - NOT recommended)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **BigQuery Storage** | 1 GB | $0.02 |
| **BigQuery Queries** | 10 GB scanned/month | $0.05 |
| **Cloud Run** (backend) | 100k requests/month | $5-10 |
| **Total** | | **~$5-11/month** |

**Verdict:** Cloud Storage is cheaper and simpler for this use case.

---

## 5. Implementation Checklist

- [ ] Create Cloud Storage bucket `smart-tco-calculator-data`
- [ ] Upload static datasets to `reference/` folder
- [ ] Upload ML model to `models/` folder
- [ ] Upload PDFs to `pdfs/` folder
- [ ] Update `backend/data_knowledge_layer/loader.py` to use Cloud Storage
- [ ] Update `backend/services/ml_service.py` to load model from Cloud Storage
- [ ] Create service account for Cloud Scheduler
- [ ] Run `setup_cloud_schedulers.sh` to create jobs
- [ ] Test data refresh endpoints
- [ ] Remove unused ENTSO-E/EIA/OECD API code if not calling APIs
- [ ] Update `requirements.txt` to include `google-cloud-storage`
- [ ] Document API keys/credentials in Secret Manager

---

## 6. API Usage Audit

**Action Required:** Verify which APIs are actually being called in production.

```bash
# Search for API calls in codebase
grep -r "entsoe" backend/
grep -r "materials_project" backend/
grep -r "mendeley" backend/
grep -r "iea" backend/
```

**If not actively calling these APIs, REMOVE:**
- ENTSO-E API client code
- EIA API client code
- Materials Project API client (if using static data)

**This will simplify:**
- Dependency management
- Secret management
- Cloud Scheduler configuration
- Code maintenance

---

## 7. Next Steps

1. **Immediate**: Audit API usage in `backend/services/` and `backend/routers/`
2. **Week 1**: Migrate data to Cloud Storage bucket
3. **Week 2**: Set up Cloud Scheduler for quarterly refreshes
4. **Week 3**: Remove unused API client code
5. **Week 4**: Test end-to-end data refresh flow

---

**Last Updated:** October 14, 2025  
**Author:** Marta Mateu (with Copilot assistance)
