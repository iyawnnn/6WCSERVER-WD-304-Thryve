# Thryve — Fitness & Health Tracker

Thryve is a full-stack Fitness & Health Tracker app built with **Vue 3 + Vite frontend** and **Node.js + Express backend**, using **MongoDB Atlas** as the database. Users can register, log in, track workouts and meals, and view a simple dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Frontend Routes](#frontend-routes)
- [Deployment Notes](#deployment-notes)
- [Team Collaboration](#team-collaboration)

---

## Features

- User authentication (register/login)
- JWT-based session management
- Workout & meal tracking
- Dashboard with summary and weekly charts
- Security: Helmet, CORS, rate limiting
- Postman collection included for API testing
- Optional seed user for testing

---

## Tech Stack

**Frontend:**
- Vue 3 + Vite
- Vue Router
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- bcryptjs for password hashing
- JWT for authentication
- Helmet, CORS, express-rate-limit for security

---

## Setup & Installation

1. **Clone the repo**  

git clone <repo-url>
cd Thryve

2. **Backend Setup**  

cd thryve-backend
npm install

3. **Frontend Setup**  

cd ../thryve-frontend
npm install


## Environment Variables

Create a .env file in thryve-backend and thryve-frontend if required. Example .env.example:

**Backend (thryve-backend/.env):**

PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/thryveDB?retryWrites=true&w=majority

JWT_SECRET=your_long_random_jwt_secret

JWT_EXPIRES_IN=1h

NODE_ENV=development

FRONTEND_ORIGIN=http://localhost:5173

**Frontend (thryve-frontend/.env):**

VITE_API_URL=http://localhost:5000/api

## Running Locally

**Backend:**

cd thryve-backend
npm run dev

**Frontend:**

cd thryve-frontend

npm run dev

Visit http://localhost:5173 in your browser.

## API Endpoints

POST /api/auth/register — Register new user

POST /api/auth/login — Login with email/password

GET /api/auth/me — Get current user info (requires token)

GET /api/dashboard — Protected dashboard data (requires token)

GET /api/health — Health check endpoint

Use the provided Postman collection (postman_collection.json) to test all endpoints.


## Frontend Routes

/register — Registration form

/login — Login form

/dashboard — Protected dashboard (requires token)

Navigation will automatically redirect based on authentication status.

## Deployment Notes

Frontend: Vercel (or Netlify)

Backend: Render (or Heroku)

MongoDB Atlas: Connect backend using MONGO_URI

Ensure FRONTEND_ORIGIN matches deployed frontend URL for CORS.

Health check: /api/health should return { ok: true, version: '0.1.0' } after deployment.

## Team Collaboration

Use feature branches for development. Merge into main after review.

Add new dependencies with npm install and commit package-lock.json.

Use .env.example as reference for environment variables.

Postman collection included to standardize API tests.