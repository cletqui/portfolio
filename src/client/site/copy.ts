import { decodeEmail } from "../../data/email-codec";

const textToCopy = (button: Element): string => {
  const enc = button.getAttribute("data-copy-email");
  if (!enc) return button.getAttribute("data-copy") ?? "";
  try {
    return decodeEmail(enc);
  } catch {
    return "";
  }
};

export const initCopyButtons = (): void => {
  document.addEventListener("click", (e) => {
    const button = (e.target as Element | null)?.closest?.("[data-copy],[data-copy-email]");
    if (!button || !navigator.clipboard) return;
    const label = button.querySelector("span");
    const original = label?.textContent ?? "";
    void navigator.clipboard.writeText(textToCopy(button)).then(() => {
      if (!label) return;
      label.textContent = button.getAttribute("data-copied") ?? "Copied!";
      setTimeout(() => (label.textContent = original), 1500);
    }, () => undefined);
  });
};
