# Dockerfile for fullstack app (backend: Python Flask, frontend: React)
# Multi-stage build for optimized image size

# --- Frontend Build Stage ---
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Backend Build Stage ---
FROM python:3.12-slim AS backend-build
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# --- Final Stage ---
FROM python:3.12-slim
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy requirements and install in final image
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Expose backend port (Flask default: 5000)
EXPOSE 5000

# Set environment variables for production
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production

# Start backend (serving frontend static files via Flask)
CMD ["python", "backend/app.py"]
