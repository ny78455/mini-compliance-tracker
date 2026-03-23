# Mini Compliance Tracker

A full-stack web application to manage compliance tasks for multiple clients.

---

## 1. Live Links

### URL = https://mini-compliance-tracker-rust.vercel.app/

---

## 2. Setup Instructions

### Clone repo

```bash
git clone https://github.com/ny78455/mini-compliance-tracker
cd mini-compliance-tracker
```

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

## 3. Architecture Overview

### Tech Choices

* **Frontend**: React 19, Vite, Tailwind CSS, Zustand (State Management), Lucide React (Icons), date-fns
* **Backend**: Node.js, Express
* **Database**: SQLite (for local persistence) + Supabase (for authentication)
* **Language**: TypeScript across the stack

---

### Folder Structure

* `/src/components`: Reusable UI components (Sidebar, TaskBoard, Modals, Filters)
* `/src/services`: API integration + Supabase auth logic
* `/src/store.ts`: Zustand global state management
* `/src/utils`: Helper functions (date logic, risk scoring, etc.)
* `/server.ts`: Express backend and SQLite database setup

---

## 4. Features

### Core Features

* View and manage multiple clients
* Add, update, and track compliance tasks
* Status management (Pending → Completed)
* Filter tasks by status, category, and priority
* Highlight overdue tasks

### Advanced Features

* Risk scoring for tasks (based on deadline + priority)
* Dashboard stats (total, pending, completed, overdue)
* Smart filtering and search
* Toast notifications
* Activity tracking (audit-like behavior)
* CSV export

### Authentication

* Implemented using **Supabase Auth**
* Email/password-based login system
* Session persistence across refresh
* Protected routes (only authenticated users can access dashboard)
* Logout functionality

---

## 5. Tradeoffs

* **Database**: Used SQLite for simplicity and zero-config local setup. For production, PostgreSQL or Supabase DB would be preferred.
* **Authentication**: Used Supabase Auth instead of building custom JWT-based auth to speed up development and ensure security.
* **State Management**: Zustand used for simplicity and minimal boilerplate compared to Redux.
* **Scalability**: Focused on fast development and clarity rather than microservices or complex architecture.

---

## 6. Assumptions

* Single-user per session (no multi-tenant role management)
* No granular role-based access control (admin-only view)
* Tasks belong to a single client
* Internet connection available for authentication (Supabase)

---

## 7. Future Improvements

* Role-based access (Admin / Team Members)
* Real-time updates (WebSockets / Supabase subscriptions)
* Calendar view for compliance deadlines
* Email/SMS reminders for overdue tasks
* Full migration to cloud DB (PostgreSQL / Supabase)
* Docker support for easier deployment

---

## 8. Notes

This project focuses on delivering a **working, clean, and scalable MVP** with real-world SaaS-like features while keeping the system simple and easy to run locally.

---
