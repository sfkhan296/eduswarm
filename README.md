# EduSwarm

> Built by **Team DevOops!** for a hackathon submission.

A personalized learning platform powered by a swarm of AI agents.
Enter any learning prompt and four specialized agents collaborate to generate
a lesson, a quiz, and a UI theme tuned to your level — child, teen, or professional.

EduSwarm adapts not just the content, but the entire learning experience — tone, color scheme, and complexity — based on who you are. Powered by CrewAI and Groq's blazing-fast LLM inference, it delivers personalized education in seconds.

---

## Team

**Team Name:** DevOops!

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/sfkhan296">
        <img src="https://github.com/sfkhan296.png" width="80" alt="Soha Firdaus Khan"/><br/>
        <sub><b>Soha Firdaus Khan</b></sub>
      </a><br/>
      <sub>Team Lead / Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/harshitha-potti">
        <img src="https://github.com/harshitha-potti.png" width="80" alt="Potti Harshitha"/><br/>
        <sub><b>Potti Harshitha</b></sub>
      </a><br/>
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Tejaswini-Rathikanti2">
        <img src="https://github.com/Tejaswini-Rathikanti2.png" width="80" alt="Rathikanti Tejaswini"/><br/>
        <sub><b>Rathikanti Tejaswini</b></sub>
      </a><br/>
      <sub>AI / Agent Engineering</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Deekshita-12">
        <img src="https://github.com/Deekshita-12.png" width="80" alt="Reddygari Deekshitha"/><br/>
        <sub><b>Reddygari Deekshitha</b></sub>
      </a><br/>
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/2411cs030384-Pravina">
        <img src="https://github.com/2411cs030384-Pravina.png" width="80" alt="Pravina Nagvanshi"/><br/>
        <sub><b>Pravina Nagvanshi</b></sub>
      </a><br/>
      <sub>Database &amp; Integration</sub>
    </td>
  </tr>
</table>

---

## Tech Stack

| Layer      | Technology                                                                 |
|------------|----------------------------------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion             |
| Backend    | FastAPI, Python 3.11                                                       |
| AI         | CrewAI + Groq (llama-3.1-8b-instant), LiteLLM                             |
| Auth       | Clerk                                                                      |
| Database   | Supabase (PostgreSQL)                                                      |
| TTS        | gTTS (Google Text-to-Speech, no API key needed)                            |
| Video      | moviepy + Pillow (local MP4), D-ID (talking avatar)                        |
| Images     | Pollinations AI (FLUX model, free)                                         |
| OCR        | OCR.space API (free tier, for image/document text extraction)              |
| Documents  | python-docx, pypdf, mammoth (frontend DOCX preview)                        |
| PPT Export | pptxgenjs (client-side PowerPoint generation)                              |
| Container  | Docker Compose                                                             |

---

## Features

- **Personalized lessons** — CrewAI agent swarm classifies the learner (child / teen / professional) and generates content, quiz, and UI theme in one shot
- **Multi-language support** — lessons, TTS audio, chat, and video in 12 languages (EN, HI, ES, FR, AR, DE, ZH, JA, PT, RU, KO, IT)
- **Document upload** — upload a `.docx`, `.pdf`, `.txt`, `.md`, or image; extracted text feeds directly into the lesson prompt
- **Follow-up chat** — ask clarifying questions after any lesson without re-running the full agent pipeline
- **Text-to-Speech** — listen to any lesson section as a real MP3 (gTTS, no key required)
- **AI video generation** — generate an MP4 slideshow video from the lesson script with 7 visual themes (animated, original, anime, Tom & Jerry, Dora, Doraemon, Heidi)
- **D-ID talking avatar** — generate a talking-head video via D-ID API (female / male / boy / girl voices)
- **AI image generation** — generate concept illustrations or diagrams via Pollinations AI (illustration, diagram, realistic, 3D styles)
- **PPT export** — download any lesson as a PowerPoint file, generated client-side
- **Code generator** — syntax-highlighted code snippets extracted from lesson content
- **Gamification** — XP, levels, streaks, and badges persisted per user in Supabase
- **Session history** — browse and revisit every past learning session
- **Dark / light theme** — full theme toggle with persistent preference

---

## Project Structure

```
eduswarm/
├── docker-compose.yml
├── .gitignore
│
├── frontend/                               # Next.js 14 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                  # Root layout + ClerkProvider + ThemeProvider
│   │   │   ├── page.tsx                    # Landing page
│   │   │   ├── globals.css
│   │   │   ├── sign-in/[[...sign-in]]/
│   │   │   ├── sign-up/[[...sign-up]]/
│   │   │   ├── onboard/                    # First-time user onboarding
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx              # Auth guard + Navbar
│   │   │       ├── learn/page.tsx          # Main learning page
│   │   │       ├── history/page.tsx        # Session history browser
│   │   │       └── profile/page.tsx        # User profile + gamification stats
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.tsx
│   │   │   ├── learn/
│   │   │   │   ├── PromptInput.tsx         # Learning prompt form + file upload + options
│   │   │   │   ├── AgentStatusBar.tsx      # Animated agent progress bar
│   │   │   │   ├── LearningSession.tsx     # Session container
│   │   │   │   ├── ContentView.tsx         # Lesson content renderer + tools launcher
│   │   │   │   ├── QuizView.tsx            # Standard multiple-choice quiz
│   │   │   │   ├── SpaceQuiz.tsx           # Gamified space-themed quiz variant
│   │   │   │   ├── FollowUpChat.tsx        # In-lesson AI chat
│   │   │   │   └── GamificationBar.tsx     # XP / level / streak display
│   │   │   ├── tools/
│   │   │   │   ├── VideoGenerator.tsx      # Local MP4 generation (7 themes)
│   │   │   │   ├── AnimationGenerator.tsx  # D-ID talking avatar video
│   │   │   │   ├── ImageGenerator.tsx      # AI concept image (Pollinations)
│   │   │   │   ├── MP3Generator.tsx        # TTS audio download
│   │   │   │   ├── PPTGenerator.tsx        # PowerPoint export (pptxgenjs)
│   │   │   │   └── CodeGenerator.tsx       # Code snippet viewer
│   │   │   └── ui/                         # shadcn/ui components
│   │   ├── context/
│   │   │   └── LanguageContext.tsx         # Global language selector state
│   │   ├── hooks/
│   │   │   ├── useGamification.ts          # XP / level / badge management
│   │   │   └── useSpeech.ts               # Browser speech synthesis helper
│   │   ├── lib/
│   │   │   ├── utils.ts                    # cn() helper
│   │   │   ├── api.ts                      # Typed fetch wrapper for all API calls
│   │   │   └── i18n.ts                     # UI translation strings
│   │   ├── types/
│   │   │   └── api.ts                      # Shared API types (mirrors backend schemas)
│   │   └── middleware.ts                   # Clerk route protection
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.mjs
│   └── Dockerfile
│
└── backend/                                # FastAPI app
    ├── app/
    │   ├── main.py                         # App factory + CORS + router mount
    │   ├── core/
    │   │   ├── config.py                   # Pydantic settings (reads .env)
    │   │   ├── security.py                 # Clerk JWT verification
    │   │   └── logging.py                  # Structured logging setup
    │   ├── api/v1/
    │   │   ├── router.py                   # Mounts all 9 endpoint routers
    │   │   └── endpoints/
    │   │       ├── learn.py                # POST /api/v1/learn/
    │   │       ├── chat.py                 # POST /api/v1/chat/
    │   │       ├── history.py              # GET  /api/v1/history/
    │   │       ├── tts.py                  # POST /api/v1/tts/
    │   │       ├── video.py                # POST /api/v1/video/
    │   │       ├── did_video.py            # POST /api/v1/did-video/
    │   │       ├── image.py                # POST /api/v1/image/generate
    │   │       ├── extract.py              # POST /api/v1/extract/
    │   │       └── preferences.py          # GET/POST /api/v1/preferences/
    │   ├── schemas/
    │   │   └── learning.py                 # Pydantic request/response models
    │   ├── agents/                         # CrewAI agent definitions
    │   │   ├── learner_analysis_agent.py
    │   │   ├── content_generation_agent.py
    │   │   ├── quiz_generation_agent.py
    │   │   └── ui_personalization_agent.py
    │   ├── tasks/                          # CrewAI task definitions
    │   │   ├── learner_analysis_task.py
    │   │   ├── content_generation_task.py
    │   │   ├── quiz_generation_task.py
    │   │   └── ui_personalization_task.py
    │   ├── crews/
    │   │   └── learning_crew.py            # Orchestrates the full agent pipeline
    │   └── db/
    │       ├── supabase.py                 # Supabase client singleton
    │       ├── sessions.py                 # Learning session persistence
    │       └── preferences.py              # User preferences persistence
    ├── requirements.txt
    ├── .env.example
    └── Dockerfile
```

---

## Agent Pipeline

```
User Prompt + (optional) language + document_text + format_preference + depth_level
    │
    ▼
┌─────────────────────┐
│  Learner Analysis   │  → classifies learner: child / teen / professional
│                     │    + detects language
└─────────────────────┘
    │  level + detected_language
    ▼
┌─────────────────────┐
│ Content Generation  │  → produces titled lesson sections + code examples
│                     │    respects format_preference + depth_level
│                     │    merges document context if provided
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
- A free [Groq API key](https://console.groq.com) (no credit card required)
- A [Clerk](https://clerk.com) account
- A [Supabase](https://supabase.com) project
- *(Optional)* A [D-ID](https://www.d-id.com/) API key for talking avatar videos
- *(Optional)* An [OCR.space](https://ocr.space/ocrapi) API key (defaults to free `helloworld` key)

---

### 1. Clone and configure environment

```bash
git clone https://github.com/sfkhan296/eduswarm.git
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
# Fill in the required values (see Environment Variables below)
```

---

### Environment Variables

**`backend/.env`**

```env
# Groq (free LLM provider — https://console.groq.com)
GROQ_API_KEY=gsk_...

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<anon-public-key>

# Clerk (JWT verification)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWT_ISSUER=https://<your-clerk-domain>.clerk.accounts.dev

# D-ID talking avatar (optional)
DID_API_KEY=<base64-encoded-key>

# OCR.space image text extraction (optional — defaults to free "helloworld" key)
OCR_API_KEY=helloworld

# App
APP_ENV=development
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:3000
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 2a. Run with Docker Compose (recommended)

```bash
docker-compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
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

Run this SQL in your Supabase SQL editor:

```sql
-- Learning sessions
create table if not exists learning_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  prompt      text not null,
  response    jsonb not null,
  created_at  timestamptz default now()
);

create index on learning_sessions(user_id);

-- User preferences (language + gamification)
create table if not exists user_preferences (
  user_id      text primary key,
  language     text default 'en',
  gamification jsonb default '{}',
  updated_at   timestamptz default now()
);
```

---

## API Reference

All endpoints are prefixed with `/api/v1/` and require a Clerk JWT in the `Authorization: Bearer <token>` header (except in dev mode when `CLERK_JWT_ISSUER` is unset).

### `POST /api/v1/learn/`

Runs the full CrewAI agent pipeline and returns a personalized lesson.

**Request body:**
```json
{
  "prompt": "Teach me Java.",
  "language": "en",
  "document_text": "(optional) extracted text from an uploaded file",
  "format_preference": "auto | bullets | paragraphs | step_by_step | qa",
  "depth_level": "auto | overview | detailed | hands_on"
}
```

**Response:**
```json
{
  "learner_profile": {
    "level": "professional",
    "reasoning": "The prompt uses technical framing without requesting basics.",
    "detected_language": "en"
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
  },
  "detected_language": "en"
}
```

---

### `POST /api/v1/chat/`

Follow-up chat after a lesson. Backed by Groq/LLaMA directly (no agent crew).

```json
{
  "message": "Can you explain JVM more simply?",
  "topic": "Java",
  "level": "professional",
  "language": "en",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

---

### `POST /api/v1/tts/`

Convert lesson text to an MP3 audio stream (gTTS, 12 languages supported).

```json
{
  "text": "Java is a statically typed language...",
  "language": "en",
  "slow": false
}
```

Returns: `audio/mpeg` binary stream.

---

### `POST /api/v1/video/`

Generate a narrated MP4 video from a lesson script using Pillow slides + gTTS audio + moviepy.

```json
{
  "script": "[Scene 1]\nVisual: Java logo\nNarrator: Java is a powerful language...",
  "language": "en",
  "style": "animated | original | anime | tomjerry | dora | doraemon | heidi",
  "topic": "Java"
}
```

Returns: `video/mp4` binary stream.

---

### `POST /api/v1/did-video/`

Generate a D-ID talking avatar video from a script (requires `DID_API_KEY`).

```json
{
  "script": "...",
  "language": "en",
  "voice": "female | male | boy | girl",
  "topic": "Java"
}
```

```json
{
  "video_url": "https://...",
  "talk_id": "tlk_...",
  "duration_s": 42.5
}
```

---

### `POST /api/v1/image/generate`

Generate an educational concept image via Pollinations AI (FLUX model, no API key required).

```json
{
  "prompt": "Explain how the JVM works",
  "style": "illustration | diagram | realistic | 3d"
}
```

```json
{
  "image_url": "https://image.pollinations.ai/prompt/...",
  "prompt_used": "Educational concept illustration, illustration style: ..."
}
```

---

### `POST /api/v1/extract/`

Extract text from an uploaded file for use as lesson context. Supports `.docx`, `.pdf`, `.txt`, `.md`, `.json`, `.png`, `.jpg`, `.jpeg`, `.webp`.

Request: `multipart/form-data` with a `file` field.

```json
{
  "filename": "notes.pdf",
  "text": "Extracted content...",
  "char_count": 3420
}
```

---

### `GET /api/v1/history/`

Returns the current user's past learning sessions.

```json
{
  "sessions": [
    {
      "id": "uuid",
      "prompt": "Teach me Java.",
      "created_at": "2025-01-01T00:00:00",
      "learner_level": "professional"
    }
  ],
  "total": 12
}
```

### `GET /api/v1/history/{session_id}`

Returns full details (including the complete response JSON) for a single session.

---

### `GET /api/v1/preferences/`
### `POST /api/v1/preferences/`

Get or update user preferences (language and gamification data — XP, level, streak, badges).

```json
{
  "language": "hi",
  "gamification": {
    "xp": 320,
    "level": 4,
    "streak": 5,
    "badges": ["first_lesson", "quiz_master"]
  }
}
```

---

Full interactive docs at `http://localhost:8000/docs` when the backend is running.

---

## Development Notes

- **Auth bypass in dev:** If `CLERK_JWT_ISSUER` is not set in the backend `.env`, JWT verification is skipped and requests are treated as `dev-user`. Always set it in production.
- **Type safety across the stack:** `frontend/src/types/api.ts` mirrors `backend/app/schemas/learning.py`. Keep them in sync when adding fields.
- **Adding a new agent:** Create a file in `backend/app/agents/`, a matching task in `backend/app/tasks/`, then wire it into `backend/app/crews/learning_crew.py`.
- **Adding UI components:** Use the [shadcn/ui CLI](https://ui.shadcn.com/docs/cli) — `npx shadcn-ui@latest add <component>` — from inside the `frontend/` directory.
- **D-ID free tier:** ~14 credits ≈ 5 minutes of video total. Each generation is billed against your account.
- **OCR free tier:** The default `helloworld` key supports low-resolution images only. Set `OCR_API_KEY` in `.env` for a higher-quality free key from [ocr.space](https://ocr.space/ocrapi).
- **Video generation:** Requires `ffmpeg` to be installed and on `PATH` (used by moviepy). Docker setup handles this automatically.
- **Vercel deployment:** CORS is pre-configured to allow all `*.vercel.app` preview URLs automatically.
