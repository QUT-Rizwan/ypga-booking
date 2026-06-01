# YogaBook — Yoga Booking Web Application

A full-stack yoga class booking system built with **React**, **Node.js/Express**, and **MongoDB**.  
Built for IFQ636 — Software Lifecycle Management, QUT.

---

## Project Links

| Resource | URL |
|----------|-----|
| **GitHub Repository** | https://github.com/QUT-Rizwan/ypga-booking |
| **JIRA Board** | https://iirasras.atlassian.net/jira/software/projects/BY/boards/70/backlog |
| **Live App (Public URL)** | http://\<EC2-PUBLIC-IP\> *(update after EC2 deployment)* |

---

## Features

- **Guest**: Browse venues, view timetable, register
- **Member**: Book sessions, manage membership, view booking history
- **Admin**: Manage venues, sessions, users, memberships, and bookings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| CI/CD | GitHub Actions |
| Hosting | AWS EC2 (Ubuntu 22.04), PM2, Nginx |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
# Runs on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Environment Variables (backend/.env)

```
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/yoga-booking
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yogabook.com | Admin@123 |
| Member | member@yogabook.com | Member@123 |

*(Seed the database first — see below)*

---

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/venues` | Public |
| GET | `/api/sessions` | Public |
| GET | `/api/memberships/plans` | Public |
| POST | `/api/bookings` | Member |
| GET | `/api/admin/dashboard` | Admin |

---

## Branching Strategy

```
main          ← production (protected, CI/CD deploys from here)
develop       ← integration branch
feature/BY-XX ← one branch per JIRA story
```

Pull requests require passing CI checks before merging.

---

## CI/CD Pipeline

- **CI** (`.github/workflows/ci.yml`): Runs on every PR → installs deps, runs tests, builds frontend
- **CD** (`.github/workflows/deploy.yml`): Runs on push to `main` → SSH into EC2, pull, install, build, PM2 restart

### GitHub Secrets required

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 public IP or domain |
| `EC2_USER` | SSH username (e.g., `ubuntu`) |
| `EC2_SSH_KEY` | Private SSH key |

---

## License

MIT
