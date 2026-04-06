# MITREMapper — AI-Powered ATT&CK Technique Mapping Engine

MITREMapper is an AI-driven cybersecurity tool that automatically maps free-text security incident descriptions to the [MITRE ATT&CK](https://attack.mitre.org/) framework. Paste an incident narrative, click **Map to ATT&CK**, and receive a structured breakdown of relevant tactics, techniques, confidence levels, and reasoning — in seconds.

---

## Business Problem

When a security incident occurs, analysts must quickly identify *what* adversary behaviors were involved so they can prioritize response, hunt for related activity, and improve defenses. Manually mapping raw incident reports to the 200+ MITRE ATT&CK techniques is slow, error-prone, and requires deep framework expertise.

**Who uses it?**

- SOC analysts triaging alerts and writing incident reports
- Threat intelligence teams standardizing incident data
- Security engineers validating detection coverage
- Students and educators learning the ATT&CK framework

**Why does it matter?**

Consistent, rapid ATT&CK mapping accelerates incident response, improves threat-intelligence sharing (via a common vocabulary), and highlights detection gaps — all of which reduce organizational risk.

---

## Features

- **Natural-language input** — paste any incident description; no structured format required.
- **AI-powered mapping** — uses Google Gemini (via Lovable AI gateway) with function-calling to extract structured ATT&CK data.
- **Confidence scoring** — each technique is rated *high*, *medium*, or *low* confidence with a written rationale.
- **Tactic-grouped results** — techniques are organized by ATT&CK tactic in kill-chain order (Reconnaissance → Impact).
- **Color-coded tactic indicators** — each of the 14 tactics has a unique color for visual scanning.
- **Direct MITRE links** — one-click navigation to the official ATT&CK page for every technique.
- **Pre-built example incidents** — three realistic scenarios to demo the tool instantly.
- **Dark, tactical UI** — purpose-built cybersecurity aesthetic with scan-line effects, cyber-glow accents, and monospaced typography.
- **Responsive design** — works on desktop and tablet viewports.

---

## Architecture / Design

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                  │
│                                                          │
│  ┌──────────┐   ┌────────────┐   ┌───────────────────┐  │
│  │ Index.tsx │──▶│ mitre-api  │──▶│  ResultsPanel.tsx  │  │
│  │ (input)  │   │  .ts       │   │  TechniqueCard.tsx │  │
│  └──────────┘   └─────┬──────┘   └───────────────────┘  │
│                       │ invoke("mitre-map")               │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼──────────────────────────────────┐
│              Supabase Edge Function                       │
│              supabase/functions/mitre-map/index.ts        │
│                                                           │
│  1. Receives incident text                                │
│  2. Builds prompt + tool schema (map_techniques)          │
│  3. Calls Lovable AI Gateway (Gemini 3 Flash)             │
│  4. Parses tool_call response → returns JSON              │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│         Lovable AI Gateway (google/gemini-3-flash)        │
│         - System prompt: ATT&CK expert                    │
│         - Function calling: map_techniques                │
│         - Returns: { summary, techniques[] }              │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User** types or selects an example incident in `Index.tsx`.
2. **`mapToMitre()`** (`src/lib/mitre-api.ts`) invokes the `mitre-map` edge function via the Supabase client.
3. **Edge function** sends the description to the Lovable AI gateway with a structured `tools` schema that forces the model to return tactic, techniqueId, techniqueName, confidence, and reasoning.
4. **AI response** is parsed and returned as `MitreMapResult`.
5. **`ResultsPanel`** groups techniques by tactic (kill-chain order) and renders `TechniqueCard` components with color-coding, confidence badges, and external MITRE links.

### Key Components

| File | Role |
|---|---|
| `src/pages/Index.tsx` | Main dashboard — input, examples, loading state, results |
| `src/lib/mitre-api.ts` | Client-side API wrapper (Supabase function invoke) |
| `src/components/ResultsPanel.tsx` | Groups & displays mapped techniques |
| `src/components/TechniqueCard.tsx` | Single technique card with tactic color, confidence badge, link |
| `src/types/mitre.ts` | TypeScript types, tactic ordering, tactic color map |
| `supabase/functions/mitre-map/index.ts` | Edge function — prompt engineering + AI gateway call |

---

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <project-directory>

# 2. Install dependencies (uses Bun, npm, or pnpm)
npm install
# or
bun install

# 3. Set environment variables
#    Create a .env file with:
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>

# 4. Deploy the edge function (requires Supabase CLI)
supabase functions deploy mitre-map

# 5. Ensure the LOVABLE_API_KEY secret is set in your Supabase project
supabase secrets set LOVABLE_API_KEY=<your-key>
```

> **Note:** If you are running this on Lovable, the environment and edge functions are configured automatically — no manual setup is needed.

---

## Usage

```bash
# Start the development server
npm run dev
```

1. Open **http://localhost:5173** in your browser.
2. Type or paste a security incident description into the text area.
3. (Optional) Click **Example 1**, **Example 2**, or **Example 3** to load a sample incident.
4. Click **Map to ATT&CK**.
5. Review the mapped techniques grouped by tactic, with confidence levels and reasoning.

---

## Sample Input / Output

### Input

> *"An employee received a Word document via email. Upon opening, a macro executed PowerShell commands that downloaded a second-stage payload from a remote server. The payload established persistence via a scheduled task and began exfiltrating browser credentials."*

### Output

| Tactic | Technique ID | Technique Name | Confidence |
|---|---|---|---|
| Initial Access | T1566.001 | Phishing: Spearphishing Attachment | High |
| Execution | T1204.002 | User Execution: Malicious File | High |
| Execution | T1059.001 | Command and Scripting Interpreter: PowerShell | High |
| Persistence | T1053.005 | Scheduled Task/Job: Scheduled Task | High |
| Credential Access | T1555.003 | Credentials from Password Stores: Credentials from Web Browsers | High |
| Command and Control | T1105 | Ingress Tool Transfer | Medium |

Each technique card also includes a **reasoning** field explaining why the technique was identified and a direct link to the MITRE ATT&CK page.

<img width="1370" height="774" alt="Screenshot (2124)" src="https://github.com/user-attachments/assets/2022cc82-3dc9-4a89-88ee-4b4c0120d14b" />
<img width="1368" height="763" alt="Screenshot (2125)" src="https://github.com/user-attachments/assets/968c3f3a-e4ba-45bd-8273-8da45cf1a5ab" />


---

## Limitations & Future Work

### Current Limitations

- **No persistent storage** — analysis results are not saved between sessions.
- **AI accuracy** — mapping quality depends on the AI model; edge cases or highly technical jargon may reduce accuracy.
- **No batch processing** — only one incident can be analyzed at a time.
- **No export** — results cannot be downloaded as CSV, JSON, or STIX format.
- **No ATT&CK version pinning** — technique IDs reference the latest ATT&CK version but are not validated against a local copy.
- **English only** — the AI prompt and UI are English-language only.

### Future Work

- **Export to CSV / JSON / STIX** — allow analysts to download and share results.
- **ATT&CK matrix heatmap** — visual matrix overlay showing identified techniques.
- **Analysis history** — persist past analyses for review and comparison.
- **Batch / bulk analysis** — upload multiple incident reports at once.
- **ATT&CK version selection** — pin results to a specific ATT&CK version.
- **Confidence threshold filtering** — hide low-confidence results.
- **Integration with SIEM/SOAR** — API endpoint for automated ingestion.

---

## References

- [MITRE ATT&CK Framework](https://attack.mitre.org/) — the knowledge base of adversary tactics and techniques.
- [MITRE ATT&CK Techniques](https://attack.mitre.org/techniques/enterprise/) — full enterprise technique catalog.
- [Lovable AI Gateway](https://lovable.dev) — AI model hosting used for the mapping engine.
- [Google Gemini](https://deepmind.google/technologies/gemini/) — the underlying AI model (`gemini-3-flash-preview`).
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) — serverless function runtime.
- [React](https://react.dev/) — UI framework.
- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework.
- [Framer Motion](https://www.framer.com/motion/) — animation library.
- [shadcn/ui](https://ui.shadcn.com/) — component library built on Radix UI.
- [Lucide Icons](https://lucide.dev/) — icon set.
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — monospaced font.
