"use client";

import { useEffect, useState } from "react";

export default function ToastNotification({ message, type = "success", duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${isVisible ? "toast-visible" : "toast-hidden"}`}>
      <div className="toast-icon">
        {type === "success" && <span>✓</span>}
        {type === "error" && <span>✕</span>}
        {type === "info" && <span>ℹ</span>}
        {type === "processing" && <span className="spinner">◌</span>}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => { setIsVisible(false); onClose(); }}>
        ✕
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
