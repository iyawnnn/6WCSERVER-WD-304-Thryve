# Thryve - Health and Fitness Web Application

## Introduction / Background
Thryve is a Health and Fitness web application developed using the MEVN stack (MongoDB, Express.js, Vue.js, Node.js). It provides a unified platform for users to manage various aspects of their health and wellness. The application includes functionalities for logging workouts, tracking meals, monitoring water intake, recording sleep patterns, visualizing progress through dashboard analytics, and earning achievements. Thryve also supports essential account management features such as user registration, login, password recovery, and profile customization, ensuring a secure and personalized experience.

The main target users are fitness enthusiasts, health-conscious individuals, and anyone seeking structured guidance to maintain a healthy lifestyle. By consolidating multiple health-tracking features into a single platform, Thryve helps users monitor their progress, stay motivated, and achieve their personal wellness goals. Users can customize their profiles and daily targets, including age, height, weight, calorie intake, protein intake, and workout duration.

## Features
- User registration, login, and password recovery  
- Profile management and daily target customization  
- Workout logging and tracking  
- Meal tracking and calorie management  
- Water intake monitoring  
- Sleep tracking  
- Dashboard analytics with visual progress insights  
- Goal setting and achievement tracking  
- Integrated platform combining multiple health metrics in one place  

## Installation Instructions
1. Clone the repository:
```bash
git clone https://github.com/iyawnnn/6WCSERVER-WD-304-Thryve.git
```

2. Navigate to the project directory:
```bash
cd Thryve
```

3. Install backend dependencies
```bash
cd thryve-backend
npm install
```

4. Install frontend dependencies
```bash
cd thryve-frontend
npm install
```

5. Create a .env file (backend root) then, fill up the environment variables:
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority&appName=<appName>
JWT_SECRET=<jwt_secret>
JWT_EXPIRES_IN=1h
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EMAIL_USER=<email@example.com>
EMAIL_PASS=<email_password>
```
6. Create a .env file (frontend root) then, fill up the environment variables:
```bash
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

1. Make sure MongoDB is running locally or your cloud MongoDB connection is properly configured in the backend `.env` file.

2. Start the backend server:
```bash
cd thryve-backend
npm run dev
```

3. In a seperate terminal, start the frontend server
```bash
cd thryve-frontend
npm run dev
```

4. Open your web browser and navigate to the frontend URL defined in .env (default: http://localhost:5173) to access the application.

3. Log in or register a new account, set your profile and daily targets, and start using the features.

## Usage
- Register a new account or log in.
- Customize your profile and set daily targets (calories, protein, workouts).
- Log workouts, meals, water intake, and sleep patterns.
- View the dashboard for analytics and track achievements.