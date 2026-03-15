# FinanceHQ — Cursor Sprint Instructions
# Time-boxed build. Follow phases in order. Do not skip ahead.

---

## Current Stack
- Next.js 14 App Router (already created)
- TypeScript strict mode
- Prisma + SQLite (`DATABASE_URL` in `.env`)
- LangChain (`@langchain/core`, `@langchain/google-genai`)
- Gemini Flash — all LLM calls
- mathjs — math expression evaluation
- Tailwind CSS

## Install Missing Deps First
```bash
npm i @langchain/core @langchain/google-genai langchain mathjs pdf-parse
npm i -D @types/pdf-parse
```

---

## Current DB Schema (do not change existing models)
```prisma
model CreditCardTransaction {
  id           String    @id @default(cuid())
  date         DateTime
  merchantName String
  amount       Float
  deletedAt    DateTime?
  metadata     String?   // JSON: { category, isRecurring, raw }
}

model MerchantClass {
  merchantName String    @id
  class        String    // "groceries" | "transit" | "phone" | "dining" | "subscription" | "education" | "other"
  deletedAt    DateTime?
  metadata     String?
}
```

---

## Phase 1 — Extend DB Schema
Add these models to `prisma/schema.prisma` then run:
```bash
npx prisma migrate dev --name add_accounts_and_context
npx prisma generate
```

```prisma
// Bank account from any institution
model BankAccount {
  id          String        @id @default(cuid())
  institution String        // "RBC" | "Wealthsimple" | "TD" etc
  name        String        // "High Interest eSavings" | "Chequing" etc
  type        String        // "savings" | "chequing" | "investment" | "tfsa" | "credit"
  balance     Float
  currency    String        @default("CAD")
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?
  metadata    String?       // JSON: { apy, apr, creditLimit, accountNumber }
  transactions BankTransaction[]
}

// Transactions from bank statements (not credit card — that's CreditCardTransaction)
model BankTransaction {
  id          String      @id @default(cuid())
  accountId   String
  account     BankAccount @relation(fields: [accountId], references: [id])
  date        DateTime
  amount      Float       // positive = expense/debit, negative = income/credit
  currency    String      @default("CAD")
  category    String      @default("other")
  deletedAt   DateTime?
  metadata    String?     // JSON: { merchant, raw, isRecurring, confidence }
}

// Agent-computed key-value pairs
// Keys: "monthly_expense_avg" | "monthly_income_avg" | "income_stability"
//       "emergency_fund_gap" | "investable_surplus" | "phone_carrier"
//       "phone_plan_cost" | "tfsa_room" | "rrsp_room" | "marginal_tax_rate"
//       "spending_by_category" (JSON string)
model UserVariable {
  id        String    @id @default(cuid())
  key       String    @unique
  value     String    // always string, parse on read
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}
```

Note: UserContext is stored as a JSON file, not in DB. See Phase 2.

---

## Phase 2 — UserContext JSON File Setup
UserContext is a per-user JSON file at `/data/context.json`.
For demo there is only one user (Pratham) so one file is fine.

### File shape (`/data/context.json`)
```json
{
  "userId": "pratham",
  "updatedAt": "2026-03-02T00:00:00Z",
  "entries": [
    {
      "topic": "employment",
      "content": "Part-time or co-op at Wilfrid Laurier University based on payroll deposits",
      "source": "cash_agent_inferred",
      "confidence": 0.8
    },
    {
      "topic": "location",
      "content": "Calgary, Alberta based on Calgary Transit transactions",
      "source": "cash_agent_inferred",
      "confidence": 0.95
    },
    {
      "topic": "lifestyle",
      "content": "Student lifestyle — Dollarama, small transactions, university services",
      "source": "cash_agent_inferred",
      "confidence": 0.85
    },
    {
      "topic": "phone",
      "content": "Rogers wireless at $49.16/month, likely postpaid plan",
      "source": "credit_card_agent_inferred",
      "confidence": 0.9
    }
  ]
}
```

### Create `/lib/context.ts`
```typescript
import fs from "fs"
import path from "path"

const CONTEXT_PATH = path.join(process.cwd(), "data", "context.json")

export type ContextEntry = {
  topic: string
  content: string
  source: string
  confidence: number
}

export type UserContext = {
  userId: string
  updatedAt: string
  entries: ContextEntry[]
}

export function loadContext(): UserContext {
  try {
    const raw = fs.readFileSync(CONTEXT_PATH, "utf-8")
    return JSON.parse(raw)
  } catch {
    return { userId: "pratham", updatedAt: new Date().toISOString(), entries: [] }
  }
}

export function saveContext(ctx: UserContext): void {
  fs.mkdirSync(path.dirname(CONTEXT_PATH), { recursive: true })
  ctx.updatedAt = new Date().toISOString()
  fs.writeFileSync(CONTEXT_PATH, JSON.stringify(ctx, null, 2))
}

export function upsertContext(topic: string, content: string, source: string, confidence: number): void {
  const ctx = loadContext()
  const existing = ctx.entries.findIndex(e => e.topic === topic)
  const entry = { topic, content, source, confidence }
  if (existing >= 0) ctx.entries[existing] = entry
  else ctx.entries.push(entry)
  saveContext(ctx)
}

export function buildContextString(): string {
  const ctx = loadContext()
  if (ctx.entries.length === 0) return "No user context available yet."
  return ctx.entries
    .sort((a, b) => b.confidence - a.confidence)
    .map(e => `[${e.topic}] ${e.content} (confidence: ${e.confidence})`)
    .join("\n")
}
```

Create `/data/context.json` with the pre-filled entries above. This gives agents immediate context about Pratham without waiting for inference to run.

---

## Phase 3 — DB Helper Functions
Create `/lib/db.ts`

```typescript
import { prisma } from "./clients/prisma"

// safely parse metadata
export function parseMeta(metadata: string | null): Record<string, unknown> {
  try { return metadata ? JSON.parse(metadata) : {} }
  catch { return {} }
}

// UserVariable helpers
export async function setVar(key: string, value: string | number | object): Promise<void> {
  const str = typeof value === "string" ? value : JSON.stringify(value)
  await prisma.userVariable.upsert({
    where: { key },
    update: { value: str },
    create: { key, value: str }
  })
}

export async function getVar(key: string): Promise<string | null> {
  const row = await prisma.userVariable.findFirst({
    where: { key, deletedAt: null }
  })
  return row?.value ?? null
}

export async function getVarParsed<T>(key: string): Promise<T | null> {
  const val = await getVar(key)
  if (!val) return null
  try { return JSON.parse(val) as T }
  catch { return val as unknown as T }
}

// Credit card helpers
export async function getCreditCardTransactions() {
  return prisma.creditCardTransaction.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" }
  })
}

export async function classifyMerchant(merchantName: string): Promise<string> {
  const row = await prisma.merchantClass.findFirst({
    where: { merchantName, deletedAt: null }
  })
  return row?.class ?? "other"
}

// Bank account helpers
export async function getBankAccounts() {
  return prisma.bankAccount.findMany({
    where: { deletedAt: null },
    include: {
      transactions: { where: { deletedAt: null }, orderBy: { date: "desc" } }
    }
  })
}
```

---

## Phase 4 — Gemini Client + Calculator Tool
Create `/lib/clients/gemini.ts`
```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY!,
  temperature: 0.1,   // low temp for consistent structured output
})
```

Create `/lib/tools/calculator.ts`
```typescript
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { evaluate } from "mathjs"

export const calculatorTool = tool(
  ({ expression }: { expression: string }) => {
    try {
      const result = evaluate(expression)
      return String(result)
    } catch {
      return "Error: invalid expression — check syntax"
    }
  },
  {
    name: "calculator",
    description: "Evaluate a math expression. Use for ALL numeric calculations — never compute numbers yourself. Input must be a valid math expression string.",
    schema: z.object({
      expression: z.string().describe("Math expression e.g. '49.16 * 12 - 29 * 12'")
    })
  }
)
```

---

## Phase 5 — Cash Agent
Create `/lib/agents/cashAgent.ts`

### What it does
- Reads all BankAccount + BankTransaction rows
- Reads all CreditCardTransaction rows (for expense data)
- Calculates: monthly income avg, monthly expense avg, income stability, emergency fund gap, investable surplus
- Writes results to UserVariable via setVar()
- Writes inferred observations to UserContext via upsertContext()
- Returns CashAgentOutput

### Implementation
```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { JsonOutputParser } from "@langchain/core/output_parsers"
import { gemini } from "../clients/gemini"
import { getBankAccounts, getCreditCardTransactions, setVar, parseMeta } from "../db"
import { buildContextString, upsertContext } from "../context"
import { calculatorTool } from "../tools/calculator"

export type CashAgentOutput = {
  monthlyIncomeAvg: number
  monthlyExpenseAvg: number
  monthlySurplus: number
  incomeStability: "stable" | "irregular" | "unknown"
  emergencyFundGap: number       // 0 if adequate
  liquidCash: number
  investableSurplus: number
  observations: Array<{ topic: string; content: string; confidence: number }>
  calculations: Array<{ label: string; expression: string; result: number }>
}

const SYSTEM = `You are a cash flow analyst for a Canadian personal finance app.
You will be given bank account data, transactions, and user context.
Analyse income sources, expenses, and cash position.

RULES:
- Never compute arithmetic yourself — always use the calculator tool
- Only use numbers explicitly present in the data
- Income = deposits, payroll, government payments, e-transfers IN (negative amount in data)
- Expenses = withdrawals, purchases, debits (positive amount in data)
- Emergency fund target = 3 months of average monthly expenses
- Income stability: stable if monthly income variance < 20%, else irregular
- Canadian context: GST/trillium payments count as income

Return ONLY a JSON object matching this exact shape, no markdown:
{
  "monthlyIncomeAvg": number,
  "monthlyExpenseAvg": number,
  "monthlySurplus": number,
  "incomeStability": "stable" | "irregular" | "unknown",
  "emergencyFundGap": number,
  "liquidCash": number,
  "investableSurplus": number,
  "observations": [{ "topic": string, "content": string, "confidence": number }],
  "calculations": [{ "label": string, "expression": string, "result": number }]
}`

const HUMAN = `## User Context
{context}

## Bank Accounts + Transactions
{accountData}

## Credit Card Transactions (last 3 months)
{creditData}

Analyse cash flow and return the JSON object.`

export async function runCashAgent(): Promise<CashAgentOutput> {
  const [accounts, creditTxns] = await Promise.all([
    getBankAccounts(),
    getCreditCardTransactions()
  ])

  // shape account data
  const accountData = accounts.map(acc => ({
    institution: acc.institution,
    name: acc.name,
    type: acc.type,
    balance: acc.balance,
    ...parseMeta(acc.metadata),
    transactions: acc.transactions.map(t => ({
      date: t.date,
      amount: t.amount,
      category: t.category,
      ...parseMeta(t.metadata)
    }))
  }))

  // shape credit card data — last 90 days only
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const recentCredit = creditTxns
    .filter(t => new Date(t.date) >= cutoff)
    .map(t => ({
      date: t.date,
      merchant: t.merchantName,
      amount: t.amount,
      ...parseMeta(t.metadata)
    }))

  const modelWithTools = gemini.bindTools([calculatorTool])

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM],
    ["human", HUMAN]
  ])

  const chain = prompt.pipe(modelWithTools).pipe(new JsonOutputParser())

  const result = await chain.invoke({
    context: buildContextString(),
    accountData: JSON.stringify(accountData, null, 2),
    creditData: JSON.stringify(recentCredit, null, 2)
  }) as CashAgentOutput

  // write to UserVariable
  await Promise.all([
    setVar("monthly_income_avg", result.monthlyIncomeAvg),
    setVar("monthly_expense_avg", result.monthlyExpenseAvg),
    setVar("income_stability", result.incomeStability),
    setVar("emergency_fund_gap", result.emergencyFundGap),
    setVar("investable_surplus", result.investableSurplus),
    setVar("liquid_cash", result.liquidCash),
  ])

  // write observations to UserContext
  for (const obs of result.observations) {
    upsertContext(obs.topic, obs.content, "cash_agent_inferred", obs.confidence)
  }

  return result
}
```

---

## Phase 6 — Credit Card Agent
Create `/lib/agents/creditCardAgent.ts`

### What it does
- Reads CreditCardTransaction rows
- Classifies transactions by merchant category (uses MerchantClass table, falls back to LLM)
- Calculates spending by category
- Recommends best Canadian credit card for this spending pattern
- Flags recurring charges
- Returns insights + writes to UserVariable

### Hardcoded Canadian credit cards to inject into prompt
```typescript
const CANADIAN_CARDS = [
  {
    name: "Rogers Mastercard (current)",
    annualFee: 0,
    rewards: { base: "1% everywhere", rogers: "1.5% on Rogers purchases" },
    bestFor: ["rogers customers"]
  },
  {
    name: "Scotiabank Scene+ Visa",
    annualFee: 0,
    rewards: { base: "1x everywhere", groceries: "5x at Sobeys/IGA", dining: "3x restaurants" },
    bestFor: ["groceries", "dining"]
  },
  {
    name: "PC Financial Mastercard",
    annualFee: 0,
    rewards: { base: "10 pts/$1", loblaws: "30 pts/$1 at PC stores and Superstore" },
    bestFor: ["groceries", "superstore"]
  },
  {
    name: "Tangerine Money-Back",
    annualFee: 0,
    rewards: { chosen2: "2% on 2 chosen categories", base: "0.5% everywhere" },
    bestFor: ["flexible — choose your top categories"]
  },
  {
    name: "TD Cash Back Visa Infinite",
    annualFee: 120,
    rewards: { groceries: "3%", recurring: "3% on recurring bills", gas: "3%", base: "1%" },
    bestFor: ["groceries", "subscriptions", "gas"]
  }
]
```

### System prompt key instructions
```
You are a credit card optimisation analyst for Canadian consumers.
You will receive credit card transaction history and a list of available Canadian cards.
Classify spending by category, calculate annual rewards on current card vs alternatives.

RULES:
- Never compute arithmetic yourself — use the calculator tool
- Annual reward = sum over categories of (annual_spend_in_category * reward_rate)
- Only recommend cards where the reward improvement exceeds any annual fee difference
- Be specific: show dollar amounts for current rewards vs recommended card rewards

Return ONLY JSON, no markdown:
{
  "spendingByCategory": { [category: string]: number },  // monthly averages
  "annualSpend": number,
  "currentCardAnnualRewards": number,
  "recommendedCard": string,
  "recommendedCardAnnualRewards": number,
  "annualImprovementDollar": number,
  "recurringCharges": [{ "merchant": string, "monthlyAmount": number }],
  "observations": [{ "topic": string, "content": string, "confidence": number }],
  "calculations": [{ "label": string, "expression": string, "result": number }]
}
```

---

## Phase 7 — Phone Plan Agent (faked)
Create `/lib/agents/phoneAgent.ts`

### What it does
- Reads `phone_plan_cost` and `phone_carrier` from UserVariable
- If not found, scans CreditCardTransaction for known carrier names
- Injects hardcoded plan comparison data
- Makes one Gemini call to recommend best plan
- Returns insight with dollar savings

### Hardcoded plans to inject
```typescript
const CANADIAN_PLANS = [
  { carrier: "Rogers", plan: "Current (assumed)", price: 49.16, dataGb: 30 },
  { carrier: "Public Mobile", plan: "20GB", price: 34, dataGb: 20 },
  { carrier: "Koodo", plan: "15GB", price: 40, dataGb: 15 },
  { carrier: "Freedom", plan: "20GB Unlimited Canada", price: 35, dataGb: 20 },
  { carrier: "Fido", plan: "15GB", price: 40, dataGb: 15 },
]
```

### Prompt — keep it simple
```
Given this user's current phone plan and alternatives, recommend the best switch.
User context: {context}
Current plan: {currentPlan}
Available plans: {plans}
User is a student in Calgary with irregular income — cost savings matter.

Return ONLY JSON:
{
  "currentCarrier": string,
  "currentMonthlyCost": number,
  "recommendedCarrier": string,
  "recommendedPlan": string,
  "recommendedMonthlyCost": number,
  "monthlySavings": number,
  "annualSavings": number,
  "switchReason": string
}
```

---

## Phase 8 — Pipeline Orchestrator
Create `/app/api/insights/route.ts`

```typescript
import { NextResponse } from "next/server"
import { runCashAgent } from "@/lib/agents/cashAgent"
import { runCreditCardAgent } from "@/lib/agents/creditCardAgent"
import { runPhoneAgent } from "@/lib/agents/phoneAgent"

export async function POST() {
  try {
    // sequential — each agent reads from DB, writes to DB
    const cashOutput = await runCashAgent()
    const creditOutput = await runCreditCardAgent()
    const phoneOutput = await runPhoneAgent()

    return NextResponse.json({
      cash: cashOutput,
      creditCard: creditOutput,
      phone: phoneOutput,
    })
  } catch (err) {
    console.error("Pipeline error:", err)
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 })
  }
}
```

---

## Phase 9 — Minimal Dashboard UI
Create `/app/dashboard/page.tsx`

### What to show
Three insight cards — one per agent output:

**Cash Card**
- Monthly income avg vs expense avg
- Monthly surplus (green if positive, red if negative)
- Emergency fund gap with dollar amount
- Income stability badge

**Credit Card**
- Current card rewards vs recommended card
- Annual improvement in dollars (big number, highlighted)
- List of recurring charges detected
- Recommended card name + why

**Phone Card**
- Current plan cost
- Recommended plan + carrier
- Annual savings (big green number)
- One sentence switch reason

### Keep UI minimal — Tailwind only, no libraries
- White cards with subtle shadow
- Green for positive numbers, red for negative, amber for warnings
- No charts needed — numbers are enough for demo

---

## Coding Rules (follow strictly)
- TypeScript strict — no `any`
- All AI calls in `/lib/agents/` only — never in components
- Parse AI JSON safely:
  ```typescript
  function safeJson<T>(text: string): T | null {
    try {
      const clean = text.replace(/```json|```/g, "").trim()
      return JSON.parse(clean) as T
    } catch { return null }
  }
  ```
- Always filter soft deletes: `where: { deletedAt: null }`
- Parse metadata safely: `metadata ? JSON.parse(metadata) : {}`
- Calculator tool must be bound to model before every agent call
- Never hardcode dollar amounts — always read from DB or agent output
- `data/context.json` must exist before running pipeline — create it in Phase 2

## File Creation Order
1. `prisma/schema.prisma` — add new models
2. Run migrations
3. `lib/context.ts` + `data/context.json`
4. `lib/db.ts`
5. `lib/clients/gemini.ts`
6. `lib/tools/calculator.ts`
7. `lib/agents/cashAgent.ts`
8. `lib/agents/creditCardAgent.ts`
9. `lib/agents/phoneAgent.ts`
10. `app/api/insights/route.ts`
11. `app/dashboard/page.tsx`

## Environment Variables Needed
```env
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY="your_key_from_aistudio.google.com"
```
