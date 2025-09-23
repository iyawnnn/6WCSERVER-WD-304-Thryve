
## Quick Setup

---

### 1. Clone the Repository
git clone https://github.com/iyawnnn/Thryve.git
cd Thryve

## Backend Setup
cd thryve-backend
npm install
cp .env.example .env  # Fill in your MongoDB URI and JWT secret
npm run dev

Runs backend at: http://localhost:5000

## Frontend Setup
cd thryve-frontend
npm install
npm run dev

Runs frontend at: http://localhost:5173

## Frontend Routes
/register - Register a new user
/login - login existing user
/dashboard - protected dashboard page
/meals - Manage meals: add, edit, delete, history
/workouts - Manage workouts: add, edit, delete, history

Users are redirected automatically based on login status (token in localStorage).

## API Endpoints
/api/auth/register - Register a new user

/api/auth/login - Login

/api/auth/me - Get current user info (token required)

/api/dashboard - Protected Dashboard data

Use the included postman_collection.json to test API requests.