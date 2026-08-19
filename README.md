# Quiz Management Platform — Backend

Node.js + Express + PostgreSQL (Prisma) REST API powering the Quiz Management & Online Assessment Platform.

**Live API:** https://quiz-platform-backend-pmmd.onrender.com
**Frontend repo:** https://github.com/MangeshParhad/quiz-platform-frontend

## Tech Stack
- Node.js, Express.js
- PostgreSQL (hosted on Neon)
- Prisma ORM
- JWT authentication, bcrypt password hashing

## Features
- Role-based auth (Admin/Student) with JWT
- Quiz, Category, Question/Option CRUD (admin)
- Student quiz browsing, search, filters
- Backend-authoritative timed quiz attempts
- Server-side scoring (correct/incorrect/unanswered, pass/fail)
- Result review with explanations
- Admin analytics (pass/fail ratio, popular quizzes/categories, time-series data)
- Leaderboard (overall + category-wise)

## Local Setup
\`\`\`bash
git clone https://github.com/MangeshParhad/quiz-platform-backend.git
cd quiz-platform-backend
npm install
\`\`\`

Create a `.env` file:
\`\`\`
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
PORT=5000
RESEND_API_KEY=optional
RESEND_FROM_EMAIL=optional
\`\`\`

\`\`\`bash
npx prisma migrate dev
npm run dev
\`\`\`

## API Overview
- `/api/auth` — register, login
- `/api/admin` — dashboard stats, student management, analytics
- `/api/quizzes` — admin quiz CRUD
- `/api/categories` — category CRUD
- `/api/questions` — question/option CRUD
- `/api/student-quizzes` — student quiz browsing
- `/api/attempts` — start, submit, result, review, history
- `/api/student-dashboard` — student stats
- `/api/leaderboard` — overall + category rankings

## Security
- Passwords hashed with bcrypt
- JWT-based auth, role-based middleware (protect/adminOnly)
- All scoring calculated server-side only
- Ownership checks prevent cross-user data access