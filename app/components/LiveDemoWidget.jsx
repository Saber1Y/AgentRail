"use client";

import { useState, useEffect } from "react";

const DEMO_STEPS = [
  { rail: "x402", label: "Unlock data", amount: "0.05 XLM", status: "pending" },
  { rail: "MPP", label: "Agent session", amount: "0.50 XLM", status: "pending" },
  { rail: "Stellar", label: "Settle receipt", amount: "0.01 XLM", status: "pending" },
];

const DEMO_RESULTS = [
  "Fetching lead data...",
  "Running AI analysis...",
  "Compiling results...",
  "Payment confirmed!",
];

export default function LiveDemoWidget() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (!isRunning) return;
    
    if (step < DEMO_STEPS.length) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (step === DEMO_STEPS.length && !isComplete) {
      const timer = setTimeout(() => {
        setIsComplete(true);
        setTxHash(`demo_${Date.now().toString(36)}`);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isRunning, step, isComplete]);

  function handleRun() {
    setIsRunning(true);
    setStep(0);
    setIsComplete(false);
    setTxHash("");
  }

  function handleReset() {
    setIsRunning(false);
    setStep(0);
    setIsComplete(false);
    setTxHash("");
  }

  return (
    <div className="demo-widget">
      <div className="demo-header">
        <span className="demo-label">Live Demo</span>
        <span className={`demo-status ${isRunning ? "running" : ""} ${isComplete ? "complete" : ""}`}>
          {isComplete ? "Settled" : isRunning ? "Running..." : "Ready"}
        </span>
      </div>

      <div className="demo-steps">
        {DEMO_STEPS.map((s, i) => (
          <div 
            key={s.rail} 
            className={`demo-step ${step > i ? "active" : ""} ${step === i + 1 ? "current" : ""}`}
          >
            <span className="demo-rail">{s.rail}</span>
            <span className="demo-step-label">{s.label}</span>
            <span className="demo-amount">{s.amount}</span>
            <div className={`demo-indicator ${step > i ? "done" : ""}`}>
              {step > i ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>

      {isRunning && !isComplete && (
        <div className="demo-log">
          <span className="demo-log-text">{DEMO_RESULTS[Math.min(step, DEMO_RESULTS.length - 1)]}</span>
        </div>
      )}

      {isComplete && (
        <div className="demo-result">
          <div className="demo-tx">
            <span className="demo-tx-label">Settled on Stellar</span>
            <span className="demo-tx-hash">{txHash.slice(0, 20)}...</span>
          </div>
          <div className="demo-summary">
            <span>5 leads found</span>
            <span>3 buying signals</span>
          </div>
        </div>
      )}

      <div className="demo-actions">
        {!isRunning && !isComplete && (
          <button className="demo-button" onClick={handleRun}>
            Run Demo
          </button>
        )}
        {isComplete && (
          <button className="demo-button demo-reset" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
