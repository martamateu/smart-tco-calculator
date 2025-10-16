#!/bin/bash
# Setup Cloud Scheduler jobs for Smart TCO Calculator
# This script creates QUARTERLY data refresh jobs (conservative approach)
# 
# Prerequisites:
# 1. gcloud CLI installed and authenticated
# 2. Project ID set in GCP
# 3. Backend deployed to Cloud Run
# 4. Admin API endpoints implemented
#
# Usage: ./setup_cloud_schedulers.sh YOUR_PROJECT_ID YOUR_BACKEND_URL

set -e

# Configuration
PROJECT_ID="${1:-YOUR_GCP_PROJECT_ID}"
BACKEND_URL="${2:-https://YOUR_BACKEND_URL}"
REGION="europe-west1"
SERVICE_ACCOUNT="scheduler@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Setting up Cloud Scheduler for Smart TCO Calculator"
echo "📋 Project: ${PROJECT_ID}"
echo "🌍 Region: ${REGION}"
echo "🔗 Backend: ${BACKEND_URL}"
echo ""

# Validate inputs
if [[ "${PROJECT_ID}" == "YOUR_GCP_PROJECT_ID" ]] || [[ "${BACKEND_URL}" == "https://YOUR_BACKEND_URL" ]]; then
    echo "❌ Error: Please provide PROJECT_ID and BACKEND_URL"
    echo "Usage: $0 <PROJECT_ID> <BACKEND_URL>"
    echo "Example: $0 my-project-123 https://tco-backend-abc123.run.app"
    exit 1
fi

# Create service account if doesn't exist
echo "1️⃣  Creating service account..."
gcloud iam service-accounts create scheduler \
    --display-name="Cloud Scheduler Service Account" \
    --project=${PROJECT_ID} 2>/dev/null || echo "   Service account already exists"

# Grant permissions
echo "2️⃣  Granting IAM permissions..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudscheduler.jobRunner" \
    --quiet

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/run.invoker" \
    --quiet

# Delete existing jobs if they exist
echo "3️⃣  Cleaning up old scheduler jobs..."
gcloud scheduler jobs delete refresh-mendeley-electricity-data --location=${REGION} --project=${PROJECT_ID} --quiet 2>/dev/null || true
gcloud scheduler jobs delete refresh-iea-carbon-intensity --location=${REGION} --project=${PROJECT_ID} --quiet 2>/dev/null || true
gcloud scheduler jobs delete retrain-ml-model --location=${REGION} --project=${PROJECT_ID} --quiet 2>/dev/null || true

# Create quarterly Mendeley data refresh job
echo "4️⃣  Creating Mendeley data refresh job (quarterly)..."
gcloud scheduler jobs create http refresh-mendeley-electricity-data \
    --location=${REGION} \
    --schedule="0 0 1 */3 *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/refresh-data/mendeley" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"dataset": "global_electricity_data_2025"}' \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID} \
    --description="Refresh global electricity prices from Mendeley dataset (runs quarterly: Jan, Apr, Jul, Oct)"

# Create annual IEA carbon intensity refresh job
echo "5️⃣  Creating IEA carbon intensity refresh job (annual)..."
gcloud scheduler jobs create http refresh-iea-carbon-intensity \
    --location=${REGION} \
    --schedule="0 0 15 1 *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/refresh-data/iea-carbon" \
    --http-method=POST \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID} \
    --description="Refresh IEA grid carbon intensity data (runs annually on January 15th)"

# Create ML model retraining job (runs after data refresh)
echo "6️⃣  Creating ML model retraining job (quarterly)..."
gcloud scheduler jobs create http retrain-ml-model \
    --location=${REGION} \
    --schedule="0 2 2 */3 *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/retrain-model" \
    --http-method=POST \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID} \
    --description="Retrain Random Forest model with updated data (runs day after Mendeley refresh)"

echo ""
echo "✅ Cloud Scheduler jobs created successfully!"
echo ""
echo "� Job Schedule Summary:"
echo "   ├─ Mendeley Data Refresh:  Every 3 months (1st day, midnight)"
echo "   ├─ IEA Carbon Intensity:   Annually (Jan 15, midnight)"
echo "   └─ ML Model Retrain:       Every 3 months (2nd day, 2am)"
echo ""
echo "� View jobs at:"
echo "   https://console.cloud.google.com/cloudscheduler?project=${PROJECT_ID}"
echo ""
echo "⚙️  Next steps:"
echo "   1. Implement admin endpoints in backend/routers/admin.py:"
echo "      - POST /api/admin/refresh-data/mendeley"
echo "      - POST /api/admin/refresh-data/iea-carbon"
echo "      - POST /api/admin/retrain-model"
echo "   2. Test jobs manually in Cloud Console"
echo "   3. Monitor job execution logs"
echo ""
echo "💡 Optional: To add real-time ENTSO-E price updates (hourly):"
echo "   Run: ./setup_cloud_schedulers_realtime.sh ${PROJECT_ID} ${BACKEND_URL}"
echo ""
echo "  gcloud logging read 'resource.type=\"cloud_scheduler_job\"' --limit=50"
echo ""
