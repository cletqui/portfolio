import { el, mount } from "../shared/dom";

export const showToast = (title: string, body: string, ms = 15000): HTMLElement => {
  const box = el(
    "div",
    "fixed bottom-4 right-4 z-[120] max-w-sm rounded-md border border-border bg-card p-4 shadow-lg font-mono text-sm space-y-1",
  );
  box.setAttribute("role", "status");
  mount(box, el("div", "font-semibold", title), el("div", "text-green-500 break-all", body));
  box.addEventListener("click", () => box.remove());
  document.body.appendChild(box);
  setTimeout(() => box.remove(), ms);
  return box;
};
