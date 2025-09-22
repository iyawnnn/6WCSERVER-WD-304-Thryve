# Thryve — Fitness & Health Tracker

---

## Quick Setup

## 1. Clone the Repo
git clone <your-repo-url>
cd Thryve

## Backend Setup
cd thryve-backend
npm install
cp .env.example .env  # Fill in your MongoDB URI and JWT secret
npm run dev

Runs backend at: http://localhost:5000

## Frontend Setup
cd ../thryve-frontend
npm install
npm run dev

Runs frontend at: http://localhost:5173

## Frontend Routes
/register - Register a new user
/login - login existing user
/dashboard - protected dashboard page

Users are redirected automatically based on login status (token in localStorage).

## API Endpoints
/api/auth/register - Register a new user
/api/auth/login - Login
/api/auth/me - Get current user info (token required)
/api/dashboard - Protected Dashboard data

Use the included postman_collection.json to test API requests.