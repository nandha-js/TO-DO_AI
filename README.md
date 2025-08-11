# 🧠 AI To-Do Backend

A Node.js + Express + MongoDB powered backend for an AI-assisted task management system.  
It supports authentication, task CRUD operations, analytics, and integrates with OpenAI to parse natural language into structured tasks.

---

## 🚀 Features

- **User Authentication** (JWT-based signup/login/logout, password reset)
- **Task Management** (CRUD operations, status updates, bulk deletion)
- **Analytics** (task completion stats, category breakdown, productivity trends & streaks)
- **AI Integration** (convert natural language into structured task details using OpenAI API)
- **Secure API** (authentication middleware, error handling, helmet security headers)
- **Developer Friendly** (ESLint-friendly code style, clear API structure)

---

## 📦 Tech Stack

- **Node.js** (Express.js framework)
- **MongoDB + Mongoose**
- **JWT Authentication**
- **OpenAI API** for AI Task Parsing
- **dotenv** for environment config
- **Morgan** for HTTP request logging
- **Helmet & CORS** for security

---

PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-todo
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_key
NODE_ENV=development


---

## 📡 API Endpoints

### **Auth**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout (client-side token removal) |
| POST | `/api/auth/forgot-password` | Get password reset token |
| POST | `/api/auth/reset-password/:token` | Reset password with token |

### **Tasks** (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get a single task |
| PUT | `/api/tasks/:id` | Update task details |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete single task |
| DELETE | `/api/tasks/completed` | Delete all completed tasks |

### **Analytics** (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/completion-stats` | Task completion stats |
| GET | `/api/analytics/category-stats` | Category breakdown |
| GET | `/api/analytics/productivity-trends` | Productivity trends |
| GET | `/api/analytics/streaks` | Productivity streak data |

---

## 🧪 Testing with Postman
1. Import the provided Postman collection (`postman_collection.json` if you have it).
2. Update the `{{baseUrl}}` and `{{token}}` variables.
3. Test Signup → Login to get JWT → Use for Tasks & Analytics endpoints.

---

## 🔒 Security Considerations
- `.env` file is **ignored** via `.gitignore` — never commit secrets.
- JWT tokens should be stored securely in the client (HTTP-only cookies or secure storage).
- AI endpoints validate and sanitize AI output before saving to DB.

---




