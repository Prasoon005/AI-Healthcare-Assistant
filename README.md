# 🩺 AI Healthcare System

> An AI-powered full-stack healthcare platform that delivers personalized health assessments, intelligent wellness recommendations, and secure medical data management using modern web technologies.

---

## ✨ Current Status

🚧 **Development Stage:** Authentication Module Complete

### ✅ Completed Features

- 🔐 User Registration
- 🔑 User Login
- 🎫 JWT Access Token Authentication
- 🔄 Refresh Token Authentication
- 🚪 Secure Logout
- 🔒 Password Hashing (bcrypt)
- 🛡️ Input Validation (Zod)
- 🗄️ PostgreSQL Database
- ⚡ Prisma ORM
- 🐳 Dockerized Database
- 📦 Monorepo Architecture
- 🌐 RESTful API
- 📝 Structured API Responses
- ⚙️ Environment Configuration

---

# 🏗️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt
- Zod

## AI Service

- FastAPI
- Python
- Gemini API *(Coming Soon)*

## DevOps

- Docker
- Docker Compose
- Git
- GitHub

---

# 📁 Project Structure

```text
AI-Healthcare-System/
│
├── apps/
│   ├── web/              # React Frontend
│   ├── api/              # Express Backend
│   └── ai-service/       # FastAPI AI Service
│
├── packages/
│   └── shared/           # Shared Types & Config
│
├── docker/
│
├── docs/
│
└── README.md
```

---

# 🔑 Authentication Flow

```text
Register
      │
      ▼
Password Hashing (bcrypt)
      │
      ▼
Save User (PostgreSQL)
      │
      ▼
Login
      │
      ▼
Verify Password
      │
      ▼
Generate JWT Access Token
      │
      ▼
Generate Refresh Token
      │
      ▼
Store Refresh Token
      │
      ▼
Protected APIs
      │
      ▼
Refresh Access Token
      │
      ▼
Logout
      │
      ▼
Delete Refresh Token
```

---

# 📡 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |
| POST | `/api/auth/refresh` | Refresh Access Token |
| POST | `/api/auth/logout` | Logout User |
| GET | `/api/health` | Health Check |

---

# 🚀 Running Locally

### Clone Repository

```bash
git clone https://github.com/yourusername/AI-Healthcare-System.git
```

### Install Dependencies

```bash
npm install
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Run Prisma

```bash
npx prisma migrate dev

npx prisma generate
```

### Start Backend

```bash
npm run dev
```

---

# 📅 Roadmap

## ✅ Phase 1

- [x] Monorepo Setup
- [x] Express Backend
- [x] React Frontend
- [x] Docker PostgreSQL
- [x] Prisma ORM
- [x] Authentication Database
- [x] User Registration
- [x] User Login
- [x] JWT Authentication
- [x] Refresh Tokens
- [x] Logout API

## 🚧 In Progress

- [ ] JWT Middleware
- [ ] Protected Routes
- [ ] Profile API

## 🔜 Coming Soon

- AI Health Dashboard
- Health Profile
- AI Symptom Checker
- AI Chat Assistant
- Medical Report Upload
- AI Report Analysis
- Assessment History
- Health Analytics
- Dark / Light Theme

---

# 🎯 Project Goals

- Build a production-ready healthcare platform.
- Demonstrate scalable backend architecture.
- Integrate AI into real-world healthcare workflows.
- Showcase full-stack engineering skills.
- Create a portfolio project suitable for internships and placements.

---

# 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you find this project useful, consider giving it a **⭐ Star** on GitHub.
