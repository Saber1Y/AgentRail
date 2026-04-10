"use client";

import { useState, useEffect, useRef } from "react";

const COUNTERS = [
  { label: "Payments Settled", value: 1247, suffix: "+" },
  { label: "Agents Powered", value: 89, suffix: "" },
  { label: "XLM Volume", value: 342, prefix: "$", suffix: "" },
  { label: "Avg Task Time", value: 24, suffix: "s" },
];

function AnimatedCounter({ target, prefix = "", suffix = "", isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <span className="counter-value">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsCounter() {
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

  return (
    <div className="stats-counter" ref={ref}>
      {COUNTERS.map((stat) => (
        <div key={stat.label} className="stat-item">
          <AnimatedCounter
            target={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            isVisible={isVisible}
          />
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
