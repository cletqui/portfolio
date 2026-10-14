export type Difficulty = "easy" | "medium" | "hard";

export interface Challenge {
  id: string;
  name: string;
  nameFr: string;
  category: string;
  points: number;
  difficulty: Difficulty;
  hint: string;
  hintFr: string;
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const ENTRIES: Challenge[] = [
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
    hintFr:
      "Certains messages ne sont vus que par ceux qui ont les bons outils ouverts.",
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
    hintFr:
      "Les chemins les plus prévisibles sont souvent les plus récompensés.",
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
  {
    id: "konami",
    name: "Old School",
    nameFr: "Vieille École",
    category: "Web",
    points: 50,
    difficulty: "easy",
    hint: "Some codes are older than the web itself.",
    hintFr:
      "Certains codes sont plus vieux que le web lui-même.",
  },
  {
    id: "jsobj",
    name: "Global Variable",
    nameFr: "Variable Globale",
    category: "Web",
    points: 50,
    difficulty: "easy",
    hint: "Have you tried asking the page who it is?",
    hintFr:
      "As-tu essayé de demander à la page qui elle est ?",
  },
  {
    id: "cookie",
    name: "Cookie Monster",
    nameFr: "Cookie Monster",
    category: "Web",
    points: 75,
    difficulty: "easy",
    hint: "Not every cookie is meant to be eaten. Some are meant to be decoded.",
    hintFr:
      "Tous les cookies ne sont pas faits pour être mangés. Certains sont faits pour être décodés.",
  },
  {
    id: "css",
    name: "Style Detective",
    nameFr: "Détective du Style",
    category: "Web",
    points: 75,
    difficulty: "easy",
    hint: "Style sheets hold more than style.",
    hintFr:
      "Les feuilles de style contiennent plus que du style.",
  },
  {
    id: "sudo",
    name: "Make Me a Sandwich",
    nameFr: "Fais-moi un sandwich",
    category: "Misc",
    points: 75,
    difficulty: "easy",
    hint: "The terminal knows its XKCD.",
    hintFr:
      "Le terminal connaît son XKCD.",
  },
  {
    id: "negotiation",
    name: "Content Negotiation",
    nameFr: "Négociation de Contenu",
    category: "Web",
    points: 100,
    difficulty: "easy",
    hint: "Ask for what you want, not for what you are given.",
    hintFr:
      "Demande ce que tu veux, pas ce qu'on te donne.",
  },
  {
    id: "hidden-file",
    name: "Hidden File",
    nameFr: "Fichier Caché",
    category: "Misc",
    points: 100,
    difficulty: "easy",
    hint: "ls shows less than it knows.",
    hintFr:
      "ls montre moins qu'il n'en sait.",
  },
  {
    id: "env",
    name: "Leaky Config",
    nameFr: "Config qui Fuit",
    category: "Recon",
    points: 125,
    difficulty: "medium",
    hint: "Some developers commit what they should hide.",
    hintFr:
      "Certains développeurs commitent ce qu'ils devraient cacher.",
  },
  {
    id: "stego",
    name: "Hidden in Plain Pixels",
    nameFr: "Caché dans les Pixels",
    category: "Forensics",
    points: 125,
    difficulty: "medium",
    hint: "A picture is worth more than a thousand pixels.",
    hintFr:
      "Une image vaut plus que mille pixels.",
  },
  {
    id: "crypto",
    name: "Onion Layers",
    nameFr: "Couches d'Oignon",
    category: "Crypto",
    points: 125,
    difficulty: "medium",
    hint: "Peel it one layer at a time. Cry later.",
    hintFr:
      "Épluche-le couche par couche. Pleure après.",
  },
  {
    id: "gate",
    name: "The Gatekeeper",
    nameFr: "Le Gardien",
    category: "Web",
    points: 200,
    difficulty: "medium",
    hint: "Tell it who you are. Convincingly. Several times.",
    hintFr:
      "Dis-lui qui tu es. De façon convaincante. Plusieurs fois.",
  },
  {
    id: "jwt",
    name: "Forged Identity",
    nameFr: "Identité Forgée",
    category: "Web",
    points: 250,
    difficulty: "medium",
    hint: "A token is only as strong as its secret. Who are you, really?",
    hintFr:
      "Un jeton n'est aussi solide que son secret. Qui es-tu vraiment ?",
  },
  {
    id: "git",
    name: "Git Happens",
    nameFr: "Git Happens",
    category: "Recon",
    points: 250,
    difficulty: "hard",
    hint: "A repository remembers more than its latest commit.",
    hintFr: "Un dépôt se souvient de plus que son dernier commit.",
  },
  {
    id: "root",
    name: "Root Cause",
    nameFr: "Cause Racine",
    category: "Misc",
    points: 175,
    difficulty: "medium",
    hint: "Shell history has a long memory.",
    hintFr:
      "L'historique du shell a bonne mémoire.",
  },
  {
    id: "xyzzy",
    name: "A Hollow Voice",
    nameFr: "Une Voix Creuse",
    category: "Misc",
    points: 75,
    difficulty: "easy",
    hint: "Say the magic word. Then say the next one.",
    hintFr:
      "Prononce le mot magique. Puis le suivant.",
  },
  {
    id: "wipe",
    name: "Scorched Earth",
    nameFr: "Terre Brûlée",
    category: "Misc",
    points: 100,
    difficulty: "easy",
    hint: "Some commands are best left unrun. Run it anyway.",
    hintFr:
      "Certaines commandes vaut mieux ne pas les lancer. Lance-la quand même.",
  },
  {
    id: "forkbomb",
    name: "Fork Bomb",
    nameFr: "Bombe Fork",
    category: "Misc",
    points: 75,
    difficulty: "easy",
    hint: "The most elegant way to crash a machine fits on one line.",
    hintFr:
      "La façon la plus élégante de planter une machine tient en une ligne.",
  },
  {
    id: "adventure",
    name: "Colossal Data Center",
    nameFr: "Datacenter Colossal",
    category: "Misc",
    points: 200,
    difficulty: "medium",
    hint: "You are in a maze of twisty little racks, all alike.",
    hintFr:
      "Tu es dans un labyrinthe de petites baies tortueuses, toutes semblables.",
  },
  {
    id: "snake",
    name: "Snake Charmer",
    nameFr: "Charmeur de Serpent",
    category: "Misc",
    points: 125,
    difficulty: "medium",
    hint: "Eat enough and the terminal pays you back.",
    hintFr:
      "Mange assez et le terminal te le rendra.",
  },
  {
    id: "wordle",
    name: "Phishing for Words",
    nameFr: "Pêche aux Mots",
    category: "Misc",
    points: 100,
    difficulty: "easy",
    hint: "Five letters. Six tries. Think security.",
    hintFr:
      "Cinq lettres. Six essais. Pense sécurité.",
  },
];

export const CHALLENGES: Challenge[] = [...ENTRIES].sort(
  (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || a.points - b.points,
);

export const TOTAL_POINTS = CHALLENGES.reduce((sum, c) => sum + c.points, 0);
export const CHALLENGE_COUNT = CHALLENGES.length;
export const CATEGORIES = [...new Set(CHALLENGES.map((c) => c.category))];
