"use client";

import { useEffect, useState } from "react";
import { defaultWorkflowKey, workflowCases } from "../lib/workflows";

const historyStorageKey = "agentrail:quote-history";
const maxHistoryItems = 6;

function getWorkflow(key) {
  return workflowCases.find((item) => item.key === key) ?? workflowCases[0];
}

function buildPreviewPaymentStages(workflow) {
  return workflow.steps.map((step, index) => ({
    rail: step.rail,
    label: step.title,
    amount: step.amount,
    detail: step.detail,
    order: index + 1,
    status: index === 0 ? "ready" : "queued",
  }));
}

function safeParseHistory(rawValue) {
  if (typeof rawValue !== "string" || !rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item && typeof item === "object");
  } catch {
    return [];
  }
}

function formatSavedAt(savedAt) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(savedAt));
  } catch {
    return "Just now";
  }
}

function formatStageState(status) {
  switch (status) {
    case "complete":
      return "Complete";
    case "running":
      return "Running";
    case "ready":
      return "Ready";
    default:
      return "Queued";
  }
}

function formatReceiptStatus(item) {
  if (item?.status === "settled" || item?.runId) {
    return "Settled";
  }

  return "Quoted";
}

export default function WorkflowBoard() {
  const [activeKey, setActiveKey] = useState(defaultWorkflowKey);
  const [objective, setObjective] = useState(
    getWorkflow(defaultWorkflowKey).title
  );
  const [quote, setQuote] = useState(null);
  const [run, setRun] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [runError, setRunError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const activeWorkflow = getWorkflow(activeKey);
  const currentSession = run ?? quote;
  const liveWorkflow = currentSession ?? activeWorkflow;
  const isSettled = Boolean(run);
  const paymentStages = isSettled
    ? run.paymentStages
    : buildPreviewPaymentStages(liveWorkflow);
  const sessionStateLabel = isRunning
    ? "Running"
    : isGenerating
      ? "Building"
      : isSettled
        ? "Settled"
        : currentSession
          ? "Quoted"
          : "Template";

  useEffect(() => {
    try {
      const storedHistory = safeParseHistory(
        window.localStorage.getItem(historyStorageKey)
      );

      setHistory(storedHistory);
    } catch {
      setHistory([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(historyStorageKey, JSON.stringify(history));
    } catch {
      // Ignore persistence failures in the demo shell.
    }
  }, [history, hasHydrated]);

  function resetSession(nextKey) {
    const workflow = getWorkflow(nextKey);

    setActiveKey(workflow.key);
    setObjective(workflow.title);
    setQuote(null);
    setRun(null);
    setError("");
    setRunError("");
  }

  function handleWorkflowChange(nextKey) {
    resetSession(nextKey);
  }

  function handleHistorySelect(item) {
    const workflow = getWorkflow(item.workflowKey ?? item.key);

    setActiveKey(workflow.key);
    setObjective(item.objective ?? workflow.title);
    setQuote(item);
    setRun(item.runId ? item : null);
    setError("");
    setRunError("");
  }

  async function generateQuote() {
    const trimmedObjective = objective.trim();

    if (!trimmedObjective) {
      setError("Add a task so AgentRail can build a quote.");
      return;
    }

    setError("");
    setRunError("");
    setQuote(null);
    setRun(null);
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

      setQuote(data.quote);
      setHistory((currentHistory) => {
        const savedAt = new Date().toISOString();
        const nextHistory = [
          {
            ...data.quote,
            kind: "quote",
            savedAt,
          },
          ...currentHistory.filter((item) => item.traceId !== data.quote.traceId),
        ];

        return nextHistory.slice(0, maxHistoryItems);
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

  async function startPaidRun() {
    const currentQuote = quote ?? currentSession;

    if (!currentQuote) {
      setRunError("Generate a quote before starting the paid run.");
      return;
    }

    setRunError("");
    setError("");
    setIsRunning(true);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote: currentQuote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to start the paid run.");
      }

      setRun(data.run);
      setQuote(data.run);
      setHistory((currentHistory) => {
        const savedAt =
          currentHistory.find((item) => item.traceId === data.run.traceId)
            ?.savedAt ?? new Date().toISOString();
        const nextHistory = [
          {
            ...data.run,
            kind: "run",
            savedAt,
          },
          ...currentHistory.filter((item) => item.traceId !== data.run.traceId),
        ];

        return nextHistory.slice(0, maxHistoryItems);
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start the paid run.";

      setRunError(message);
    } finally {
      setIsRunning(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    void generateQuote();
  }

  const resultDeliverables =
    run?.artifact?.deliverables ?? liveWorkflow.deliverables;

  return (
    <div className="workflow-grid">
      <section className="workflow-switcher card">
        <div className="panel-header">
          <span>Quote builder</span>
          <span className="status-pill">{sessionStateLabel}</span>
        </div>

        <h3>Choose a workflow, write the brief, and generate a receipt.</h3>
        <p className="section-copy">
          AgentRail quotes are generated through a real Next.js route, and the
          paid run uses a second route to settle the workflow and produce the
          final artifact.
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
                setRunError("");

                if (quote || run) {
                  setQuote(null);
                  setRun(null);
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
              disabled={isGenerating || isRunning}
            >
              {isGenerating ? "Generating..." : "Generate quote"}
            </button>
          </div>
        </form>

        {error ? <p className="error-note">{error}</p> : null}

        <div className="workflow-note">
          <span className="eyebrow">
            {isSettled
              ? "Settled receipt"
              : currentSession
                ? "Live receipt"
                : "Template receipt"}
          </span>
          <strong>{currentSession?.receipt ?? liveWorkflow.receipt}</strong>
          <p>
            {isSettled
              ? `Run ${run.runId} has been settled on the rail.`
              : currentSession
                ? `Trace ${currentSession.traceId} is ready for the paid run.`
                : "Generate a live quote to attach a trace and plan."}
          </p>
        </div>

        <div className="run-actions">
          <button
            type="button"
            className="button button-soft workflow-run"
            onClick={() => void startPaidRun()}
            disabled={isGenerating || isRunning || !currentSession}
          >
            {isRunning
              ? "Running..."
              : isSettled
                ? "Run again"
                : "Start paid run"}
          </button>
          <p className="helper-note">
            The paid run simulates x402 authorization, MPP session hold, and
            Stellar settlement before generating the final artifact.
          </p>
        </div>

        {runError ? <p className="error-note">{runError}</p> : null}

        <section className="history-panel" aria-label="Recent receipts">
          <div className="history-header">
            <span className="eyebrow">Recent receipts</span>
            <span className="history-count">{history.length}</span>
          </div>

          {history.length ? (
            <div className="history-list">
              {history.map((item) => (
                <button
                  type="button"
                  className="history-item"
                  key={`${item.traceId}-${item.savedAt}`}
                  onClick={() => handleHistorySelect(item)}
                  aria-pressed={currentSession?.traceId === item.traceId}
                  aria-label={`Restore receipt ${item.traceId}`}
                >
                  <div className="history-top">
                    <strong>{item.workflowLabel ?? "AgentRail"}</strong>
                    <span>{formatSavedAt(item.savedAt)}</span>
                  </div>
                  <p>{item.objectiveSummary}</p>
                  <div className="history-meta">
                    <span>{formatReceiptStatus(item)}</span>
                    <span>{item.traceId}</span>
                    <span>{item.route}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="history-empty">
              Every generated quote will land here so you can walk the judge
              through the latest receipts.
            </p>
          )}
        </section>
      </section>

      <section className="workflow-panel card" aria-label="Workflow detail">
        <div className="quote-header">
          <div>
            <span className="eyebrow">
              {isSettled ? "Settled run" : currentSession ? "Live quote" : "Preview"}
            </span>
            <h3>
              {isSettled ? run.artifact.headline : liveWorkflow.title}
            </h3>
          </div>
          <span className="status-pill">
            {isSettled ? "API run complete" : currentSession ? "API generated" : "Template preset"}
          </span>
        </div>

        <p className="section-copy">
          {isSettled ? run.artifact.summary : liveWorkflow.summary}
        </p>

        {isSettled ? (
          <div className="result-banner">
            <div>
              <span className="eyebrow">Run receipt</span>
              <strong>{run.runId}</strong>
            </div>
            <div>
              <span className="eyebrow">Settlement</span>
              <strong>{run.settlementId}</strong>
            </div>
            <div>
              <span className="eyebrow">Status</span>
              <strong>{run.status}</strong>
            </div>
          </div>
        ) : null}

        <div className="payment-stepper">
          {paymentStages.map((stage) => (
            <article
              className={`payment-stage payment-stage-${stage.status}`}
              key={`${stage.order}-${stage.label}`}
            >
              <div className="payment-stage-head">
                <span className="payment-stage-order">
                  {String(stage.order).padStart(2, "0")}
                </span>
                <span className="payment-stage-status">
                  {formatStageState(stage.status)}
                </span>
              </div>
              <strong>{stage.label}</strong>
              <p>{stage.detail}</p>
              <span className="payment-stage-amount">{stage.amount}</span>
            </article>
          ))}
        </div>

        <div className="quote-meta">
          <article className="quote-card">
            <span>Objective</span>
            <strong>{currentSession?.objectiveSummary ?? activeWorkflow.title}</strong>
          </article>
          <article className="quote-card">
            <span>Trace ID</span>
            <strong>{currentSession?.traceId ?? "Awaiting quote"}</strong>
          </article>
          <article className="quote-card">
            <span>Rail mix</span>
            <strong>{liveWorkflow.route}</strong>
          </article>
        </div>

        <div className="metric-grid">
          {(isSettled ? run.metrics : liveWorkflow.metrics).map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        {isSettled ? (
          <div className="result-artifact">
            <div className="result-artifact-head">
              <span className="eyebrow">Output artifact</span>
              <span className="status-pill">Ready to copy</span>
            </div>
            <div className="deliverable-grid">
              {resultDeliverables.map((deliverable) => (
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
            <div className="result-highlights">
              {run.artifact.highlights.map((item) => (
                <span className="result-chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="deliverable-grid">
            {resultDeliverables.map((deliverable) => (
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
        )}
      </section>
    </div>
  );
}
