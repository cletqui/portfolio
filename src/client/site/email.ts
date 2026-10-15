import { decodeEmail } from "../../data/email-codec";

export const initEmail = (): void => {
  for (const node of document.querySelectorAll<HTMLElement>("[data-email]")) {
    let address: string;
    try {
      address = decodeEmail(node.dataset.email ?? "");
    } catch {
      continue;
    }
    if (node instanceof HTMLAnchorElement) node.href = `mailto:${address}`;
    if (node.dataset.emailText !== undefined) node.textContent = node.dataset.emailText.replace("{}", address);
  }
};
