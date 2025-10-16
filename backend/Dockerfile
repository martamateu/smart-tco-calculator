# Smart TCO Calculator Backend - Dockerfile
# Multi-stage build for production deployment

# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt


# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Add local bin to PATH
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . /app/backend

# Set Python path to include parent directory
ENV PYTHONPATH=/app

# Create data directory
RUN mkdir -p /app/backend/data

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV LOG_LEVEL=INFO
ENV CLOUD_RUN=true

# Expose port (Cloud Run uses PORT env var)
ENV PORT=8080
EXPOSE 8080

# Health check (disabled for now to avoid healthcheck failures during startup)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Run with uvicorn (now backend.main will work)
CMD ["sh", "-c", "cd /app && uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
