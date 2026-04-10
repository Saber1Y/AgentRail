"use client";

import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5z"/>
      </svg>
    ),
    title: "Describe Task",
    description: "User inputs their objective or task",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    title: "Payment",
    description: "x402 or MPP unlocks required tools",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    title: "AI Executes",
    description: "Agent performs the work",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
    ),
    title: "Settlement",
    description: "Receipt anchored on Stellar",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="how-it-works" ref={ref}>
      <div className="how-steps">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`how-step ${activeStep === i ? "active" : ""}`}
          >
            <div className="how-icon">{step.icon}</div>
            <div className="how-content">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="how-visual">
        <div className="how-flow">
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div
                className={`how-node ${activeStep >= i ? "lit" : ""}`}
              >
                {step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`how-connector ${activeStep > i ? "lit" : ""}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
