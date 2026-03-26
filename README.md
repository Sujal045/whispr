# Whyspr

Whyspr is an anonymous messaging app built with Next.js. Users create an account, share a public profile link, and receive anonymous messages in their dashboard.

## Features

- Email/password signup and login
- Google sign-in with NextAuth
- Public profile page at `/u/[username]`
- Anonymous message sending
- Dashboard to view, refresh, and delete messages
- Toggle message intake on or off
- Profile page with account info and password change
- AI-generated message suggestions
- Admin page for users with the `admin` role

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB with Mongoose
- NextAuth
- Tailwind CSS
- React Hook Form + Zod
- Gemini via `@ai-sdk/google`

## Setup

Create a `.env.local` file in the project root:

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

- `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are required.
- Google sign-in needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- AI suggestions need `GOOGLE_GENERATIVE_AI_API_KEY`.
- `RESEND_API_KEY` is only needed if you enable verification emails.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Note

The codebase includes verification email and code verification logic, but signup currently creates users as verified by default.
