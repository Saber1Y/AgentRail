"use client";

import { useEffect, useState, useTransition } from "react";
import { defaultWorkflowKey, workflowCases } from "../lib/workflows";

function getWorkflow(key) {
  return workflowCases.find((item) => item.key === key) ?? workflowCases[0];
}

export default function WorkflowBoard() {
  const [activeKey, setActiveKey] = useState(defaultWorkflowKey);
  const [objective, setObjective] = useState(getWorkflow(defaultWorkflowKey).title);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeWorkflow = getWorkflow(activeKey);
  const liveWorkflow = quote ?? activeWorkflow;
  const isLiveQuote = Boolean(quote);

  useEffect(() => {
    setObjective(activeWorkflow.title);
    setQuote(null);
    setError("");
  }, [activeWorkflow.key]);

  function handleWorkflowChange(nextKey) {
    setActiveKey(nextKey);
  }

  async function generateQuote() {
    const trimmedObjective = objective.trim();

    if (!trimmedObjective) {
      setError("Add a task so AgentRail can build a quote.");
      return;
    }

    setError("");
    setQuote(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowKey: activeWorkflow.key,
          objective: trimmedObjective,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate the quote.");
      }

      startTransition(() => {
        setQuote(data.quote);
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate the quote.";

      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(() => {
      void generateQuote();
    });
  }

  return (
    <div className="workflow-grid">
      <section className="workflow-switcher card">
        <div className="panel-header">
          <span>Quote builder</span>
          <span className="status-pill">
            {isGenerating || isPending
              ? "Building"
              : isLiveQuote
                ? "Live quote"
                : "Template"}
          </span>
        </div>

        <h3>Choose a workflow, write the brief, and generate a receipt.</h3>
        <p className="section-copy">
          AgentRail quotes are generated through a real Next.js route, so the
          demo can show an honest request-response loop before any payment rail
          integration lands.
        </p>

        <div className="chip-row" aria-label="Workflow scenarios">
          {workflowCases.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === activeKey ? "chip chip-active" : "chip"}
            onClick={() => handleWorkflowChange(item.key)}
            aria-pressed={item.key === activeKey}
          >
            {item.label}
          </button>
          ))}
        </div>

        <form className="workflow-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Objective</span>
            <textarea
              value={objective}
              onChange={(event) => {
                setObjective(event.target.value);
                setError("");

                if (quote) {
                  setQuote(null);
                }
              }}
              placeholder="Describe the work you want the agent to do"
              rows={7}
            />
          </label>

          <div className="form-foot">
            <p className="helper-note">
              x402 unlocks tools, MPP keeps sessions alive, and Stellar tracks
              the settlement trail.
            </p>
            <button
              className="button workflow-submit"
              type="submit"
              disabled={isGenerating || isPending}
            >
              {isGenerating || isPending ? "Generating..." : "Generate quote"}
            </button>
          </div>
        </form>

        {error ? <p className="error-note">{error}</p> : null}

        <div className="workflow-note">
          <span className="eyebrow">{isLiveQuote ? "Live receipt" : "Template receipt"}</span>
          <strong>{liveWorkflow.receipt}</strong>
          <p>
            {isLiveQuote
              ? `Trace ${quote.traceId} is ready for the demo.`
              : "Generate a live quote to attach a trace and plan."}
          </p>
        </div>
      </section>

      <section className="workflow-panel card" aria-label="Workflow detail">
        <div className="quote-header">
          <div>
            <span className="eyebrow">{isLiveQuote ? "Live quote" : "Preview"}</span>
            <h3>{liveWorkflow.title}</h3>
          </div>
          <span className="status-pill">
            {isLiveQuote ? "API generated" : "Template preset"}
          </span>
        </div>

        <p className="section-copy">{liveWorkflow.summary}</p>

        <div className="quote-meta">
          <article className="quote-card">
            <span>Objective</span>
            <strong>{isLiveQuote ? quote.objectiveSummary : activeWorkflow.title}</strong>
          </article>
          <article className="quote-card">
            <span>Trace ID</span>
            <strong>{isLiveQuote ? quote.traceId : "Awaiting quote"}</strong>
          </article>
          <article className="quote-card">
            <span>Rail mix</span>
            <strong>{liveWorkflow.route}</strong>
          </article>
        </div>

        <div className="metric-grid">
          {liveWorkflow.metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <ol className="timeline">
          {liveWorkflow.steps.map((step) => (
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
          {liveWorkflow.deliverables.map((deliverable) => (
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
