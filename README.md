# Whyspr

Whyspr is an anonymous message sending app built with Next.js, TypeScript, MongoDB, and NextAuth. Users can create an account, share a public profile link, receive anonymous messages, and control whether they are accepting new messages.

## What It Does

- Create accounts with username, email, and password
- Sign in with credentials or Google OAuth
- Share a personal public link like `/u/[username]`
- Receive anonymous messages from other users
- Toggle message intake on or off from the dashboard
- Generate AI-based message prompts for senders
- Access an admin-only page for viewing registered users

## Current Behavior

The codebase includes email verification templates and verification APIs, but signup is currently set to auto-verify new users and the verification email send call is commented out. The README reflects the app as it works today, not an intended future flow.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- MongoDB with Mongoose
- NextAuth.js
- Tailwind CSS
- React Hook Form + Zod
- Resend for email delivery
- Google Gemini via `@ai-sdk/google` for prompt suggestions

## Main Routes

- `/` landing page
- `/sign-up` registration
- `/sign-in` login
- `/dashboard` user dashboard
- `/u/[username]` public anonymous message page
- `/admin` admin-only user list

## API Highlights

- `POST /api/sign-up`
- `POST /api/verify-code`
- `POST /api/send-message`
- `GET/POST /api/accept-messages`
- `GET /api/get-messages`
- `POST /api/suggest-messages`
- `GET /api/user-data`
- `POST /api/change-password`
- `DELETE /api/delete-message/[messageid]`

## Environment Variables

Create a `.env.local` file in the project root and add the values used by the app:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_GENERATIVE_AI_API_KEY=
RESEND_API_KEY=
```

Notes:

- `MONGODB_URI` is required for all database-backed features.
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are required for authentication.
- Google OAuth requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- AI prompt generation uses Google via the AI SDK, so you need `GOOGLE_GENERATIVE_AI_API_KEY`.
- `RESEND_API_KEY` is only needed if you enable verification emails again.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Product Flow

1. A user signs up or signs in with Google.
2. The user gets a dashboard with a shareable public link.
3. Anyone with that link can send an anonymous message.
4. The recipient can refresh messages, copy their profile URL, and turn message intake on or off.
