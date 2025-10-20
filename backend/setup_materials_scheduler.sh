#!/bin/bash
# Create Cloud Scheduler job for Materials Project updates

PROJECT_ID="calcium-land-466213-e0"
REGION="europe-west1"
BACKEND_URL="https://smart-tco-backend-859997094469.europe-west1.run.app"
SERVICE_ACCOUNT="859997094469-compute@developer.gserviceaccount.com"

# Job name and schedule (monthly on 1st at 2 AM Madrid time)
JOB_NAME="refresh-materials-project"
SCHEDULE="0 2 1 * *"  # Cron: minute hour day month weekday
TIMEZONE="Europe/Madrid"

echo "🔬 Creating Cloud Scheduler for Materials Project updates..."
echo ""
echo "Schedule: Monthly (1st day at 2 AM Madrid time)"
echo "Endpoint: POST $BACKEND_URL/api/admin/refresh-prices/materials-project"
echo ""

# Create scheduler
gcloud scheduler jobs create http "$JOB_NAME" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --schedule="$SCHEDULE" \
  --time-zone="$TIMEZONE" \
  --uri="$BACKEND_URL/api/admin/refresh-prices/materials-project" \
  --http-method="POST" \
  --oidc-service-account-email="$SERVICE_ACCOUNT" \
  --oidc-token-audience="$BACKEND_URL" \
  --headers="Content-Type=application/json" \
  --message-body='{"dry_run": false}' \
  --attempt-deadline="600s" \
  --max-retry-attempts=3 \
  --description="Update semiconductor material properties from Materials Project API (monthly)"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Scheduler created successfully!"
  echo ""
  echo "📋 Scheduler details:"
  gcloud scheduler jobs describe "$JOB_NAME" \
    --project="$PROJECT_ID" \
    --location="$REGION"
  
  echo ""
  echo "🧪 To test manually:"
  echo "   gcloud scheduler jobs run $JOB_NAME --project=$PROJECT_ID --location=$REGION"
  echo ""
  echo "📊 To view logs:"
  echo "   gcloud logging read 'resource.type=cloud_scheduler_job AND resource.labels.job_id=$JOB_NAME' --limit=10 --project=$PROJECT_ID"
else
  echo ""
  echo "❌ Failed to create scheduler"
  echo ""
  echo "If job already exists, delete it first:"
  echo "   gcloud scheduler jobs delete $JOB_NAME --project=$PROJECT_ID --location=$REGION"
fi
