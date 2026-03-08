import { createSignal } from "solid-js";

const THEME_KEY = "aura-theme";

export function useDarkMode() {
  const getInitial = () => {
    if (typeof document === "undefined") return false;
    const stored = localStorage.getItem(THEME_KEY);
    const isDark =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    return isDark;
  };
  const [dark, setDark] = createSignal(getInitial());

  const toggle = () => {
    const next = !dark();
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch (_) {}
  };
  return { dark, toggle };
}
