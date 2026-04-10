"use client";

import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    icon: "📝",
    title: "Describe Task",
    description: "User inputs their objective or task",
  },
  {
    icon: "💳",
    title: "Payment",
    description: "x402 or MPP unlocks required tools",
  },
  {
    icon: "🤖",
    title: "AI Executes",
    description: "Agent performs the work",
  },
  {
    icon: "✅",
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
            <>
              <div
                key={i}
                className={`how-node ${activeStep >= i ? "lit" : ""}`}
              >
                {step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`how-connector ${activeStep > i ? "lit" : ""}`}
                />
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
