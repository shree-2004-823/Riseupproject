# RiseUp

RiseUp is a Vite + React frontend with an Express + Prisma backend for habit tracking, mood check-ins, planner workflows, quit-support tracking, reminders, journaling, challenges, AI coaching, and admin tools.

## Stack

- React 18 + Vite 6
- React Router 7
- Express 5
- Prisma + SQLite
- Direct OpenAI or Gemini-backed coaching with safe local fallback
- TypeScript on both client and server

## Run instructions

### First-time setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from `.env.example`.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS or Linux:

   ```bash
   cp .env.example .env
   ```

   Required values:

   - `DATABASE_URL`
   - `JWT_SECRET` with at least 16 characters
   - `PORT`
   - `CORS_ORIGIN`
   - optional `OPENAI_API_KEY` or `GEMINI_API_KEY` if you want live AI responses instead of the local fallback coach

3. Push the Prisma schema and generate the client:

   ```bash
   npm run prisma:push
   npm run prisma:generate
   ```

4. Seed local data:

   ```bash
   npm run prisma:seed
   npm run prisma:backfill
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173` and the API runs on `http://localhost:4000` by default.

### Daily local run

If setup is already done, you usually only need:

```bash
npm install
npm run dev
```

### Production-style run

To build and run the compiled app locally:

```bash
npm run build
npm start
```

## Useful scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run prisma:generate
npm run prisma:push
npm run prisma:migrate
npm run prisma:seed
npm run prisma:backfill
```

## Main routes

Public routes:

- `/`
- `/login`
- `/signup`

Authenticated app routes:

- `/onboarding`
- `/dashboard`
- `/habits`
- `/mood`
- `/ai-coach`
- `/planner`
- `/quit-support`
- `/journal`
- `/progress`
- `/challenges`
- `/reminders`
- `/community`
- `/profile`
- `/settings`

Admin routes:

- `/admin/login`
- `/admin`
- `/admin/users`

Admin access:

- The default admin access key is `7483621466`
- You can change it with `ADMIN_ACCESS_KEY` in `.env`

## Notes

- Prisma seed configuration now lives in [`prisma.config.ts`](./prisma.config.ts).
- Production builds output to `dist/client` and `dist/server`.
- The floating chatbot uses the real `/api/ai/chat` backend for signed-in users and falls back to guest guidance on public pages.
- Signed-in coaching stores conversation history in Prisma so both the floating chatbot and the `/ai-coach` page can reload the same thread.
- Users can log in with either email or username.
- Account deletion is available from the Settings page and removes the user plus related app data through Prisma cascades.
- The community page is a live private hub with anonymized app-wide momentum stats and challenge spotlight data.
- The admin panel uses a shared access key instead of admin email/password credentials.

## AI coaching

RiseUp keeps authentication, sessions, Prisma models, prompt assembly, chat memory, validation, and route protection inside the app backend. The backend builds a live user context, reads recent coach messages from Prisma, calls OpenAI or Gemini directly when a provider key is set, and falls back to a safe local coach reply if the API is unavailable.

Current AI routes:

- `POST /api/ai/chat`
- `GET /api/ai/conversation`
- `POST /api/ai/conversation/reset`

Recommended environment variables:

- `AI_PROVIDER` with `auto`, `openai`, or `gemini`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_MS`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_TIMEOUT_MS`

`POST /api/ai/chat` accepts:

```json
{
  "message": "I feel like smoking right now",
  "conversationId": "optional-existing-conversation-id"
}
```

It returns:

```json
{
  "message": "Supportive AI response",
  "provider": "gemini",
  "conversationId": "conversation_id",
  "messages": [
    {
      "id": "message_id",
      "role": "user",
      "content": "I feel like smoking right now",
      "createdAt": "2026-04-11T10:00:00.000Z",
      "provider": null
    },
    {
      "id": "message_id_2",
      "role": "ai",
      "content": "Let's make the next two minutes very small: wait before acting, take 10 slow breaths, and replace the urge with water or a short walk. Protecting this moment matters more than being perfect today.",
      "createdAt": "2026-04-11T10:00:02.000Z",
      "provider": "gemini"
    }
  ],
  "context": {}
}
```

If the configured AI provider is unavailable or not configured, the backend still returns a safe local coach response and stores the conversation so the UI keeps working.
