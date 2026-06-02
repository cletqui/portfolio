import { Context, Hono } from "hono";
import { Bindings, Variables } from "..";
import { Title } from "../components/layout";
import { Icon } from "../utils/icons";

type Difficulty = "easy" | "medium" | "hard";

const CHALLENGES: {
  id: string;
  name: string;
  category: string;
  points: number;
  difficulty: Difficulty;
  hint: string;
}[] = [
  {
    id: "source",
    name: "Source Inspector",
    category: "Web",
    points: 50,
    difficulty: "easy",
    hint: "The answer is right in front of you — just not in the rendered content.",
  },
  {
    id: "manifest",
    name: "File Hunter",
    category: "Recon",
    points: 100,
    difficulty: "easy",
    hint: "There's a file with a suspicious name hiding on this server.",
  },
  {
    id: "teapot",
    name: "RFC 2324",
    category: "Web",
    points: 100,
    difficulty: "easy",
    hint: "RFC 2324 compliance requires careful inspection of the full HTTP response — not just the body.",
  },
  {
    id: "private",
    name: "Sensitive Disclosure",
    category: "Recon",
    points: 150,
    difficulty: "medium",
    hint: "Some developers store sensitive files in well-known, predictable locations.",
  },
  {
    id: "french",
    name: "Cocorico",
    category: "OSINT",
    points: 200,
    difficulty: "medium",
    hint: "Certains secrets ne sont révélés qu'aux visiteurs francophones.",
  },
  {
    id: "header",
    name: "Header Spy",
    category: "Web",
    points: 250,
    difficulty: "hard",
    hint: "HTTP responses carry more than their body suggests. Check everything on the main page.",
  },
  {
    id: "readme",
    name: "Hidden in Plain Sight",
    category: "Repo",
    points: 75,
    difficulty: "easy",
    hint: "The source repository itself holds secrets. Have you read the README carefully?",
  },
  {
    id: "dns",
    name: "DNS Detective",
    category: "Recon",
    points: 175,
    difficulty: "medium",
    hint: "DNS records can store more than just IP addresses. Try a TXT lookup on cybai.re.",
  },
  {
    id: "hacker",
    name: "1337 Reviewer",
    category: "Web",
    points: 75,
    difficulty: "easy",
    hint: "Someone left a very suspicious review on /about/me. Their username looks flag-shaped.",
  },
];

const TOTAL_POINTS = CHALLENGES.reduce((s, c) => s + c.points, 0);
const CHALLENGE_COUNT = CHALLENGES.length;

const ChallengeCard = ({
  id,
  name,
  category,
  points,
  difficulty,
  hint,
}: (typeof CHALLENGES)[0]) => (
  <div class="card flex flex-col gap-3" data-challenge={id}>
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h3 class="font-semibold">{name}</h3>
          <span class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">
            {category}
          </span>
        </div>
        <p class="text-xs text-muted-foreground leading-relaxed">{hint}</p>
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
        {difficulty}
      </span>
      <span class="challenge-status text-xs text-muted-foreground">
        🔒 Unsolved
      </span>
    </div>
  </div>
);

const ctfScript = `(function(){
  var KEY='ctf_found';
  var N=${CHALLENGE_COUNT};
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
        if(badge){badge.textContent='\\u2713 Solved';badge.style.color='#22c55e'}
      }
    })
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
      for(var id in found){if(found[id].flag===flag){flash('You already found this flag!','info');return}}
      btn.disabled=true;btn.textContent='Checking\u2026';
      try{
        var r=await fetch('/ctf/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({flag:flag})});
        var data=await r.json();
        if(data.valid){
          found[data.id]={flag:flag,points:data.points,name:data.name};
          save(found);render();
          flash('+'+data.points+' pts \u2014 '+data.name+'!','success');
          input.value='';
        }else{
          flash('Invalid flag. Keep looking!','error')
        }
      }catch(err){
        flash('Submission failed. Try again.','error')
      }
      btn.disabled=false;btn.textContent='Submit'
    });
    var reset=document.getElementById('ctf-reset');
    if(reset){reset.addEventListener('click',function(){
      if(confirm('Reset all progress?')){localStorage.removeItem(KEY);render();flash('Progress reset.','info')}
    })}
  })
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

      <div class="card-primary flex items-center justify-between mb-6 p-4">
        <div class="flex items-center gap-6">
          <div>
            <div
              class="text-3xl font-bold font-mono tabular-nums"
              id="ctf-score"
            >
              0
            </div>
            <div class="text-xs text-muted-foreground">
              {lang === "fr" ? "points" : "points"}
            </div>
          </div>
          <div class="w-px h-10 bg-border" />
          <div>
            <div class="text-xl font-semibold font-mono" id="ctf-count">
              0/{CHALLENGE_COUNT}
            </div>
            <div class="text-xs text-muted-foreground">
              {lang === "fr" ? "drapeaux trouvés" : "flags found"}
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-muted-foreground mb-0.5">
            {lang === "fr" ? "Maximum" : "Maximum"}
          </div>
          <div class="text-lg font-bold font-mono tabular-nums">
            {TOTAL_POINTS} pts
          </div>
        </div>
      </div>
      <div class="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          id="ctf-progress"
          class="h-full bg-primary rounded-full transition-all duration-500"
          style="width:0%"
        />
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CHALLENGES.map((ch) => (
          <ChallengeCard {...ch} />
        ))}
      </div>

      <div class="max-w-lg mx-auto">
        <h2 class="text-lg font-semibold mb-4 text-center">
          {lang === "fr" ? "Soumettre un drapeau" : "Submit a flag"}
        </h2>
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
        <div class="mt-4 text-center">
          <button
            id="ctf-reset"
            type="button"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === "fr" ? "Réinitialiser la progression" : "Reset progress"}
          </button>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: ctfScript }} />
    </div>,
  );
});

export default app;
