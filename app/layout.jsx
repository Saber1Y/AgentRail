import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

export const metadata = {
  title: "AgentRail",
  description: "Paid-agent UI scaffold for Stellar agentic payments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="backdrop backdrop-a" aria-hidden="true" />
        <div className="backdrop backdrop-b" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
