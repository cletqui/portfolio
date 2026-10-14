export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export const byId = <T extends HTMLElement = HTMLElement>(
  id: string,
): T | null => document.getElementById(id) as T | null;

export const readJson = <T>(id: string, fallback: T): T => {
  try {
    const node = document.getElementById(id);
    return node ? { ...fallback, ...JSON.parse(node.textContent ?? "{}") } : fallback;
  } catch {
    return fallback;
  }
};

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const mount = <T extends Node>(parent: T, ...children: Node[]): T => {
  for (const child of children) parent.appendChild(child);
  return parent;
};
