export const isDark = (root: HTMLElement = document.documentElement): boolean =>
  root.classList.contains("dark") || (!root.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);

export const applyTheme = (next?: "dark" | "light"): "dark" | "light" => {
  const value = next ?? (isDark() ? "light" : "dark");
  document.documentElement.className = value;
  try {
    localStorage.setItem("theme", value);
  } catch {
    /* storage may be blocked */
  }
  return value;
};

export const initThemeToggle = (): void => {
  document.getElementById("theme-toggle")?.addEventListener("click", () => void applyTheme());
};
