"use client";

import { useEffect, useState } from "react";
import { defaultWorkflowKey, workflowCases } from "../lib/workflows";
import ToastContainer from "./Toast";

const historyStorageKey = "agentrail:quote-history";
const maxHistoryItems = 6;

function Skeleton({ width = "100%", height = "20px", rounded = false }) {
  return (
    <div
      className={`skeleton ${rounded ? "skeleton-rounded" : ""}`}
      style={{ width, height }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton width="40%" height="16px" />
      <Skeleton width="80%" height="24px" />
      <Skeleton width="100%" height="14px" />
      <Skeleton width="60%" height="14px" />
    </div>
  );
}

function getWorkflow(key) {
  return workflowCases.find((item) => item.key === key) ?? workflowCases[0];
}

function getDefaultDeliverables(key) {
  const defaults = {
    prospecting: [
      { title: "Lead Shortlist", items: ["Company 1", "Company 2", "Company 3"] },
      { title: "Buying Signals", items: ["Signal 1", "Signal 2"] },
      { title: "Next Actions", items: ["Action 1", "Action 2"] },
    ],
    procurement: [
      { title: "Vendor Shortlist", items: ["Vendor 1", "Vendor 2"] },
      { title: "Risk Analysis", items: ["Risk 1", "Risk 2"] },
      { title: "Decision Factors", items: ["Factor 1", "Factor 2"] },
    ],
    travel: [
      { title: "Route Options", items: ["Option 1", "Option 2"] },
      { title: "Key Considerations", items: ["Consideration 1"] },
      { title: "Recommendation", items: ["Recommendation 1"] },
    ],
  };
  return defaults[key] || defaults.prospecting;
}

function getDefaultMetrics(session, workflow) {
  if (session?.totalCost) {
    return [
      { label: "Spend", value: session.totalCost },
      { label: "Status", value: session.status === "settled" ? "Complete" : "Pending" },
      { label: "Confidence", value: session.status === "settled" ? "95%" : "—" },
    ];
  }
  return [
    { label: "Est. Spend", value: "~0.50 XLM" },
    { label: "Est. Time", value: "~2-5 min" },
    { label: "Confidence", value: "—" },
  ];
}

function buildPreviewPaymentStages(workflow) {
  if (workflow.paymentTiers) {
    return workflow.paymentTiers.map((tier, index) => ({
      rail: tier.rail,
      label: tier.purpose,
      amount: `${tier.amount} XLM`,
      detail: `Payment for ${tier.rail} operation`,
      order: index + 1,
      status: index === 0 ? "ready" : "queued",
    }));
  }
  
  if (workflow.steps) {
    return workflow.steps.map((step, index) => ({
      rail: step.rail,
      label: step.title,
      amount: step.amount,
      detail: step.detail,
      order: index + 1,
      status: index === 0 ? "ready" : "queued",
    }));
  }
  
  return [];
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

function buildReceiptSnapshot(session, workflow, isSettled) {
  if (!session) {
    return null;
  }

  const deliverables = isSettled
    ? session.artifact?.deliverables ?? []
    : currentSession?.deliverablesPreview ?? getDefaultDeliverables(workflow.key);
  const highlights = isSettled ? session.artifact?.highlights ?? [] : [];

  return {
    workflowKey: session.workflowKey ?? workflow.key,
    workflowLabel: session.workflowLabel ?? workflow.label,
    receipt: session.receipt ?? workflow.receipt,
    objective: session.objective ?? workflow.title,
    objectiveSummary: session.objectiveSummary ?? workflow.title,
    traceId: session.traceId,
    status: session.status ?? (isSettled ? "settled" : "quoted"),
    route: session.route ?? workflow.route,
    generatedAt: session.generatedAt ?? null,
    settledAt: session.settledAt ?? null,
    runId: session.runId ?? null,
    settlementId: session.settlementId ?? null,
    runSummary: session.runSummary ?? null,
    metrics: session.metrics ?? workflow.metrics,
    paymentStages: session.paymentStages ?? buildPreviewPaymentStages(workflow),
    highlights,
    deliverables,
  };
}

function buildReceiptSummary(snapshot) {
  if (!snapshot) {
    return "";
  }

  const lines = [
    "AgentRail receipt",
    `Workflow: ${snapshot.workflowLabel}`,
    `Objective: ${snapshot.objectiveSummary}`,
    `Trace ID: ${snapshot.traceId}`,
    `Receipt: ${snapshot.receipt}`,
    `Rail mix: ${snapshot.route}`,
    `Status: ${snapshot.status}`,
  ];

  if (snapshot.runId) {
    lines.push(`Run ID: ${snapshot.runId}`);
  }

  if (snapshot.settlementId) {
    lines.push(`Settlement: ${snapshot.settlementId}`);
  }

  if (snapshot.runSummary) {
    lines.push("");
    lines.push(snapshot.runSummary);
  }

  if (snapshot.highlights?.length) {
    lines.push("");
    lines.push("Highlights:");
    snapshot.highlights.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  lines.push("");
  lines.push("Deliverables:");
  snapshot.deliverables.forEach((deliverable) => {
    lines.push(`- ${deliverable.title}`);
    deliverable.items.forEach((item) => {
      lines.push(`  - ${item}`);
    });
  });

  return lines.join("\n");
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
  const [copyState, setCopyState] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = "success", duration = 4000) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

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
    setCopyState("");
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
    setCopyState("");
  }

  async function generateQuote() {
    const trimmedObjective = objective.trim();

    if (!trimmedObjective) {
      setError("Add a task so AgentRail can build a quote.");
      return;
    }

    setError("");
    setRunError("");
    setCopyState("");
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
      addToast("Quote generated successfully!", "success");
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
      addToast(message, "error");
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
    setCopyState("");
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

      const text = await response.text();
      
      if (!text || text.trim() === "") {
        throw new Error("Server returned empty response. Please try again.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server. Check console for details.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to start the paid run.");
      }

      setRun(data.run);
      setQuote(data.run);
      addToast("Payment settled on Stellar!", "success");
      
      if (data.run.receipt?.transactions?.[0]?.hash) {
        addToast("Transaction confirmed on blockchain", "info", 6000);
      }
      
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
      addToast(message, "error");
    } finally {
      setIsRunning(false);
    }
  }

  async function copyReceiptPayload(mode) {
    const snapshot = buildReceiptSnapshot(currentSession, liveWorkflow, isSettled);

    if (!snapshot) {
      setCopyState("Generate a quote first.");
      return;
    }

    const payload =
      mode === "json"
        ? JSON.stringify(snapshot, null, 2)
        : buildReceiptSummary(snapshot);

    try {
      await navigator.clipboard.writeText(payload);
      setCopyState(
        mode === "json" ? "Receipt JSON copied." : "Receipt summary copied."
      );
    } catch {
      setCopyState("Copy failed. Try again on localhost.");
    }
  }

  function clearHistory() {
    setHistory([]);

    try {
      window.localStorage.removeItem(historyStorageKey);
    } catch {
      // Ignore persistence failures in the demo shell.
    }

    setCopyState("History cleared.");
  }

  function handleSubmit(event) {
    event.preventDefault();

    void generateQuote();
  }

  async function shareResult() {
    if (!currentSession) {
      addToast("Generate a quote first", "error");
      return;
    }

    const shareData = {
      title: `AgentRail: ${currentSession.workflowLabel}`,
      text: `Check out my ${currentSession.workflowLabel} result!\nTrace: ${currentSession.traceId}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addToast("Shared successfully!", "success");
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${window.location.href}`
        );
        addToast("Copied to clipboard!", "success");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        addToast("Could not share", "error");
      }
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (currentSession && !isRunning && !isGenerating) {
          void startPaidRun();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "q") {
        e.preventDefault();
        if (!isGenerating) {
          void generateQuote();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        void copyReceiptPayload("json");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSession, isRunning, isGenerating]);

  const resultDeliverables =
    run?.artifact?.deliverables ?? currentSession?.deliverablesPreview ?? getDefaultDeliverables(activeKey);

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
          <strong>{currentSession?.traceId ?? liveWorkflow.key.toUpperCase()}</strong>
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
            The paid run uses x402 + MPP for payments, executes the AI agent,
            and anchors the receipt on Stellar testnet.
          </p>
        </div>

        <div className="receipt-actions" aria-label="Receipt actions">
          <button
            type="button"
            className="button button-soft"
            onClick={() => void copyReceiptPayload("summary")}
            disabled={!currentSession}
          >
            Copy summary
          </button>
          <button
            type="button"
            className="button button-soft"
            onClick={() => void copyReceiptPayload("json")}
            disabled={!currentSession}
          >
            Copy JSON
          </button>
          <button
            type="button"
            className="button button-soft"
            onClick={() => void shareResult()}
            disabled={!currentSession}
          >
            Share
          </button>
        </div>
        
        <div className="keyboard-hints">
          <span>⌘+Q: Quote</span>
          <span>⌘+Enter: Run</span>
          <span>⌘+K: Copy JSON</span>
        </div>

        {copyState ? <p className="copy-note">{copyState}</p> : null}

        {runError ? <p className="error-note">{runError}</p> : null}

        <section className="history-panel" aria-label="Recent receipts">
          <div className="history-header">
            <span className="eyebrow">Recent receipts</span>
            <div className="history-header-actions">
              <span className="history-count">{history.length}</span>
              <button
                type="button"
                className="button button-ghost history-clear"
                onClick={clearHistory}
                disabled={!history.length}
              >
                Clear
              </button>
            </div>
          </div>

          {history.length ? (
            <div className="history-list">
              {history.map((item, hIndex) => (
                <button
                  type="button"
                  className="history-item"
                  key={`${item.traceId}-${item.savedAt}-${hIndex}`}
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

        {isSettled && run.receipt?.transactions?.[0]?.hash ? (
          <div className="tx-banner">
            <span className="eyebrow">Stellar Transaction</span>
            <a 
              href={`https://horizon-testnet.stellar.org/transactions/${run.receipt.transactions[0].hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              {run.receipt.transactions[0].hash}
            </a>
            <span className="tx-verify">Verified on Stellar Horizon</span>
          </div>
        ) : null}

        <div className="payment-stepper">
          {isRunning ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Skeleton width="24px" height="24px" rounded />
                    <Skeleton width="60%" height="16px" />
                  </div>
                  <Skeleton width="80%" height="18px" />
                  <Skeleton width="100%" height="14px" />
                  <Skeleton width="40%" height="14px" />
                </div>
              ))}
            </>
          ) : (
            (paymentStages || []).map((stage) => (
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
            ))
          )}
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
          {getDefaultMetrics(currentSession, liveWorkflow).map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        {isRunning ? (
          <div className="deliverable-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-deliverable">
                <Skeleton width="50%" height="16px" />
                <div className="skeleton-list">
                  <Skeleton width="90%" height="14px" />
                  <Skeleton width="75%" height="14px" />
                  <Skeleton width="85%" height="14px" />
                </div>
              </div>
            ))}
          </div>
        ) : isSettled ? (
          <div className="result-artifact">
            <div className="result-artifact-head">
              <span className="eyebrow">Output artifact</span>
              <span className="status-pill">Ready to copy</span>
            </div>
            <div className="deliverable-grid">
              {resultDeliverables.map((deliverable, dIndex) => (
                <article className="deliverable-card" key={`${deliverable.title}-${dIndex}`}>
                  <span className="card-kicker">{deliverable.title}</span>
                  <ul>
                    {(deliverable.items || []).map((item, iIndex) => (
                      <li key={`${item}-${iIndex}`}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="result-highlights">
              {(run.artifact.highlights || []).map((item, hIndex) => (
                <span className="result-chip" key={`${item}-${hIndex}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="deliverable-grid">
            {resultDeliverables.map((deliverable, dIndex) => (
                <article className="deliverable-card" key={`${deliverable.title}-${dIndex}`}>
                  <span className="card-kicker">{deliverable.title}</span>
                  <ul>
                    {(deliverable.items || []).map((item, iIndex) => (
                      <li key={`${item}-${iIndex}`}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
