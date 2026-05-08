"use client";
import { useEffect, useState } from "react";

const THEMES = [
  { id: "ember",  color: "#ec5615", label: "Ember"  },
  { id: "ocean",  color: "#38bdf8", label: "Ocean"  },
  { id: "forest", color: "#22c55e", label: "Forest" },
  { id: "violet", color: "#a78bfa", label: "Violet" },
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState("ember");

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "ember";
    setActive(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function apply(id: string) {
    setActive(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("theme", id);
  }

  return (
    <div className="theme-switcher">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-dot${active === t.id ? " theme-dot--active" : ""}`}
          style={{ background: t.color }}
          title={t.label}
          onClick={() => apply(t.id)}
        />
      ))}
    </div>
  );
}
