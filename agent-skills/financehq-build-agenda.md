# FinanceHQ — Build Agenda
### Wealthsimple AI Builders Submission
**Deadline: March 2, 2026**

---

## Stack Decision
- **Frontend:** Next.js + Tailwind CSS
- **AI:** Claude API (claude-sonnet) for insights, chat, bill analysis
- **Bank data:** Plaid Node SDK (sandbox mode)
- **File upload:** Native browser FileReader → base64 → Claude vision
- **No database needed** — session state only for demo

---

## Phase 1 — Project Setup
- [ ] `npx create-next-app financehq` with TypeScript + Tailwind
- [ ] Install deps: `npm i plaid @anthropic-ai/sdk`
- [ ] Add `.env.local` with:
  - `PLAID_CLIENT_ID`
  - `PLAID_SECRET` (sandbox)
  - `ANTHROPIC_API_KEY`
- [ ] Create folder structure:
  ```
  /app
    /api
      /plaid-link-token    ← create link token
      /plaid-exchange      ← exchange public token
      /plaid-accounts      ← fetch accounts + transactions
      /insights            ← call Claude with account data
      /chat                ← conversational AI
      /analyze-bill        ← phone bill vision analysis
    /page.tsx              ← connect screen
    /dashboard/page.tsx    ← main dashboard
  /lib
    plaid.ts               ← Plaid client singleton
    claude.ts              ← Anthropic client singleton
    types.ts               ← shared types
  ```

---

## Phase 2 — Plaid Integration
- [ ] Create `/api/plaid-link-token` route — calls `plaid.linkTokenCreate()`
- [ ] Add Plaid Link to connect screen using `react-plaid-link`
  - `npm i react-plaid-link`
- [ ] Create `/api/plaid-exchange` route — exchanges public token for access token, store in session/memory
- [ ] Create `/api/plaid-accounts` route — calls:
  - `plaid.accountsGet()` → balances
  - `plaid.transactionsGet()` → last 90 days
- [ ] In sandbox, use Plaid test credentials (`user_good` / `pass_good`) to get realistic mock data
- [ ] Normalize data into a clean shape: `{ institution, name, type, balance, transactions[] }`

---

## Phase 3 — AI Insights Engine
- [ ] Create `/api/insights` route
- [ ] Build a prompt that sends Claude the full account snapshot and asks for ranked insights
- [ ] Each insight should return: `{ id, priority, category, title, explanation, dollarImpact, action, fromAccount, toAccount, amount }`
- [ ] Ask Claude to return **strict JSON array** — parse it safely with try/catch
- [ ] Categories to cover:
  - Idle cash (low-interest savings → Wealthsimple Cash)
  - High-interest debt (credit cards to pay first)
  - Unused TFSA/RRSP room
  - Bank fees being charged
  - Subscription creep (detect recurring charges from transactions)
  - Cross-bank concentration risk
- [ ] Add a hardcoded fallback array in case Claude returns malformed JSON

---

## Phase 4 — Money Movement Flow (Simulated)
- [ ] When user clicks "Act" on an insight, open a transfer modal
- [ ] Modal step 1: Show what the AI recommends + why
- [ ] Modal step 2: Show transfer details (from, to, amount, projected gain)
- [ ] Modal step 3: Final confirmation — "You are moving $X from Y to Z"
- [ ] Modal step 4: Simulated success screen with annual savings calculation
- [ ] **Note for submission:** Add a comment in code explaining this would call `Plaid Transfer API` or Wealthsimple internal API in production

---

## Phase 5 — Chat with Your Finances
- [ ] Create `/api/chat` route
- [ ] Pass full account context as system prompt on every request
- [ ] Maintain conversation history in React state (array of `{ role, content }`)
- [ ] Send full history on each call — no memory needed server-side
- [ ] Simple chat UI: message bubbles, input bar, send button
- [ ] Add 3 suggested starter questions below the input:
  - "Can I afford a $500 purchase this month?"
  - "Which account should I put my bonus in?"
  - "Am I on track for retirement?"

---

## Phase 6 — Phone Bill Analyzer
- [ ] Create `/api/analyze-bill` route
- [ ] Accept base64 image or PDF of phone bill
- [ ] Pass to Claude with vision — ask it to extract: carrier, plan name, cost, data allowance, actual usage, extra charges
- [ ] Ask Claude to compare against current Canadian carrier plans and suggest cheaper alternatives
- [ ] Return structured response: current plan summary + 2 alternatives + annual savings
- [ ] On the frontend: drag-and-drop or click-to-upload file input
- [ ] Show a loading state while Claude reads the bill
- [ ] Display results in a clean card with savings highlighted

---

## Phase 7 — UI Polish
- [ ] Connect screen: list of banks to connect, Plaid Link button per bank, "Analyse my finances" CTA
- [ ] Dashboard layout: sticky header with tabs (Insights / Accounts / Ask AI / Phone Bill)
- [ ] Net worth bar at top: total assets, total debt, net worth, connected banks
- [ ] Insight cards: priority badge (high/medium/low), category icon, dollar impact, Act + Dismiss buttons
- [ ] Accounts tab: card per account with institution, type, balance, color-coded
- [ ] Mobile responsive — judges may view on phone
- [ ] Loading skeletons while AI is thinking (not just a spinner)

---

## Phase 8 — Demo Prep
- [ ] Record a 2–3 min Loom walkthrough:
  1. Connect 2–3 banks via Plaid sandbox
  2. Show AI generating insights with dollar amounts
  3. Walk through a money move flow
  4. Ask the chat a question
  5. Upload a fake phone bill and show the recommendation
- [ ] Write a short README covering:
  - What problem this solves
  - Why Wealthsimple is uniquely positioned to build it
  - The human/AI boundary (AI recommends, human approves, money never moves without explicit confirmation)
  - What's simulated vs what's production-ready
  - How you'd scale it (real Plaid Transfer, Wealthsimple API, persistent storage)

---

## Submission Checklist
- [ ] Working demo (Plaid sandbox + live Claude API)
- [ ] Clean GitHub repo with README
- [ ] Loom video walkthrough
- [ ] Applied at jobs.ashbyhq.com/wealthsimple before **March 2, 11:59pm PT**

---

## Tips
- Don't waste time on auth — hardcode a single user session for the demo
- Get the AI insights working first, that's what impresses
- Use Plaid sandbox credentials so you don't need real bank logins
- In your submission, explicitly call out the business case: this is a funnel that moves assets from other banks into Wealthsimple
