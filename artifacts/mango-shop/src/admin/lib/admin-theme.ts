export const ADMIN_THEME_KEY = "aamras_admin_theme";

export function getInitialAdminTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(ADMIN_THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

export function applyAdminTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem(ADMIN_THEME_KEY, theme);
}
