import { Context, Hono } from "hono";
import { Bindings, Variables } from "..";
import { Title } from "../components/layout";
import { Icon } from "../utils/icons";

type Difficulty = "easy" | "medium" | "hard";

const CHALLENGES: {
  id: string;
  name: string;
  nameFr: string;
  category: string;
  points: number;
  difficulty: Difficulty;
  hint: string;
  hintFr: string;
}[] = [
  /* — easy — */
  {
    id: "source",
    name: "Source Inspector",
    nameFr: "Inspecteur de Source",
    category: "Web",
    points: 50,
    difficulty: "easy",
    hint: "Not everything rendered is everything there.",
    hintFr: "Tout ce qui est affiché n'est pas tout ce qui existe.",
  },
  {
    id: "console",
    name: "Console Cowboy",
    nameFr: "Cowboy de la Console",
    category: "Web",
    points: 50,
    difficulty: "easy",
    hint: "Some messages are only seen by those with the right tools open.",
    hintFr: "Certains messages ne sont vus que par ceux qui ont les bons outils ouverts.",
  },
  {
    id: "teapot",
    name: "RFC 2324",
    nameFr: "RFC 2324",
    category: "Web",
    points: 100,
    difficulty: "easy",
    hint: "A brewing error carries more than its status code.",
    hintFr: "Une erreur de brassage révèle plus que son code.",
  },
  {
    id: "hacker",
    name: "1337 Reviewer",
    nameFr: "Critique 1337",
    category: "Web",
    points: 75,
    difficulty: "easy",
    hint: "A visitor signed their name a little too boldly.",
    hintFr: "Un visiteur a signé son nom un peu trop audacieusement.",
  },
  {
    id: "manifest",
    name: "File Hunter",
    nameFr: "Chasseur de Fichiers",
    category: "Recon",
    points: 100,
    difficulty: "easy",
    hint: "Some paths announce themselves.",
    hintFr: "Certains chemins s'annoncent d'eux-mêmes.",
  },
  {
    id: "ctf-txt",
    name: "Raw Access",
    nameFr: "Accès Brut",
    category: "Recon",
    points: 75,
    difficulty: "easy",
    hint: "The most predictable paths are often the most rewarding.",
    hintFr: "Les chemins les plus prévisibles sont souvent les plus récompensés.",
  },
  {
    id: "humans",
    name: "We Are Humans",
    nameFr: "Nous Sommes Humains",
    category: "Recon",
    points: 75,
    difficulty: "easy",
    hint: "Behind every robot, there's its counterpart.",
    hintFr: "Derrière chaque robot, il y a son pendant.",
  },
  {
    id: "readme",
    name: "Hidden in Plain Sight",
    nameFr: "Caché en Pleine Vue",
    category: "Repo",
    points: 75,
    difficulty: "easy",
    hint: "Public repos hide in plain sight.",
    hintFr: "Les dépôts publics cachent en pleine vue.",
  },
  /* — medium — */
  {
    id: "security-txt",
    name: "RFC 9116",
    nameFr: "RFC 9116",
    category: "Recon",
    points: 125,
    difficulty: "medium",
    hint: "Responsible disclosure starts somewhere standard.",
    hintFr: "La divulgation responsable commence quelque part de standard.",
  },
  {
    id: "private",
    name: "Sensitive Disclosure",
    nameFr: "Divulgation Sensible",
    category: "Recon",
    points: 150,
    difficulty: "medium",
    hint: "The well-known path to the unknown.",
    hintFr: "Le chemin bien connu vers l'inconnu.",
  },
  {
    id: "options",
    name: "Allowed Methods",
    nameFr: "Méthodes Autorisées",
    category: "Web",
    points: 150,
    difficulty: "medium",
    hint: "Ask before you act.",
    hintFr: "Demandez avant d'agir.",
  },
  {
    id: "dns",
    name: "DNS Detective",
    nameFr: "Détective DNS",
    category: "Recon",
    points: 175,
    difficulty: "medium",
    hint: "Every domain has a story in its zones.",
    hintFr: "Chaque domaine a une histoire dans ses zones.",
  },
  {
    id: "french",
    name: "Cocorico",
    nameFr: "Cocorico",
    category: "OSINT",
    points: 200,
    difficulty: "medium",
    hint: "Certains secrets ne sont révélés qu'aux visiteurs francophones.",
    hintFr: "Certains secrets ne sont révélés qu'aux visiteurs francophones.",
  },
  /* — hard — */
  {
    id: "curl",
    name: "Terminal Purist",
    nameFr: "Puriste du Terminal",
    category: "Web",
    points: 175,
    difficulty: "hard",
    hint: "The terminal knows things the browser doesn't.",
    hintFr: "Le terminal sait des choses que le navigateur ignore.",
  },
  {
    id: "header",
    name: "Header Spy",
    nameFr: "Espion d'En-Tête",
    category: "Web",
    points: 250,
    difficulty: "hard",
    hint: "Read between the lines — or above them.",
    hintFr: "Lisez entre les lignes — ou au-dessus d'elles.",
  },
];

const TOTAL_POINTS = CHALLENGES.reduce((s, c) => s + c.points, 0);
const CHALLENGE_COUNT = CHALLENGES.length;
const CATEGORIES = [...new Set(CHALLENGES.map((c) => c.category))];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const DIFF_LABEL: Record<Difficulty, [string, string]> = {
  easy:   ["easy",   "facile"],
  medium: ["medium", "moyen"],
  hard:   ["hard",   "difficile"],
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
}: (typeof CHALLENGES)[0] & { lang: string }) => (
  <div class="card flex flex-col gap-3" data-challenge={id} data-category={category} data-difficulty={difficulty}>
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h3 class="font-semibold">{lang === "fr" ? nameFr : name}</h3>
          <span class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">
            {category}
          </span>
        </div>
        <p class="text-xs text-muted-foreground leading-relaxed">{lang === "fr" ? hintFr : hint}</p>
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

const ctfScript = (lang: string) => `(function(){
  var KEY='ctf_found';
  var N=${CHALLENGE_COUNT};
  var T_SOLVED='${lang === "fr" ? "\u2713 R\u00e9solu" : "\u2713 Solved"}';
  var T_ALREADY='${lang === "fr" ? "Vous avez d\u00e9j\u00e0 trouv\u00e9 ce drapeau !" : "You already found this flag!"}';
  var T_INVALID='${lang === "fr" ? "Drapeau invalide. Continuez !" : "Invalid flag. Keep looking!"}';
  var T_ERROR='${lang === "fr" ? "\u00c9chec de la soumission. R\u00e9essayez." : "Submission failed. Try again."}';
  var T_RESET_CONFIRM='${lang === "fr" ? "R\u00e9initialiser la progression ?" : "Reset all progress?"}';
  var T_RESET_DONE='${lang === "fr" ? "Progression r\u00e9initialis\u00e9e." : "Progress reset."}';
  var T_CHECKING='${lang === "fr" ? "V\u00e9rification\u2026" : "Checking\u2026"}';
  var T_SUBMIT='${lang === "fr" ? "Soumettre" : "Submit"}';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function render(){
    var found=load();
    var total=0,count=0;
    for(var id in found){total+=found[id].points;count++}
    var el=document.getElementById('ctf-score');if(el)el.textContent=total;
    var cl=document.getElementById('ctf-count');if(cl)cl.textContent=count+'/'+N;
    var prog=document.getElementById('ctf-progress');if(prog)prog.style.width=(N>0?Math.round(count/N*100):0)+'%';
    document.querySelectorAll('[data-challenge]').forEach(function(card){
      var id=card.getAttribute('data-challenge');
      var badge=card.querySelector('.challenge-status');
      if(found[id]){
        card.style.outline='1px solid #22c55e';
        card.style.opacity='0.5';
        card.style.order='1';
        if(badge){badge.textContent=T_SOLVED;badge.style.color='#22c55e'}
      }else{
        card.style.outline='';
        card.style.opacity='';
        card.style.order='';
      }
    });
    document.dispatchEvent(new CustomEvent('ctf:render'));
  }
  function flash(msg,type){
    var el=document.getElementById('ctf-result');
    if(!el)return;
    el.textContent=msg;
    el.style.display='block';
    el.className='mt-2 text-sm px-3 py-2 rounded-md '+(type==='success'?'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':type==='error'?'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':'bg-muted text-muted-foreground');
    setTimeout(function(){el.style.display='none'},4000)
  }
  document.addEventListener('DOMContentLoaded',function(){
    render();
    var form=document.getElementById('ctf-form');
    var input=document.getElementById('ctf-input');
    var btn=document.getElementById('ctf-btn');
    if(!form||!input||!btn)return;
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      var flag=input.value.trim();
      if(!flag)return;
      var found=load();
      for(var id in found){if(found[id].flag===flag){flash(T_ALREADY,'info');return}}
      btn.disabled=true;btn.textContent=T_CHECKING;
      try{
        var r=await fetch('/ctf/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({flag:flag})});
        var data=await r.json();
        if(data.valid){
          found[data.id]={flag:flag,points:data.points,name:data.name};
          save(found);render();
          flash('+'+data.points+' pts \u2014 '+data.name+'!','success');
          input.value='';
        }else{
          flash(T_INVALID,'error')
        }
      }catch(err){
        flash(T_ERROR,'error')
      }
      btn.disabled=false;btn.textContent=T_SUBMIT
    });
    var reset=document.getElementById('ctf-reset');
    if(reset){reset.addEventListener('click',function(){
      if(confirm(T_RESET_CONFIRM)){localStorage.removeItem(KEY);render();flash(T_RESET_DONE,'info')}
    })}
  })
})()`;

const filterScript = `(function(){
  var cat='',diff='',status='';
  var BASE='text-xs px-2 py-0.5 rounded font-mono cursor-pointer transition-colors border ';
  var ON=BASE+'border-foreground bg-foreground text-background';
  var OFF=BASE+'border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/50';
  function getSolved(){try{return JSON.parse(localStorage.getItem('ctf_found')||'{}')}catch(e){return{}}}
  function applyFilter(){
    var found=status?getSolved():null;
    document.querySelectorAll('[data-challenge]').forEach(function(c){
      var showCat=!cat||c.dataset.category===cat;
      var showDiff=!diff||c.dataset.difficulty===diff;
      var solved=found?!!found[c.dataset.challenge]:false;
      var showStatus=!status||(status==='solved'?solved:!solved);
      c.style.display=(showCat&&showDiff&&showStatus)?'':'none';
    });
  }
  function refresh(){
    document.querySelectorAll('[data-filter="category"]').forEach(function(b){b.className=b.dataset.value===cat?ON:OFF});
    document.querySelectorAll('[data-filter="difficulty"]').forEach(function(b){b.className=b.dataset.value===diff?ON:OFF});
    document.querySelectorAll('[data-filter="status"]').forEach(function(b){b.className=b.dataset.value===status?ON:OFF});
  }
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('[data-filter]').forEach(function(b){
      b.addEventListener('click',function(){
        if(b.dataset.filter==='category'){cat=cat===b.dataset.value?'':b.dataset.value}
        else if(b.dataset.filter==='difficulty'){diff=diff===b.dataset.value?'':b.dataset.value}
        else{status=status===b.dataset.value?'':b.dataset.value}
        applyFilter();refresh();
      });
    });
    refresh();
  });
  document.addEventListener('ctf:render',function(){applyFilter();refresh()});
})()`;

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* ENDPOINTS */
app.post("/submit", async (c) => {
  const { CTF_FLAGS } = c.env;
  if (!CTF_FLAGS) return c.json({ error: "CTF not configured" }, 503);

  const body = await c.req.json<{ flag?: string }>();
  if (!body?.flag) return c.json({ valid: false });

  const raw = await CTF_FLAGS.get(body.flag.trim());
  if (!raw) return c.json({ valid: false });

  return c.json({ valid: true, ...JSON.parse(raw) });
});

app.get("/", (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
  const { lang } = c.var;
  return c.render(
    <div class="mx-auto max-w-5xl px-4 py-12">
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
              <div class="text-xl font-semibold font-mono" id="ctf-count">
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
            autocomplete="off"
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

      <div class="flex flex-col gap-2 mb-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono text-muted-foreground w-20 shrink-0">
            {lang === "fr" ? "type :" : "type:"}
          </span>
          <div class="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                data-filter="category"
                data-value={c}
                type="button"
                class="text-xs px-2 py-0.5 rounded font-mono cursor-pointer transition-colors border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/50"
              >
                {c.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono text-muted-foreground w-20 shrink-0">
            {lang === "fr" ? "difficulté :" : "difficulty:"}
          </span>
          <div class="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                data-filter="difficulty"
                data-value={d}
                type="button"
                class="text-xs px-2 py-0.5 rounded font-mono cursor-pointer transition-colors border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/50"
              >
                {DIFF_LABEL[d][lang === "fr" ? 1 : 0]}
              </button>
            ))}
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-mono text-muted-foreground w-20 shrink-0">
            {lang === "fr" ? "statut :" : "status:"}
          </span>
          <div class="flex flex-wrap gap-1.5">
            {(["unsolved", "solved"] as const).map((s) => (
              <button
                data-filter="status"
                data-value={s}
                type="button"
                class="text-xs px-2 py-0.5 rounded font-mono cursor-pointer transition-colors border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/50"
              >
                {s === "solved"
                  ? lang === "fr" ? "résolu" : "solved"
                  : lang === "fr" ? "non résolu" : "unsolved"}
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

      <script dangerouslySetInnerHTML={{ __html: `(function(){try{console.log('%c cybai{C0ns0l3C0wB0y} ','background:#22c55e;color:#000;font-weight:bold;padding:4px 8px;border-radius:4px;font-family:monospace;font-size:14px');console.log('%c\\u2514 you opened devtools on a ctf page, nice move','color:#6b7280;font-family:monospace;font-size:12px')}catch(e){}})();` }} />
      <script dangerouslySetInnerHTML={{ __html: filterScript }} />
      <script dangerouslySetInnerHTML={{ __html: ctfScript(lang) }} />
    </div>,
  );
});

export default app;
