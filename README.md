# Retain — Personal Expense & Budget Manager

A full-stack web application for tracking personal expenses, managing monthly budgets, and visualizing spending insights.

## 🔗 Live Demo

- **Frontend (Live App):** https://retain-akm4zyxg9-kellys-projects-eb477a8a.vercel.app
- **Backend API (Live):** https://retain-app-k9k1.onrender.com/api/health

> ⚠️ **Note:** The backend runs on Render's free tier — the first request after 15 minutes of inactivity may take ~30-50 seconds to wake up.

## 🎯 Features

- **Authentication**: Signup, login, JWT-based sessions, protected routes, role-based access (user/admin)
- **Expenses**: Full CRUD with title, amount, category, date, payment method, notes
- **Filters** (via Redux Toolkit): Search, category, payment method, date range, sort by date/amount, pagination
- **Budget**: Set monthly budgets, view spending progress with color-coded status (within / approaching / over)
- **Dashboard**: Total spent, remaining budget, budget status, highest expense, recent expenses
- **Admin** (role-protected): Platform insights + category CRUD with default-category protection
- **Responsive UI** built with Material UI

## 🛠️ Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- Redux Toolkit (filters state)
- React Context (authentication)
- React Router v7 (routing + protected routes)
- Material UI v9 (components)
- Axios (API client)
- React Hook Form (forms)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs (auth)
- Express CORS + dotenv

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas (M0 free tier)

## 📦 Project Structure

```text
retain-app-/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # Redux typed hooks
│   │   ├── pages/          # Route pages
│   │   ├── store/          # Redux store + slices
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   └── vite.config.ts
└── backend/                # Express + MongoDB
    └── src/
        ├── config/         # DB connection
        ├── middleware/     # Auth + admin guards
        ├── models/         # Mongoose schemas
        ├── routes/         # API endpoints
        └── utils/          # Seed helpers