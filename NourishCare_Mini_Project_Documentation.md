# NourishCare – Community Nutrition Counseling & Health Awareness Portal

## 1. Abstract

NourishCare is a full-stack web application developed as a Community Service Project (CSP) for nutrition counseling, health awareness, and healthy lifestyle development. The project helps users understand basic nutritional health, calculate Body Mass Index (BMI), complete a health and nutrition assessment, generate affordable Indian meal plans, track daily habits, monitor water intake, view personal progress, and access educational awareness resources.

The application is designed for community residents and families who may not have regular access to structured nutrition counseling. It focuses on practical, educational, and budget-friendly health guidance rather than medical diagnosis. The system also includes a Nourish Market feature that acts as a mediator between users and partner shopping platforms such as Amazon, Blinkit, BigBasket, and JioMart by showing nutrition-related food products and external buying links.

NourishCare uses a React and TypeScript frontend with a Flask backend and SQLite database. It includes user authentication, protected dashboards, role-based admin access, data persistence, charts, form validation, educational disclaimers, and a local-language voice guide for simple nutrition assistance.

## 2. Introduction

Nutrition plays an important role in daily life, energy, immunity, growth, concentration, and long-term health. Many people know that healthy eating is important, but they may not know how to select affordable nutritious foods or how to build consistent healthy habits. This problem is especially common in communities where access to dietitians, structured nutrition education, and regular health counseling is limited.

NourishCare was developed to support such users through a simple digital platform. It combines nutrition education, health tools, personal tracking, meal planning, market suggestions, and awareness content in one place. Users can register, log in, save their health records, and track progress over time.

The application is not a hospital system or a medical diagnosis platform. It is an educational and demonstration-based web application for a college CSP project. It gives general nutrition awareness and encourages users to consult qualified health professionals for medical conditions.

## 3. Objectives

The main objectives of NourishCare are:

1. To create a user-friendly community nutrition and health awareness portal.
2. To help users calculate BMI and understand BMI categories.
3. To provide a health and nutrition assessment based on food habits, hydration, activity, sleep, and basic health notes.
4. To generate simple rule-based Indian meal plans for vegetarian, non-vegetarian, and vegan users.
5. To help users track daily healthy habits such as drinking water, eating vegetables, eating fruit, including protein, exercising, reducing processed food, and maintaining sleep.
6. To provide a water tracker with daily goal and progress.
7. To show saved BMI, weight, habit, water, meal plan, and assessment history.
8. To provide nutrition learning content on carbohydrates, protein, fats, iron, calcium, vitamins, balanced diet, hydration, food hygiene, portion control, and food labels.
9. To provide health awareness content for healthy eating, iron-rich foods, protein-rich foods, women, children, older adults, sugar reduction, salt reduction, physical activity, stress, sleep, and food hygiene.
10. To create a Nourish Market where users can discover nutrient-rich products and open partner shopping links.
11. To include a local-language voice guide for basic nutrition help in English, Hindi/Hinglish, and Telugu/Tanglish.
12. To provide a simple admin dashboard for aggregate statistics and content/product management.

## 4. Problem Statement

Many community residents do not have easy access to reliable nutrition counseling and health awareness resources. They may face difficulty in understanding BMI, identifying basic nutrition gaps, planning affordable meals, building healthy habits, drinking enough water, and selecting nutrient-rich foods.

Existing health information is often too general, too medical, or not connected to daily food choices. People may also forget to track progress because tools are spread across different platforms.

Therefore, there is a need for a simple full-stack web application that combines nutrition education, BMI calculation, health assessment, meal planning, habit tracking, water tracking, progress monitoring, and marketplace guidance in one system.

NourishCare solves this by providing an educational, easy-to-use, and community-focused health awareness portal.

## 5. Software Requirements

### Frontend Technologies

- React 19
- TypeScript
- TanStack Router
- TanStack React Query
- Tailwind CSS
- Radix UI components
- Lucide React icons
- Recharts for charts and progress visualization
- Zod for form validation
- Sonner for toast notifications
- Vite for development and build

### Backend Technologies

- Python
- Flask
- Flask-CORS
- SQLAlchemy
- PyJWT for JSON Web Token authentication
- Werkzeug password hashing
- SQLite database for local development

### Development Tools

- VS Code
- Node.js and npm
- Python 3
- Browser such as Chrome
- Terminal

### Environment Variables

Frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Backend:

```env
JWT_SECRET_KEY=
DATABASE_URL=sqlite:///nourishcare.db
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
ADMIN_FULL_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### Main Commands

Install frontend dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Run backend:

```bash
cd backend
python3 app.py
```

Build frontend:

```bash
npm run build
```

TypeScript check:

```bash
npx tsc --noEmit
```

Lint check:

```bash
npm run lint
```

## 6. Hardware Requirements

Minimum hardware requirements:

- Processor: Intel i3 or equivalent
- RAM: 4 GB minimum
- Storage: 1 GB free space
- Internet connection for installing dependencies and opening external marketplace links
- Microphone for voice assistant input
- Display: 1366 x 768 or higher recommended

Recommended hardware requirements:

- Processor: Intel i5 or Apple Silicon equivalent
- RAM: 8 GB or above
- Storage: 2 GB free space
- Chrome browser for best speech recognition support

## 7. Services Page

The NourishCare landing page contains a services section that explains the major services offered by the portal. The services are:

### 1. Nutrition Counseling

Provides structured and easy-to-understand nutrition guidance based on daily foods and affordable Indian meal options.

### 2. Health Assessment

Allows users to complete a questionnaire about age, height, weight, eating habits, hydration, exercise, sleep, and health notes. The system calculates a simple wellness summary and suggestions.

### 3. Meal Guidance

Generates rule-based meal plans for vegetarian, non-vegetarian, and vegan users. Plans include breakfast, morning snack, lunch, evening snack, and dinner.

### 4. Nutrition Education

Provides learning content on nutrients and food practices such as carbohydrates, protein, healthy fats, iron, calcium, vitamins, balanced diet, hydration, hygiene, portion control, and food labels.

### 5. Habit Building

Allows users to track seven core healthy habits every day and view completion progress.

### 6. Progress Monitoring

Displays saved BMI history, weight trends, water intake, habit progress, meal plans, and assessment history using clean UI and charts.

### 7. Nourish Market

Shows nutrient-rich food products such as ragi flour, roasted chana, soy chunks, moong dal, dates, sesame seeds, makhana, chikki, curd starter kit, and mixed nuts. Users can create a healthy shopping list and open external partner platform links to buy products.

### 8. Voice Guide

Provides a floating local-language assistant that can answer basic nutrition questions and suggest related app actions such as opening meal planner, BMI calculator, water tracker, or Nourish Market.

## 8. Development and Implementation

### Project Architecture

NourishCare follows a client-server architecture.

The frontend is built with React, TypeScript, TanStack Router, Tailwind CSS, and reusable UI components. It communicates with the backend using REST API calls from `src/lib/api.ts`.

The backend is built with Flask and SQLAlchemy. It exposes REST endpoints for authentication, profile, BMI, assessment, meal plans, habits, water, articles, market products, admin functions, and assistant chat. The database is SQLite for local development.

### Folder Structure

Important project folders and files:

- `src/routes` – frontend pages and routes
- `src/components` – reusable UI, site, app, and health components
- `src/lib/api.ts` – frontend API client
- `src/lib/nutrition.ts` – BMI logic, assessment logic, meal planner data, nutrition content
- `src/hooks/useAuth.tsx` – authentication state management
- `backend/app.py` – Flask app creation, CORS, database creation, seed data
- `backend/models.py` – database models
- `backend/routes` – Flask route modules
- `backend/auth_utils.py` – password hashing, JWT creation, login protection, admin protection
- `backend/config.py` – database, JWT, CORS, and environment configuration

### Authentication Implementation

Authentication is implemented using email, password, hashed passwords, and JWT tokens.

User registration validates name, email, password, age, gender, and phone. Passwords are stored as hashes using Werkzeug. Login checks the email and password and returns a JWT token. The token is stored in browser local storage as `nourishcare_token`.

Protected routes use `login_required` on the backend and authenticated route guards on the frontend. Admin routes use `admin_required`, which checks whether the logged-in user has the `admin` role.

Forgot password and reset password are supported for demo use. In non-production mode, the backend can generate a reset token.

### Database Tables

The current backend database models are:

1. `users`
   - Stores user profile, email, password hash, height, weight, diet preference, health goal, water goal, and role.

2. `bmi_records`
   - Stores user BMI records, height, weight, BMI value, category, and created date.

3. `health_assessments`
   - Stores questionnaire answers and wellness summary.

4. `meal_plans`
   - Stores generated meal plans, diet preference, health goal, budget, and meal plan JSON.

5. `habit_logs`
   - Stores daily habit completion for each user.

6. `water_logs`
   - Stores daily water intake and water goal.

7. `nutrition_articles`
   - Stores educational articles for awareness pages.

8. `nutrition_tips`
   - Stores tips shown in dashboard and admin.

9. `market_products`
   - Stores Nourish Market products, categories, prices, product links, nutrition tags, related topics, image URLs, and stock status.

10. `market_orders`
   - Stores saved shopping lists.

11. `market_order_items`
   - Stores items inside saved shopping lists.

### Main Frontend Pages

1. `/`
   - Landing page with hero section, services, nutrition importance, BMI introduction, meal guidance, awareness, habit tracking, and community mission.

2. `/about`
   - Explains the project mission, target users, limitations, objectives, and privacy commitment.

3. `/nutrition`
   - Nutrition Learning Center with topics such as carbohydrates, protein, fats, iron, calcium, vitamins, balanced diet, hydration, hygiene, portion control, and food labels.

4. `/awareness`
   - Awareness resources and articles related to community health topics.

5. `/health-tools`
   - Public BMI calculator and links to authenticated health tools.

6. `/auth`
   - Login and registration page.

7. `/reset-password`
   - Password reset page.

8. `/dashboard`
   - Protected user dashboard showing BMI, wellness score, habits, water progress, latest meal plan, tip of the day, and quick actions.

9. `/assessment`
   - Health and nutrition assessment form with wellness result.

10. `/meal-planner`
   - Rule-based personalized Indian meal planner.

11. `/habits`
   - Daily habit tracker.

12. `/water`
   - Water intake tracker.

13. `/progress`
   - User progress charts and history.

14. `/profile`
   - User profile update page.

15. `/market`
   - Nourish Market product discovery page.

16. `/orders`
   - Saved shopping lists page.

17. `/admin`
   - Admin dashboard for aggregate statistics, articles, tips, and products.

### Backend API Modules

1. `/api/auth`
   - Register, login, current user, forgot password, reset password.

2. `/api/profile`
   - Get and update profile.

3. `/api/bmi`
   - Save and list BMI records.

4. `/api/assessments`
   - Save and list health assessments.

5. `/api/meal-plans`
   - Save and list meal plans.

6. `/api/habits`
   - Save and list habit logs.

7. `/api/water`
   - Save and list water logs.

8. `/api/articles` and `/api/tips`
   - Public nutrition article and tip content.

9. `/api/market`
   - Product list, filtered products, saved shopping lists.

10. `/api/admin`
   - Admin statistics and content/product management.

11. `/api/assistant`
   - Rule-based local-language assistant response endpoint.

### Feature Implementation

#### BMI Calculator

The BMI calculator accepts height in centimeters and weight in kilograms. It calculates BMI using:

```text
BMI = weight / (height in meters × height in meters)
```

It then classifies the result as Underweight, Normal, Overweight, or Obese. Logged-in users can save BMI records to the database.

#### Health Assessment

The assessment collects user data about meals, fruits, vegetables, protein, processed food, sugary food, water, exercise, sleep, and health conditions. A wellness score is generated using rule-based logic in `src/lib/nutrition.ts`.

#### Meal Planner

The meal planner generates affordable Indian meal plans based on diet preference, health goal, and budget. It is rule-based and does not use external AI APIs. Generated meal plans can be saved to the database.

#### Habit Tracker

The habit tracker allows users to mark daily habits as complete or incomplete. The system stores daily habit logs and calculates completion progress.

#### Water Tracker

The water tracker stores the number of glasses consumed per day and compares it with the user's daily water goal.

#### Progress Page

The progress page displays saved health records such as BMI history, weight history, habit history, water history, and assessment history with visual charts.

#### Nourish Market

Nourish Market displays nutrient-rich foods with product category, price, health benefit, nutrition tags, platform name, image or generated visual, and partner shopping link. Users can add products to a shopping list and save the list after login.

#### Admin Dashboard

Admin users can view aggregate statistics such as total users, assessments, meal plans, habit logs, water logs, average BMI, average water intake, market products, saved market lists, and market demo revenue. Admin users can also manage articles, tips, and market products.

#### Voice Guide

The voice guide supports typed and spoken questions. It gives rule-based responses for topics such as iron, protein, calcium, water, BMI, meal planning, habits, and market. It supports English, Hindi/Hinglish, and Telugu/Tanglish responses using browser speech recognition and speech synthesis.

### Security and Privacy

Security features include:

- Password hashing
- JWT-based authentication
- Protected backend routes
- Admin-only backend routes
- Form validation
- User-specific data access
- Educational health disclaimers
- Aggregate admin statistics instead of individual private health information

### Limitations

NourishCare is a college demonstration project, not a production healthcare platform. It does not diagnose disease, prescribe medicines, replace doctors, process real payments, or provide real delivery services. The marketplace opens external partner links and does not handle actual transactions.

## 9. Conclusion

NourishCare successfully demonstrates a complete full-stack community nutrition counseling and health awareness portal. It combines educational content, personal health tools, user authentication, database persistence, progress tracking, meal planning, habit tracking, water tracking, admin management, Nourish Market, and a local-language voice guide.

The project is useful for a college CSP demonstration because it addresses a real community need: improving nutrition awareness and encouraging practical healthy habits. It is simple enough for users to understand, but complete enough to show full-stack development skills, database design, authentication, frontend design, backend API development, and user-centered problem solving.

Future improvements can include local vendor onboarding, smarter product recommendations, appointment booking with nutrition counselors, printable diet charts, regional-language content pages, and offline community survey support.
