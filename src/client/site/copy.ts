export const initCopyButtons = (): void => {
  document.addEventListener("click", (e) => {
    const button = (e.target as Element | null)?.closest?.("[data-copy]");
    if (!button || !navigator.clipboard) return;
    const label = button.querySelector("span");
    const original = label?.textContent ?? "";
    void navigator.clipboard.writeText(button.getAttribute("data-copy") ?? "").then(() => {
      if (!label) return;
      label.textContent = button.getAttribute("data-copied") ?? "Copied!";
      setTimeout(() => (label.textContent = original), 1500);
    }, () => undefined);
  });
};
