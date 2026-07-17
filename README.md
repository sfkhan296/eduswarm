# EduSwarm

A personalized learning platform powered by a swarm of AI agents.
Enter any learning prompt and four specialized agents collaborate to generate
a lesson, a quiz, and a UI theme tuned to your level — child, teen, or professional.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend    | FastAPI, Python 3.11                    |
| AI         | CrewAI + OpenAI (gpt-4o-mini)           |
| Auth       | Clerk                                   |
| Database   | Supabase (PostgreSQL)                   |
| Container  | Docker Compose                          |

---

## Project Structure

```
eduswarm/
├── docker-compose.yml
├── .gitignore
│
├── frontend/                         # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout + ClerkProvider
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── globals.css           # Tailwind + CSS variables
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx        # Auth guard + Navbar
│   │   │       └── learn/page.tsx    # Main learning page
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── learn/
│   │   │   │   ├── PromptInput.tsx   # Learning prompt form
│   │   │   │   ├── AgentStatusBar.tsx# Animated agent progress
│   │   │   │   ├── LearningSession.tsx
│   │   │   │   ├── ContentView.tsx
│   │   │   │   └── QuizView.tsx      # Interactive quiz
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── utils.ts              # cn() helper
│   │   │   └── api.ts                # Typed fetch wrapper
│   │   ├── types/api.ts              # Shared API types (mirrors backend schemas)
│   │   └── middleware.ts             # Clerk route protection
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── Dockerfile
│
└── backend/                          # FastAPI app
    ├── app/
    │   ├── main.py                   # App factory + CORS + router mount
    │   ├── core/
    │   │   ├── config.py             # Pydantic settings (reads .env)
    │   │   ├── security.py           # Clerk JWT verification
    │   │   └── logging.py            # Structured logging setup
    │   ├── api/v1/
    │   │   ├── router.py             # API v1 router
    │   │   └── endpoints/learn.py    # POST /api/v1/learn/
    │   ├── schemas/
    │   │   └── learning.py           # Pydantic request/response models
    │   ├── agents/                   # CrewAI agent definitions
    │   │   ├── learner_analysis_agent.py
    │   │   ├── content_generation_agent.py
    │   │   ├── quiz_generation_agent.py
    │   │   └── ui_personalization_agent.py
    │   ├── tasks/                    # CrewAI task definitions
    │   │   ├── learner_analysis_task.py
    │   │   ├── content_generation_task.py
    │   │   ├── quiz_generation_task.py
    │   │   └── ui_personalization_task.py
    │   ├── crews/
    │   │   └── learning_crew.py      # Orchestrates the full agent pipeline
    │   └── db/
    │       ├── supabase.py           # Supabase client singleton
    │       └── sessions.py           # Session persistence helpers
    ├── requirements.txt
    ├── .env.example
    └── Dockerfile
```

---

## Agent Pipeline

```
User Prompt
    │
    ▼
┌─────────────────────┐
│  Learner Analysis   │  → classifies learner: child / teen / professional
└─────────────────────┘
    │  level
    ▼
┌─────────────────────┐
│ Content Generation  │  → produces titled lesson sections + code examples
└─────────────────────┘
    │  content
    ▼
┌─────────────────────┐
│  Quiz Generation    │  → creates 3–5 multiple-choice questions
└─────────────────────┘
    │  quiz
    ▼
┌─────────────────────┐
│ UI Personalization  │  → picks tone, color scheme, font size
└─────────────────────┘
    │
    ▼
  JSON Response → Frontend renders personalized learning session
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional but recommended)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Clerk](https://clerk.com) account
- A [Supabase](https://supabase.com) project

---

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd eduswarm
```

**Frontend:**
```bash
cp frontend/.env.local.example frontend/.env.local
# Fill in your Clerk publishable key and backend URL
```

**Backend:**
```bash
cp backend/.env.example backend/.env
# Fill in OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY, CLERK_* values
```

---

### 2a. Run with Docker Compose (recommended)

```bash
docker-compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:8000  |
| API docs | http://localhost:8000/docs |

---

### 2b. Run locally without Docker

**Backend:**
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

### 3. Set up Supabase

Run this SQL in your Supabase SQL editor to create the sessions table:

```sql
create table if not exists learning_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  prompt      text not null,
  response    jsonb not null,
  created_at  timestamptz default now()
);

-- Index for fast user lookups
create index on learning_sessions(user_id);
```

---

## API Reference

### `POST /api/v1/learn/`

Accepts a learning prompt and returns personalized content.

**Request body:**
```json
{
  "prompt": "Teach me Java."
}
```

**Response:**
```json
{
  "learner_profile": {
    "level": "professional",
    "reasoning": "The prompt uses technical framing without requesting basics."
  },
  "content": [
    {
      "title": "What is Java?",
      "body": "Java is a statically typed, object-oriented language...",
      "code_example": "public class Hello { public static void main(String[] args) { System.out.println(\"Hello\"); } }"
    }
  ],
  "quiz": [
    {
      "question": "What does JVM stand for?",
      "options": ["Java Virtual Machine", "Java Variable Manager", "Just-in-time VM", "Java Verified Mode"],
      "correct_index": 0,
      "explanation": "JVM stands for Java Virtual Machine, which runs compiled Java bytecode."
    }
  ],
  "ui_personalization": {
    "tone": "professional",
    "color_scheme": "#1e40af",
    "font_size": "base"
  }
}
```

Full interactive docs available at `http://localhost:8000/docs` when the backend is running.

---

## Development Notes

- **Auth bypass in dev:** If `CLERK_JWT_ISSUER` is not set in the backend `.env`, JWT verification is skipped and requests are treated as `dev-user`. Set it for production.
- **Adding a new agent:** Create a file in `backend/app/agents/`, a matching task in `backend/app/tasks/`, then wire it into `backend/app/crews/learning_crew.py`.
- **Adding UI components:** Use the [shadcn/ui CLI](https://ui.shadcn.com/docs/cli) — `npx shadcn-ui@latest add <component>` — from inside the `frontend/` directory.
- **Type safety across the stack:** `frontend/src/types/api.ts` mirrors `backend/app/schemas/learning.py`. Keep them in sync when adding fields.
