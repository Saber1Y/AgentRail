# AgentRail

AgentRail is a demo-ready paid-agent UI built with Next.js and Bun.

It shows a simple but convincing product loop:

1. A user writes a task.
2. AgentRail generates a quote.
3. The paid run settles the workflow.
4. The receipt and output artifact are saved for review.

## MVP features

- Live quote builder backed by `/api/quote`
- Paid run lifecycle backed by `/api/run`
- Recent receipt history with browser persistence
- Copy summary and copy JSON actions for judges
- Clear history control for fast demo resets
- Workflow presets for prospecting, procurement, and travel

## Run locally

```bash
bun install
bun run dev
```

Then open `http://localhost:3000`.

## Build

```bash
bun run build
```

## Demo flow

1. Select a workflow preset.
2. Enter a task in the objective field.
3. Generate the quote.
4. Start the paid run.
5. Copy the summary or JSON payload.

## Project shape

- `app/page.jsx` - landing page and hackathon story
- `app/components/WorkflowBoard.jsx` - interactive quote and run UI
- `app/api/quote/route.js` - quote generation endpoint
- `app/api/run/route.js` - paid run settlement endpoint
- `app/lib/workflows.js` - workflow presets and deterministic demo data
