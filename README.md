# TaskNova – Smart Student Productivity System
> Full-stack MVC application: React.js + Node.js/Express + MongoDB

---

## 📁 Project Structure (MVC)

```
tasknova/
├── backend/                    ← Controller + Model Layer
│   ├── server.js               ← Entry point
│   ├── .env.example            ← Environment variables
│   ├── models/                 ── MODEL LAYER ──
│   │   ├── User.js             ← User schema (points, streak, badges)
│   │   ├── Task.js             ← Task schema (smart priority, notes)
│   │   └── Progress.js         ← Progress / analytics schema
│   ├── controllers/            ── CONTROLLER LAYER ──
│   │   ├── AuthController.js   ← Register, Login, JWT auth
│   │   ├── TaskController.js   ← CRUD + Smart Priority Engine
│   │   ├── DashboardController.js ← Stats, upcoming tasks
│   │   └── FocusController.js  ← Pomodoro session tracking
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── focusRoutes.js
│   └── middleware/
│       └── auth.js             ← JWT protect middleware
│
└── frontend/                   ── VIEW LAYER ──
    └── tasknova.html           ← Complete React app (self-contained)
```

---

## 🚀 Setup & Run

### Backend
```bash
cd backend
npm install
cp .env.example .env        # fill in your MongoDB URI + JWT secret
npm run dev                  # runs on http://localhost:5000
```

### Frontend (Development)
```bash
cd frontend
npm install
npm start                    # runs on http://localhost:3000
```

### Or open directly
```
Open frontend/tasknova.html in any browser — fully self-contained demo
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login + JWT |
| GET  | /api/auth/me | Get current user |
| PATCH| /api/auth/mood | Update mood theme |
| GET  | /api/tasks | Get all tasks (filterable) |
| POST | /api/tasks | Create task (auto priority) |
| PATCH| /api/tasks/:id | Update task |
| PATCH| /api/tasks/:id/complete | Complete + award XP |
| DELETE| /api/tasks/:id | Delete task |
| POST | /api/tasks/:id/notes | Add note to task |
| GET  | /api/tasks/suggestions | Smart study suggestions |
| PATCH| /api/tasks/reorder | Drag-and-drop reorder |
| GET  | /api/dashboard/stats | Full stats for dashboard |
| GET  | /api/dashboard/upcoming | Upcoming deadlines |
| POST | /api/focus/session/start | Start focus session |
| POST | /api/focus/session/end | End session + award XP |

---

## ✨ Features
- 🤖 **Smart AI Priority** — auto-detects urgency from deadline
- 🎯 **Pomodoro Focus Mode** — full-screen timer
- 📅 **Timeline View** — chronological task layout
- 🎮 **Gamification** — XP, levels, badges
- 📊 **Animated Dashboard** — weekly charts
- 🌙 **Mood Themes** — lazy / focus / exam UI modes
- 🔔 **Study Suggestions** — proactive deadline alerts
- 🔐 **JWT Auth** — secure login/register
