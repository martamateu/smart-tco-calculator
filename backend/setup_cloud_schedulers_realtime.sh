#!/bin/bash
# Setup Cloud Scheduler jobs for REAL-TIME electricity price updates
# This script creates HOURLY/DAILY jobs for ENTSO-E (EU) and EIA (USA) APIs
# 
# Prerequisites:
# 1. gcloud CLI installed and authenticated
# 2. Project ID set in GCP
# 3. Backend deployed to Cloud Run
# 4. Admin API endpoints for price updates implemented
#
# Usage: ./setup_cloud_schedulers_realtime.sh YOUR_PROJECT_ID YOUR_BACKEND_URL

set -e

# Configuration
PROJECT_ID="${1:-YOUR_GCP_PROJECT_ID}"
BACKEND_URL="${2:-https://YOUR_BACKEND_URL}"
REGION="europe-west1"
SERVICE_ACCOUNT="scheduler@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Setting up REAL-TIME Cloud Schedulers for Electricity Prices"
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

# Ensure service account exists
echo "1️⃣  Verifying service account..."
gcloud iam service-accounts describe ${SERVICE_ACCOUNT} --project=${PROJECT_ID} 2>/dev/null || {
    echo "   Creating service account..."
    gcloud iam service-accounts create scheduler \
        --display-name="Cloud Scheduler Service Account" \
        --project=${PROJECT_ID}
}

# Grant permissions
echo "2️⃣  Verifying IAM permissions..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudscheduler.jobRunner" \
    --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/run.invoker" \
    --quiet 2>/dev/null || true

# Delete existing real-time jobs if they exist
echo "3️⃣  Cleaning up old real-time scheduler jobs..."
gcloud scheduler jobs delete refresh-entsoe-prices --location=${REGION} --project=${PROJECT_ID} --quiet 2>/dev/null || true
gcloud scheduler jobs delete refresh-eia-prices --location=${REGION} --project=${PROJECT_ID} --quiet 2>/dev/null || true

# Create ENTSO-E price update job (every 8 hours - respects API rate limits)
echo "4️⃣  Creating ENTSO-E price refresh job (every 8 hours)..."
gcloud scheduler jobs create http refresh-entsoe-prices \
    --location=${REGION} \
    --schedule="0 */8 * * *" \
    --time-zone="Europe/Madrid" \
    --uri="${BACKEND_URL}/api/admin/refresh-prices/entsoe" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"regions": ["all"], "days_back": 30}' \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID} \
    --attempt-deadline=300s \
    --description="Refresh EU electricity prices from ENTSO-E API (8am, 4pm, 12am CET)"

echo "   ✅ ENTSO-E scheduler created"
echo "      Schedule: Every 8 hours (00:00, 08:00, 16:00 CET)"
echo "      Regions: 19 EU countries (Germany, France, Italy, Spain, etc.)"
echo "      API: ENTSO-E Transparency Platform"
echo ""

# Create EIA price update job (daily at 6am - USA markets update overnight)
echo "5️⃣  Creating EIA price refresh job (daily)..."
gcloud scheduler jobs create http refresh-eia-prices \
    --location=${REGION} \
    --schedule="0 6 * * *" \
    --time-zone="America/New_York" \
    --uri="${BACKEND_URL}/api/admin/refresh-prices/eia" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"states": ["California", "Texas", "Arizona", "Ohio", "New York"]}' \
    --oidc-service-account-email=${SERVICE_ACCOUNT} \
    --project=${PROJECT_ID} \
    --attempt-deadline=180s \
    --description="Refresh USA electricity prices from EIA API (6am EST daily)"

echo "   ✅ EIA scheduler created"
echo "      Schedule: Daily at 06:00 EST"
echo "      States: California, Texas, Arizona, Ohio, New York"
echo "      API: EIA Electricity Real-Time Grid Monitor"
echo ""

echo "="*70
echo "✅ REAL-TIME SCHEDULER SETUP COMPLETE!"
echo "="*70
echo ""
echo "📊 Job Schedule Summary:"
echo "   ┌─ ENTSO-E (EU):  Every 8 hours"
echo "   │  ├─ 00:00 CET (midnight)"
echo "   │  ├─ 08:00 CET (morning)"
echo "   │  └─ 16:00 CET (afternoon)"
echo "   │"
echo "   └─ EIA (USA):     Daily at 06:00 EST"
echo "      └─ Updates: CA, TX, AZ, OH, NY"
echo ""
echo "🌍 Coverage:"
echo "   • EU:  19 countries with live ENTSO-E prices"
echo "   • USA: 5 states with live EIA prices"
echo "   • Total: 24 regions with real-time data"
echo ""
echo "📈 API Rate Limits:"
echo "   • ENTSO-E: 400 requests/min (8h interval = safe)"
echo "   • EIA:     5000 requests/hour (daily = very safe)"
echo ""
echo "🔗 View jobs at:"
echo "   https://console.cloud.google.com/cloudscheduler?project=${PROJECT_ID}"
echo ""
echo "⚙️  Next Steps:"
echo "   1. Implement admin endpoints in backend/routers/admin.py:"
echo "      - POST /api/admin/refresh-prices/entsoe"
echo "      - POST /api/admin/refresh-prices/eia"
echo ""
echo "   2. Test jobs manually:"
echo "      gcloud scheduler jobs run refresh-entsoe-prices --location=${REGION}"
echo "      gcloud scheduler jobs run refresh-eia-prices --location=${REGION}"
echo ""
echo "   3. Monitor execution:"
echo "      gcloud logging read 'resource.type=\"cloud_scheduler_job\"' --limit=10"
echo ""
echo "💡 Combined with setup_cloud_schedulers.sh, you now have:"
echo "   • Real-time prices (ENTSO-E every 8h, EIA daily)"
echo "   • Quarterly data refresh (Mendeley)"
echo "   • Annual carbon intensity update (IEA)"
echo "   • Quarterly ML model retrain"
echo ""
