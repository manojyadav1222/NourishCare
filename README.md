# NourishWell Community

Build a complete, modern, responsive full-stack web application called:

"NourishCare – Community Nutrition Counseling & Health Awareness Portal"

PURPOSE

-------

This application is based on a Community Service Project (CSP) focused on

Nutrition Counseling, Community Health Awareness, and Healthy Lifestyle

Development.

The target users are community residents, especially families with limited

access to structured nutritional guidance.

The platform should help users:

- Understand their nutritional status

- Calculate BMI

- Identify basic nutrition-related risk factors

- Receive personalized meal recommendations

- Learn about balanced diets

- Track daily healthy habits

- Access nutrition awareness resources

- Monitor their health progress over time

The application should NOT diagnose diseases or replace professional medical

advice. Clearly display appropriate health disclaimers wherever required.

TECH STACK

----------

Build this as a complete full-stack application.

Frontend:

- React

- TypeScript

- Tailwind CSS

- Modern responsive UI

Backend / Database:

- Supabase

- Supabase Authentication

- PostgreSQL database through Supabase

Use proper database tables, relationships, authentication, protected routes,

and persistent user data.

DESIGN

------

Create a professional healthcare and nutrition-themed interface.

Design style:

- Clean

- Minimal

- Friendly

- Modern

- Accessible

- Mobile responsive

Use:

- Green as the primary theme

- White backgrounds

- Soft neutral secondary colors

- Rounded cards

- Clean typography

- Health/nutrition related icons

- Simple charts for progress visualization

The website should feel like a genuine health-tech application rather than

a basic college project.

--------------------------------------------------

1. LANDING PAGE

--------------------------------------------------

Create a professional landing page.

Navbar:

- Logo: NourishCare

- Home

- Nutrition

- Health Tools

- Awareness

- About

- Login

- Register

Hero section:

Title:

"Better Nutrition. Healthier Communities."

Subtitle:

"Understand your nutrition, build healthier habits, and receive personalized

guidance for a better lifestyle."

Buttons:

- Get Started

- Check Your Health

Include sections:

1. Why Nutrition Matters

2. Our Services

3. BMI & Health Assessment

4. Personalized Meal Guidance

5. Nutrition Awareness

6. Healthy Habit Tracking

7. Community Health Mission

8. Footer

--------------------------------------------------

2. USER AUTHENTICATION

--------------------------------------------------

Implement:

- User registration

- User login

- Logout

- Forgot password

- Protected dashboard routes

Registration fields:

- Full Name

- Email

- Password

- Age

- Gender

- Phone Number (optional)

Store user profiles securely.

--------------------------------------------------

3. USER DASHBOARD

--------------------------------------------------

After login, show a personalized dashboard.

Dashboard cards:

- Current BMI

- BMI Category

- Daily Water Goal

- Current Health Score

- Habit Completion Percentage

Include:

"Good Morning, [User Name]"

Sections:

Today's Health Goals

Nutrition Tip of the Day

Recent BMI Record

Current Meal Plan

Today's Habit Progress

Health Progress Chart

Add quick-action buttons:

- Calculate BMI

- Complete Health Assessment

- View Meal Plan

- Track Habits

- Learn Nutrition

--------------------------------------------------

4. BMI CALCULATOR

--------------------------------------------------

Create an interactive BMI calculator.

Inputs:

- Height in centimeters

- Weight in kilograms

Formula:

BMI = weight (kg) / height² (m)

Display:

BMI Value

BMI Category:

- Underweight

- Normal

- Overweight

- Obese

Show the result using a visual BMI indicator.

Store BMI records so users can track BMI history.

Display a BMI progress chart on the dashboard.

Add a disclaimer that BMI is a screening measure and not a medical diagnosis.

--------------------------------------------------

5. HEALTH & NUTRITION ASSESSMENT

--------------------------------------------------

Create a structured questionnaire inspired by community nutrition surveys.

Ask:

Basic Information:

- Age

- Gender

- Height

- Weight

Dietary Habits:

- Meals per day

- Fruit consumption

- Vegetable consumption

- Protein consumption

- Processed food frequency

- Sugary food/drink frequency

Lifestyle:

- Daily water intake

- Exercise frequency

- Sleep duration

Optional self-reported conditions:

- Diabetes

- Hypertension

- Anemia

- None

- Prefer not to say

Do not diagnose conditions.

After submission, generate a simple wellness summary such as:

Nutrition Status

Hydration Status

Activity Status

Diet Quality Indicator

Display general educational suggestions.

Store assessment history.

--------------------------------------------------

6. PERSONALIZED MEAL PLANNER

--------------------------------------------------

Create a meal recommendation module.

Collect:

- Diet preference:

  Vegetarian

  Non-Vegetarian

  Vegan

- Goal:

  Balanced Nutrition

  Weight Management

  Improve Protein Intake

  General Healthy Eating

- Budget:

  Low

  Medium

  Flexible

Generate a simple daily meal plan:

Breakfast

Morning Snack

Lunch

Evening Snack

Dinner

Focus especially on affordable Indian foods.

Examples:

- Idli

- Dosa

- Upma

- Poha

- Rice

- Dal

- Roti

- Chapati

- Vegetables

- Spinach

- Eggs

- Curd

- Milk

- Peanuts

- Chickpeas

- Sprouts

- Seasonal fruits

- Ragi

- Jowar

Show estimated nutritional information when reliable data is available.

Provide practical food alternatives.

Example:

Instead of:

Packaged chips

Try:

Roasted chickpeas / peanuts

Instead of:

Sugary drinks

Try:

Buttermilk / lemon water without excess sugar

The recommendations must be presented as general nutrition guidance rather

than medical treatment.

--------------------------------------------------

7. NUTRITION EDUCATION CENTER

--------------------------------------------------

Create an educational page called:

"Nutrition Learning Center"

Create cards for:

Macronutrients

- Carbohydrates

- Proteins

- Healthy fats

Micronutrients

- Iron

- Calcium

- Vitamins

Additional topics:

- Balanced Diet

- Food Hygiene

- Safe Food Storage

- Portion Control

- Hydration

- Healthy Cooking

- Understanding Food Labels

Each topic should open a detailed educational page or modal.

--------------------------------------------------

8. HEALTH AWARENESS SECTION

--------------------------------------------------

Create awareness resources based on common community health concerns.

Topics:

- Healthy Eating

- Iron-Rich Foods

- Protein-Rich Foods

- Nutrition for Women

- Nutrition for Children

- Healthy Eating for Older Adults

- Reducing Excess Sugar

- Reducing Excess Salt

- Food Hygiene

- Safe Food Storage

- Importance of Physical Activity

- Stress Management

- Sleep Hygiene

Use attractive educational cards and simple illustrations/icons.

--------------------------------------------------

9. HEALTHY HABIT TRACKER

--------------------------------------------------

Allow users to track daily habits.

Default habits:

- Drink enough water

- Eat vegetables

- Eat fruit

- Include protein

- Exercise

- Avoid excessive processed food

- Maintain proper sleep

Users can mark habits complete.

Display:

Daily Completion %

Weekly Completion %

Current Streak

Show a weekly progress chart.

Store habit history in the database.

--------------------------------------------------

10. WATER TRACKER

--------------------------------------------------

Create a simple water intake tracker.

Users can:

- Set daily water target

- Add glasses of water

- View current intake

- See progress percentage

Example:

6 / 8 glasses

Display using a circular or horizontal progress indicator.

--------------------------------------------------

11. HEALTH PROGRESS

--------------------------------------------------

Create a dedicated "My Progress" page.

Display:

BMI history

Weight history

Habit completion history

Water intake history

Health assessment history

Use charts where appropriate.

Filters:

7 Days

30 Days

3 Months

--------------------------------------------------

12. ADMIN DASHBOARD

--------------------------------------------------

Create a separate Admin role.

Admin should be able to:

- Login securely

- View registered users

- View anonymized aggregate health statistics

- Add/edit/delete nutrition awareness articles

- Manage educational content

- Manage nutrition tips

- View community-level dashboard statistics

Admin dashboard cards:

Total Users

Assessments Completed

Average BMI (only when meaningful)

Active Habit Trackers

Meal Plans Generated

Include charts for aggregate, non-identifying statistics.

Do not expose private health details unnecessarily.

--------------------------------------------------

13. COMMUNITY HEALTH DASHBOARD

--------------------------------------------------

Create anonymized aggregate statistics.

Examples:

BMI category distribution

Common dietary habit patterns

Fruit/vegetable intake patterns

Exercise frequency

Hydration patterns

Display using:

- Bar charts

- Pie/donut charts

- Progress indicators

Protect user privacy and do not expose individual health information.

--------------------------------------------------

14. DATABASE DESIGN

--------------------------------------------------

Create appropriate Supabase tables such as:

profiles

- id

- user_id

- full_name

- age

- gender

- phone

- created_at

bmi_records

- id

- user_id

- height

- weight

- bmi

- category

- created_at

health_assessments

- id

- user_id

- assessment_data

- wellness_summary

- created_at

meal_plans

- id

- user_id

- diet_preference

- health_goal

- budget

- meal_plan

- created_at

habit_logs

- id

- user_id

- habit_name

- completed

- date

water_logs

- id

- user_id

- amount

- date

nutrition_articles

- id

- title

- category

- description

- content

- created_at

nutrition_tips

- id

- title

- content

- category

- created_at

Implement Row Level Security (RLS) so users can only access their own

personal records.

--------------------------------------------------

15. NAVIGATION

--------------------------------------------------

After login, use a dashboard sidebar:

Dashboard

Health Assessment

BMI Calculator

Meal Planner

Habit Tracker

Water Tracker

Nutrition Center

Health Awareness

My Progress

Profile

Logout

For admin:

Dashboard

Users

Community Analytics

Articles

Nutrition Tips

Settings

Logout

--------------------------------------------------

16. PROFILE PAGE

--------------------------------------------------

Allow users to manage:

Name

Age

Gender

Height

Weight

Diet preference

Health goal

Allow password management through the authentication system.

--------------------------------------------------

17. UX REQUIREMENTS

--------------------------------------------------

Include:

- Loading indicators

- Toast notifications

- Form validation

- Empty states

- Error handling

- Confirmation dialogs

- Responsive sidebar

- Mobile navigation

- Accessible forms

- Professional dashboard cards

- Smooth but subtle animations

Ensure all buttons and navigation links actually work.

Do not create placeholder buttons that perform no action.

--------------------------------------------------

18. IMPORTANT SAFETY REQUIREMENTS

--------------------------------------------------

This is a nutrition awareness and educational platform.

Do NOT:

- Diagnose diseases

- Claim to cure medical conditions

- Generate medication recommendations

- Replace doctors or registered dietitians

- Provide unsafe restrictive diets

For users who report diabetes, hypertension, anemia, pregnancy, or other

health concerns, display:

"This information is for general educational purposes. Please consult a

qualified healthcare professional or registered dietitian for personalized

medical or nutritional advice."

--------------------------------------------------

19. PROJECT OBJECTIVE

--------------------------------------------------

The final application should digitally represent a Community Service Project

focused on improving:

- Nutrition awareness

- Balanced diet knowledge

- Affordable healthy meal planning

- Food hygiene

- Healthy lifestyle habits

- Community health literacy

- Long-term healthy behavior

The application should be polished enough to demonstrate as a college CSP

project and should contain real working functionality, database persistence,

authentication, dashboards, analytics, and responsive UI.

Build the complete application page-by-page and ensure all modules are

properly connected.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ced10d4a-c07f-4a85-b9bb-a667807bc672).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
