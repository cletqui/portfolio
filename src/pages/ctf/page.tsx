import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import type { Env } from "../..";
import { Title } from "../../components/layout";
import { CATEGORIES, CHALLENGES, CHALLENGE_COUNT, DIFFICULTIES, TOTAL_POINTS, type Challenge, type Difficulty } from "../../data/challenges";
import { asset } from "../../utils/assets";
import { FLAGS } from "../../utils/flags";
import { Icon } from "../../utils/icons";
import { nonce } from "../../utils/security";

const DIFF_LABEL: Record<Difficulty, [string, string]> = {
  easy: ["easy", "facile"],
  medium: ["medium", "moyen"],
  hard: ["hard", "difficile"],
};

const ChallengeCard = ({
  id,
  name,
  nameFr,
  category,
  points,
  difficulty,
  hint,
  hintFr,
  lang,
}: Challenge & { lang: string }) => (
  <div
    class="card flex flex-col gap-3"
    data-challenge={id}
    data-category={category}
    data-difficulty={difficulty}
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h3 class="font-semibold">{lang === "fr" ? nameFr : name}</h3>
          <span class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">
            {category}
          </span>
        </div>
        <p class="text-xs text-muted-foreground leading-relaxed">
          {lang === "fr" ? hintFr : hint}
        </p>
      </div>
      <div class="shrink-0 text-right">
        <div class="text-lg font-bold font-mono tabular-nums">{points}</div>
        <div class="text-xs text-muted-foreground">pts</div>
      </div>
    </div>
    <div class="flex items-center justify-between pt-1 border-t border-border">
      <span
        class={`text-xs px-2 py-0.5 rounded-full font-medium ${
          difficulty === "easy"
            ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950"
            : difficulty === "medium"
              ? "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-950"
              : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950"
        }`}
      >
        {DIFF_LABEL[difficulty][lang === "fr" ? 1 : 0]}
      </span>
      <span class="challenge-status text-xs text-muted-foreground">
        {lang === "fr" ? "🔒 Non résolu" : "🔒 Unsolved"}
      </span>
    </div>
  </div>
);

const page = new Hono<Env>();

page.get("/", (c) => {
  const { lang } = c.var;
  setCookie(c, "ctf_token", btoa(FLAGS.cookie), {
    path: "/ctf",
    secure: true,
    sameSite: "Strict",
    maxAge: 86400,
  });
  const n = nonce(c);
  return c.render(
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "Défis CTF" : "CTF Challenges"}</Title>
        <p class="text-muted-foreground text-center max-w-xl">
          {lang === "fr"
            ? "Des drapeaux sont cachés dans ce site. Trouvez-les, soumettez-les, accumulez des points."
            : "Flags are hidden throughout this site. Find them, submit them, rack up points."}
        </p>
      </div>

      <div class="card-primary flex flex-col mb-6 p-4 gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div>
              <div
                class="text-3xl font-bold font-mono tabular-nums"
                id="ctf-score"
              >
                0
              </div>
              <div class="text-xs text-primary-foreground/60">
                {lang === "fr" ? "points" : "points"}
              </div>
            </div>
            <div class="w-px h-10 bg-primary-foreground/30" />
            <div>
              <div
                class="text-xl font-semibold font-mono"
                id="ctf-count"
                data-total={CHALLENGE_COUNT}
              >
                0/{CHALLENGE_COUNT}
              </div>
              <div class="text-xs text-primary-foreground/60">
                {lang === "fr" ? "drapeaux trouvés" : "flags found"}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-primary-foreground/60 mb-0.5">
              {lang === "fr" ? "Maximum" : "Maximum"}
            </div>
            <div class="text-lg font-bold font-mono tabular-nums">
              {TOTAL_POINTS} pts
            </div>
          </div>
        </div>
        <div class="h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
          <div
            id="ctf-progress"
            class="h-full bg-green-500 rounded-full transition-all duration-500"
            style="width:0%"
          />
        </div>
      </div>

      <div class="max-w-lg mx-auto mb-8">
        <form id="ctf-form" class="flex gap-2">
          <input
            id="ctf-input"
            type="text"
            placeholder="cybai{...}"
            name="flag"
            autocomplete="off"
            data-bwignore="true"
            data-lpignore="true"
            data-1p-ignore="true"
            spellcheck={false}
            class="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <button id="ctf-btn" type="submit" class="btn btn-primary shrink-0">
            {lang === "fr" ? "Soumettre" : "Submit"}
          </button>
        </form>
        <div id="ctf-result" style="display:none" />
        <div class="mt-3 text-center">
          <button
            id="ctf-reset"
            type="button"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === "fr" ? "Réinitialiser la progression" : "Reset progress"}
          </button>
        </div>
      </div>

      <div class="card mb-6 space-y-3 p-4">
        <div class="flex items-center gap-2">
          <Icon name="list-filter" size={14} class="text-muted-foreground" />
          <h2 class="text-sm font-semibold">
            {lang === "fr" ? "Filtrer les défis" : "Filter challenges"}
          </h2>
          <span
            id="ctf-filter-count"
            class="font-mono text-xs text-muted-foreground"
          >
            {`${CHALLENGE_COUNT} / ${CHALLENGE_COUNT}`}
          </span>
          <button
            id="ctf-clear"
            type="button"
            class="ml-auto hidden text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {lang === "fr" ? "effacer les filtres" : "clear filters"}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono uppercase tracking-wider text-muted-foreground w-24 shrink-0">
            {lang === "fr" ? "type :" : "type:"}
          </span>
          <div class="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                data-filter="category"
                data-value={c}
                type="button"
                class="text-xs px-2.5 py-1 rounded-md font-mono cursor-pointer transition-colors border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50"
              >
                {c.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono uppercase tracking-wider text-muted-foreground w-24 shrink-0">
            {lang === "fr" ? "difficulté :" : "difficulty:"}
          </span>
          <div class="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                data-filter="difficulty"
                data-value={d}
                type="button"
                class="text-xs px-2.5 py-1 rounded-md font-mono cursor-pointer transition-colors border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50"
              >
                {DIFF_LABEL[d][lang === "fr" ? 1 : 0]}
              </button>
            ))}
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono uppercase tracking-wider text-muted-foreground w-24 shrink-0">
            {lang === "fr" ? "statut :" : "status:"}
          </span>
          <div class="flex flex-wrap gap-1.5">
            {(["unsolved", "solved"] as const).map((s) => (
              <button
                data-filter="status"
                data-value={s}
                type="button"
                class="text-xs px-2.5 py-1 rounded-md font-mono cursor-pointer transition-colors border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50"
              >
                {s === "solved"
                  ? lang === "fr"
                    ? "résolu"
                    : "solved"
                  : lang === "fr"
                    ? "non résolu"
                    : "unsolved"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CHALLENGES.map((ch) => (
          <ChallengeCard {...ch} lang={lang} />
        ))}
      </div>

      <script
        nonce={n}
        dangerouslySetInnerHTML={{
          __html: `(function(){try{console.log('%c cybai{C0ns0l3C0wB0y} ','background:#22c55e;color:#000;font-weight:bold;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:14px');console.log('%c\\u2514 you opened devtools on a ctf page, nice move','color:#6b7280;font-family:monospace;font-size:12px')}catch(e){}})();`,
        }}
      />
      <script src={asset("/static/ctf.js")} defer />
    </div>,
    {
      title: lang === "fr" ? "Défis CTF" : "CTF Challenges",
      description:
        lang === "fr"
          ? `${CHALLENGE_COUNT} défis cachés dans ce site, ${TOTAL_POINTS} points au total.`
          : `${CHALLENGE_COUNT} challenges hidden across this site, ${TOTAL_POINTS} points total.`,
    },
  );
});

export default page;
