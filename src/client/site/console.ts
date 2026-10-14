import { CLIENT_FLAGS } from "../shared/flags";

export interface CybaiObject {
  name: string;
  role: string;
  site: string;
  help(): string;
  about(): string;
  links(): string[];
  ctf(): string;
  selfdestruct(): string;
}

export const createCybaiObject = (log: (...args: unknown[]) => void = console.log): CybaiObject => ({
  name: "cybai.re",
  role: "cybersecurity engineer, full-stack developer",
  site: "https://www.cybai.re",
  help: () => "about() · links() · ctf() · selfdestruct()",
  about: () => "I build things you can see and secure things you can't.",
  links: () => ["https://github.com/cletqui", "https://bsky.app/profile/cybai.re"],
  ctf: () => "flags look like cybai{...}. submit them at /ctf",
  selfdestruct: () => {
    log("3… 2… 1…");
    return CLIENT_FLAGS.jsobj;
  },
});

export const installConsoleObject = (): void => {
  try {
    Object.defineProperty(window, "cybai", { value: createCybaiObject() });
    console.log(
      "%c cybai.re %c psst… try cybai.help()",
      "background:#16a34a;color:#fff;border-radius:3px;padding:2px 6px;font-weight:bold",
      "color:#16a34a",
    );
  } catch {
    /* already defined */
  }
};
