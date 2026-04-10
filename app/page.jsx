import WorkflowBoard from "./components/WorkflowBoard";

const heroStats = [
  { label: "Micro-payments", value: "x402" },
  { label: "Session billing", value: "MPP" },
  { label: "Settlement layer", value: "Stellar" },
];

const featureCards = [
  {
    kicker: "Problem",
    title: "Agents stall at access walls.",
    body:
      "APIs, browser sessions, and premium tools are still trapped behind subscriptions or manual approvals. That breaks the flow of agentic work.",
  },
  {
    kicker: "Solution",
    title: "Charge per task, not per month.",
    body:
      "AgentRail makes the payment itself part of the workflow. Users only pay when the agent actually needs a tool or a session.",
  },
  {
    kicker: "Win condition",
    title: "Demo the settlement, not just the prompt.",
    body:
      "A sharp demo can show a business outcome, a visible payment trail, and a memorable product story in under two minutes.",
  },
];

const routeSteps = [
  {
    title: "Prompt enters the rail",
    body: "User asks for research, outreach, booking, or comparison work.",
  },
  {
    title: "Payment gates open access",
    body: "Small unlocks flow through x402, while MPP keeps a longer session alive.",
  },
  {
    title: "Agent completes the work",
    body: "Tools, browser tasks, and data calls get paid only when they are used.",
  },
  {
    title: "Receipt lands on Stellar",
    body: "Every step leaves behind a visible settlement trail for the user.",
  },
];

export default function Home() {
  return (
    <main className="page" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AgentRail home">
          <span className="brand-mark">AR</span>
          <span className="brand-copy">
            <strong>AgentRail</strong>
            <small>Paid agents on Stellar</small>
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          <a href="#product">Product</a>
          <a href="#rails">Rails</a>
          <a href="#workflow">Workflow</a>
          <a href="#ship">Ship</a>
        </nav>

        <a className="button button-ghost" href="#workflow">
          Open demo
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Hackathon concept</span>
          <h1>Sell work, not just tokens.</h1>
          <p className="lede">
            AgentRail turns agent tasks into billable workflows. x402 unlocks
            one-off tools, MPP handles longer sessions, and Stellar records the
            settlement trail.
          </p>

          <div className="hero-actions">
            <a className="button" href="#workflow">
              Try the workflow
            </a>
            <a className="button button-soft" href="#ship">
              See the build plan
            </a>
          </div>

          <dl className="stats">
            {heroStats.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="hero-panel" aria-label="Workflow preview">
          <div className="panel-header">
            <span>Live route</span>
            <span className="status-pill">Preview</span>
          </div>

          <ol className="route">
            {routeSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section id="product" className="section grid-3">
        {featureCards.map((card) => (
          <article className="card" key={card.title}>
            <span className="card-kicker">{card.kicker}</span>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section id="rails" className="section split">
        <div>
          <span className="eyebrow">Rails</span>
          <h2>Two payment modes, one agentic experience.</h2>
          <p className="section-copy">
            x402 is the quick unlock for HTTP-sized actions. MPP is the longer
            session path for browser-driven or multi-step work. AgentRail wraps
            both in a single product narrative.
          </p>
        </div>

        <div className="code-card">
          <div className="code-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{`prompt -> paywall -> tool -> deliverable
  x402     payment    agent      Stellar receipt
  MPP      session    browser     settlement`}</code>
          </pre>
        </div>
      </section>

      <section id="workflow" className="section workflow-section">
        <div className="section-heading">
          <span className="eyebrow">Live preview</span>
          <h2>Choose a workflow and watch the rails light up.</h2>
          <p className="section-copy">
            This scaffold already feels like the product. The next commits can
            wire this board to live x402 and MPP endpoints.
          </p>
        </div>

        <WorkflowBoard />
      </section>

      <section id="ship" className="section footer-cta">
        <div>
          <span className="eyebrow">Ship plan</span>
          <h2>We build the story in small commits.</h2>
          <p>
            That keeps the repo easy to review and makes every milestone feel
            like a real step toward the demo.
          </p>
        </div>

        <p className="footer-note">
          AgentRail <span aria-hidden="true">•</span> 2026
        </p>
      </section>
    </main>
  );
}
