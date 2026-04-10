"use client";

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
    document.querySelector(".topbar")?.classList.toggle("open", !isOpen);
  };

  const closeNav = () => {
    setIsOpen(false);
    document.querySelector(".topbar")?.classList.remove("open");
  };

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="AgentRail home" onClick={closeNav}>
        <img src="/logo-small.png" alt="AgentRail" className="brand-logo" width="44" height="44" />
        <span className="brand-copy">
          <strong>AgentRail</strong>
          <small>Paid agents on Stellar</small>
        </span>
      </a>

      <button className="nav-toggle" aria-label="Toggle navigation" aria-expanded={isOpen} onClick={toggleNav}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      <nav className="nav" aria-label="Primary">
        <a href="#product" onClick={closeNav}>Product</a>
        <a href="#rails" onClick={closeNav}>Rails</a>
        <a href="#workflow" onClick={closeNav}>Workflow</a>
        <a href="#ship" onClick={closeNav}>Ship</a>
      </nav>

      <a className="button button-ghost nav-cta" href="#workflow" onClick={closeNav}>
        Open demo
      </a>
    </header>
  );
}
