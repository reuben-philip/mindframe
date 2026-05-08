"use client";
import { useEffect, useState } from "react";

const THEMES = [
  { id: "yellow", color: "#eab308", label: "Yellow" },
  { id: "blue",   color: "#38bdf8", label: "Blue"   },
  { id: "purple", color: "#a78bfa", label: "Purple" },
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState("yellow");

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "yellow";
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
