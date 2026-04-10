"use client";

import { useState } from "react";

const cases = [
  {
    key: "prospecting",
    label: "Prospecting",
    route: "x402 + MPP + Stellar",
    title: "Find 12 fintech leads in Lagos and surface buying signals.",
    summary:
      "A single prompt becomes a paid discovery flow. x402 opens the data source, MPP keeps the browser session alive, and Stellar records the receipt.",
    receipt: "AR-2049-XLM",
    metrics: [
      { label: "Spend", value: "0.84 XLM" },
      { label: "Time saved", value: "42m" },
      { label: "Confidence", value: "91%" },
    ],
    steps: [
      {
        rail: "x402",
        title: "Unlock enriched lead data",
        amount: "0.12 XLM",
        detail: "One HTTP payment opens the source for the agent.",
      },
      {
        rail: "MPP",
        title: "Hold the browser session",
        amount: "0.69 XLM",
        detail: "The session stays alive while the agent verifies contacts.",
      },
      {
        rail: "stellar",
        title: "Anchor the receipt",
        amount: "0.03 XLM",
        detail: "The settlement trail is visible and easy to audit.",
      },
    ],
    deliverables: [
      {
        title: "Lead shortlist",
        items: [
          "Northstar Pay",
          "Kite Ledger",
          "Orbit Ops",
          "Pioneer Stack",
        ],
      },
      {
        title: "Signals",
        items: [
          "Hiring for growth roles",
          "Fresh integration pages",
          "Visible expansion into new markets",
        ],
      },
      {
        title: "Next move",
        items: [
          "Send a warm intro prompt",
          "Attach a one-paragraph value prop",
          "Queue a follow-up research task",
        ],
      },
    ],
  },
  {
    key: "procurement",
    label: "Procurement",
    route: "x402 + Stellar",
    title: "Compare 5 support vendors for a seed-stage SaaS team.",
    summary:
      "The agent pays only for the checks it needs, then returns a vendor shortlist with implementation risk and price bands.",
    receipt: "AR-3017-XLM",
    metrics: [
      { label: "Spend", value: "0.57 XLM" },
      { label: "Time saved", value: "36m" },
      { label: "Confidence", value: "88%" },
    ],
    steps: [
      {
        rail: "x402",
        title: "Unlock comparison source",
        amount: "0.09 XLM",
        detail: "A small request buys the initial vendor matrix.",
      },
      {
        rail: "x402",
        title: "Fetch pricing and docs",
        amount: "0.31 XLM",
        detail: "The agent collects pricing, onboarding, and SLA details.",
      },
      {
        rail: "stellar",
        title: "Write the settlement trail",
        amount: "0.02 XLM",
        detail: "The receipt is stored alongside the work history.",
      },
    ],
    deliverables: [
      {
        title: "Vendor shortlist",
        items: ["RelayDesk", "SignalHQ", "PulseQueue", "OrbitCare"],
      },
      {
        title: "Risk notes",
        items: [
          "High setup effort",
          "Slow enterprise onboarding",
          "Missing team-level controls",
        ],
      },
      {
        title: "Decision angle",
        items: [
          "Lowest friction to pilot",
          "Best support coverage",
          "Clear upgrade path",
        ],
      },
    ],
  },
  {
    key: "travel",
    label: "Travel",
    route: "MPP + Stellar",
    title: "Plan a flexible founder trip between Lagos and Nairobi.",
    summary:
      "MPP keeps the booking session alive while the agent searches options, compares layovers, and surfaces the safest route to buy.",
    receipt: "AR-7842-XLM",
    metrics: [
      { label: "Spend", value: "1.08 XLM" },
      { label: "Time saved", value: "51m" },
      { label: "Confidence", value: "93%" },
    ],
    steps: [
      {
        rail: "MPP",
        title: "Hold the booking session",
        amount: "0.74 XLM",
        detail: "The agent stays active while fares fluctuate.",
      },
      {
        rail: "MPP",
        title: "Compare route options",
        amount: "0.32 XLM",
        detail: "The browser session carries context across multiple tabs.",
      },
      {
        rail: "stellar",
        title: "Confirm the trail",
        amount: "0.02 XLM",
        detail: "Every booking decision leaves a receipt you can inspect later.",
      },
    ],
    deliverables: [
      {
        title: "Route shortlist",
        items: ["Direct if possible", "Fastest safe layover", "Budget backup"],
      },
      {
        title: "Watchouts",
        items: [
          "Visa timing",
          "Change fees",
          "Early-morning connections",
        ],
      },
      {
        title: "Booking move",
        items: [
          "Reserve the flexible fare",
          "Hold the backup option",
          "Notify the team with the receipt",
        ],
      },
    ],
  },
];

export default function WorkflowBoard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = cases[activeIndex];

  return (
    <div className="workflow-grid">
      <section className="workflow-switcher card">
        <div className="panel-header">
          <span>Demo route</span>
          <span className="status-pill">{active.route}</span>
        </div>

        <h3>{active.title}</h3>
        <p className="section-copy">{active.summary}</p>

        <div className="chip-row" aria-label="Workflow scenarios">
          {cases.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={index === activeIndex ? "chip chip-active" : "chip"}
              onClick={() => setActiveIndex(index)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="workflow-note">
          <span className="eyebrow">Receipt</span>
          <strong>{active.receipt}</strong>
          <p>{active.label} flow ready to wire into live payment rails.</p>
        </div>
      </section>

      <section className="workflow-panel card" aria-label="Workflow detail">
        <div className="metric-grid">
          {active.metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <ol className="timeline">
          {active.steps.map((step) => (
            <li className="timeline-item" key={step.title} data-rail={step.rail}>
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-copy">
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
              <span className="timeline-amount">{step.amount}</span>
            </li>
          ))}
        </ol>

        <div className="deliverable-grid">
          {active.deliverables.map((deliverable) => (
            <article className="deliverable-card" key={deliverable.title}>
              <span className="card-kicker">{deliverable.title}</span>
              <ul>
                {deliverable.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
