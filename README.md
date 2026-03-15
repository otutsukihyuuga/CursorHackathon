# Elevate

Elevate is a voice-first AI companion built to help students work smarter when their brains feel overwhelmed. It combines reflective chat, cloned voices inspired by loved ones, shared agent skills, mood tracking, and light gamification into a more personal support system.

This repository contains the **frontend** for Elevate. The backend lives in a separate repository and is consumed here through API proxy routes. The frontend is intended to be deployed on **Vercel**.

## What It Does

Elevate helps students navigate overwhelm by making support feel more personal, familiar, and actionable.

Core experiences include:

- **Voice Library**: upload or record reference audio to create and manage cloned voices
- **Personal AI Chat**: chat with an assistant using text or voice input
- **Speech-to-Text**: transcribe spoken prompts before sending them into the chat flow
- **Agent Skills**: upload markdown-based skills and browse reusable prompts/instructions
- **Mood Meter**: visualize emotional patterns through a weekly heatmap
- **Leaderboard**: add a motivational layer through positive competition
- **Profile and Integrations**: user profile space with future wearable integration concepts

## Why We Built It

The hackathon challenge asked us to design a product that helps people work smarter when their brains are overwhelmed. We focused on students because they are constantly balancing deadlines, expectations, emotional stress, and the pressure to keep going even when mentally drained.

We built Elevate as our response to that challenge:

- a more personal AI through familiar cloned voices inspired by loved ones
- a more natural interface through voice input and conversation
- a more reflective experience through mood tracking and emotional awareness
- a more collaborative experience through sharable agent skills

## How It Works

The app is built as a Next.js frontend with authenticated product flows and server-side API proxy routes.

High-level flow:

1. Users sign up or sign in.
2. Users can upload or record audio to create cloned voices.
3. In chat, users send text or voice messages.
4. Voice input is transcribed and forwarded to the backend.
5. The backend handles core AI and data logic.
6. The frontend presents additional experiences like agent skills, mood insights, leaderboard views, and profile management.

## Architecture

This repo is **frontend-only**.

- **Frontend**: this repository, built with Next.js and deployed on Vercel
- **Backend**: separate repository/service, not included here
- **Speech-to-text**: integrated through Sarvam AI
- **Proxy routes**: Next.js route handlers forward requests from the frontend to the backend

Examples of proxied capabilities:

- authentication
- chat requests
- cloned voice management
- user skills
- mood data retrieval

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- Sarvam AI speech-to-text integration

## Main Product Areas

| Route | Purpose |
|---|---|
| `/home` | Product story and feature journey |
| `/auth` | Sign in and sign up |
| `/voices` | Create and manage cloned voices |
| `/chat` | Chat with the personalized AI assistant |
| `/agent-skills` | Upload and preview markdown-based agent skills |
| `/mood-meter` | View mood heatmap and mood meter reference |
| `/leaderboard` | View rankings and gamified progress |
| `/profile` | Account view and future integration space |

## Running Locally

### Prerequisites

- Node.js 20+ recommended
- npm
- access to the separate backend service
- a Sarvam AI API key for transcription

### Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_BACKEND_URL=<your-backend-base-url>
SARVAM_API_KEY=<your-sarvam-api-key>
```

### Install and Start

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment

The frontend is designed to be deployed on **Vercel**.

To deploy successfully, configure these environment variables in Vercel:

- `NEXT_PUBLIC_BACKEND_URL`
- `SARVAM_API_KEY`

Because the backend is hosted separately, this frontend depends on that service being reachable from the deployed Vercel app.

## Project Structure

```text
app/
  auth/                 # Authentication flow
  home/                 # Product story / landing experience
  voices/               # Voice cloning UI
  chat/                 # Chat experience
  agent-skills/         # Skill upload and preview UI
  mood-meter/           # Mood data visualizations
  leaderboard/          # Gamified rankings
  profile/              # User profile
  api/                  # Next.js proxy routes to backend services
components/             # Shared UI building blocks
context/                # Auth and chat state
hooks/                  # Client-side helpers and behavior
lib/                    # Types, config, utilities, mock data
```

## Current State

Elevate is currently a hackathon-stage product and prototype. Some areas already connect to backend services, while others still use sample or mock data to demonstrate the intended experience.

That makes this repository useful both as:

- a working frontend for the live product demo
- a presentation of the product vision for judges, teammates, and future contributors

## Future Direction

We see Elevate growing into a richer student support platform with:

- deeper personalization across conversations
- stronger mood and wellbeing insights
- better voice-centric interactions
- real wearable integrations
- more community-created and shared agent skills

## Notes

- This repository does **not** include the backend codebase.