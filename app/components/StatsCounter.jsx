"use client";

import { useState, useEffect, useRef } from "react";

const STATS_CONFIG = [
  { 
    label: "Payments Settled", 
    value: 1247, 
    suffix: "+",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    )
  },
  { 
    label: "Agents Powered", 
    value: 89, 
    suffix: "",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    )
  },
  { 
    label: "XLM Volume", 
    value: 342, 
    prefix: "$",
    suffix: "",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/>
        <path d="M12 6v2m0 8v2"/>
      </svg>
    )
  },
  { 
    label: "Avg Task Time", 
    value: 24, 
    suffix: "s",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    )
  },
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
      {STATS_CONFIG.map((stat) => (
        <div key={stat.label} className="stat-item">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">{stat.icon}</span>
          </div>
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
