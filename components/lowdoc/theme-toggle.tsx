"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const cur = document.documentElement.dataset.theme;
    if (cur === "dark" || cur === "light") setTheme(cur);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ld-theme", next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  };

  return (
<button
        type="button"
        className="ld-btn ld-btn-ghost !border !px-2"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={theme === "dark" ? "Tema terang" : "Tema gelap"}
      >
        {theme === "dark" ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
      </button>
  );
}
