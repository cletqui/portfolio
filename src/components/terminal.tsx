import { CHALLENGES, CHALLENGE_COUNT, TOTAL_POINTS } from "../data/challenges";
import { contacts } from "../pages/contact";
import { projects } from "../pages/projects";
import { EMAIL_ENC } from "../data/email";
import { asset } from "../utils/assets";
import { plainCard } from "../utils/card";
import { PGP } from "../utils/pgp";

export const shellData = (lang: string) => ({
  lang,
  projects: projects.map((p) => ({
    id: p.id,
    name: p.name,
    desc: lang === "fr" ? p.descriptionFr : p.description,
    url: p.href ?? `https://www.cybai.re${p.internal}`,
    page: p.internal ?? `/projects/${p.id}`,
    github: p.github,
  })),
  contacts: contacts.map((c) => ({
    name: lang === "fr" && c.nameFr ? c.nameFr : c.name,
    href: c.href,
    ...(c.email ? { email: true } : {}),
  })),
  ctf: CHALLENGES.map((ch) => ({
    id: ch.id,
    name: lang === "fr" ? ch.nameFr : ch.name,
    category: ch.category,
    points: ch.points,
    difficulty: ch.difficulty,
    hint: lang === "fr" ? ch.hintFr : ch.hint,
  })),
  games: asset("/static/shell-games.js"),
  pgp: PGP.fingerprint,
  pgpId: PGP.keyId,
  email: EMAIL_ENC,
  challenges: CHALLENGE_COUNT,
  points: TOTAL_POINTS,
  card: plainCard(lang),
});

const WindowButton = ({
  id,
  color,
  label,
}: {
  id: string;
  color: string;
  label: string;
}) => (
  <button
    type="button"
    id={id}
    class={`h-3 w-3 rounded-full transition-colors ${color}`}
    title={label}
    aria-label={label}
  />
);

export const Terminal = ({ lang }: { lang: string }) => {
  const fr = lang === "fr";
  const data = JSON.stringify(shellData(lang)).replace(/</g, "\\u003c");
  return (
    <div class="w-full space-y-3">
      <div id="shell-slot">
        <div
          id="shell"
          class="rounded-lg border border-border bg-muted/40 font-mono text-sm shadow-sm cursor-text"
        >
          <div
            id="shell-titlebar"
            class="flex items-center gap-1.5 border-b border-border px-3 py-2 select-none"
          >
            <WindowButton
              id="shell-close"
              color="bg-red-500/80 hover:bg-red-500"
              label={fr ? "Fermer" : "Close"}
            />
            <WindowButton
              id="shell-minimize"
              color="bg-yellow-400/80 hover:bg-yellow-400"
              label={fr ? "Réduire" : "Minimise"}
            />
            <WindowButton
              id="shell-maximize"
              color="bg-green-500/80 hover:bg-green-500"
              label={fr ? "Plein écran" : "Fullscreen"}
            />
            <span class="ml-2 text-xs text-muted-foreground">
              guest@cybai.re
            </span>
          </div>
          <div
            id="shell-screen"
            class="no-scrollbar h-[26rem] overflow-y-auto px-4 pt-3 space-y-0.5"
            aria-live="polite"
          >
            <noscript>
              <p class="text-muted-foreground">
                {fr
                  ? "Ce terminal a besoin de JavaScript. Utilise la navigation en haut de page."
                  : "This terminal needs JavaScript. Use the navigation at the top of the page."}
              </p>
            </noscript>
          </div>
          <form id="shell-form" class="flex gap-2 px-4 pb-3 pt-0.5">
            <label
              for="shell-input"
              id="shell-prompt"
              class="text-green-500 shrink-0 select-none"
            >
              guest@cybai.re:~$
            </label>
            <input
              id="shell-input"
              type="text"
              class="flex-1 min-w-0 bg-transparent outline-none"
              name="shell-input"
              autocomplete="off"
              autocapitalize="off"
              data-bwignore="true"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              spellcheck={false}
              aria-label="terminal"
            />
          </form>
        </div>
      </div>
      <script
        type="application/json"
        id="shell-data"
        dangerouslySetInnerHTML={{ __html: data }}
      />
      <script src={asset("/static/shell.js")} defer />
    </div>
  );
};
