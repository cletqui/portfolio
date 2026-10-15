export type Group = "files" | "text" | "encoding" | "system" | "network" | "site" | "fun";

export interface ManualEntry {
  group: Group;
  synopsis: string;
  summary: [en: string, fr: string];
}

export const GROUP_TITLES: Record<Group, [string, string]> = {
  files: ["Files and navigation", "Fichiers et navigation"],
  text: ["Text processing", "Traitement de texte"],
  encoding: ["Encoding and hashing", "Encodage et hachage"],
  system: ["System and session", "Système et session"],
  network: ["Network and keys", "Réseau et clés"],
  site: ["This site", "Ce site"],
  fun: ["Fun and games", "Jeux et bricoles"],
};

export const GROUP_ORDER: Group[] = ["files", "text", "encoding", "system", "network", "site", "fun"];

export const ALIASES: Record<string, string> = {
  ll: "ls",
  dir: "ls",
  banner: "figlet",
  phishle: "wordle",
  colossal: "adventure",
  matrix: "cmatrix",
  printenv: "env",
  hexdump: "xxd",
  flags: "ctf",
  logout: "exit",
};

export const HIDDEN = /^(xyzzy|plugh|telnet|hack)$/;

const e = (group: Group, synopsis: string, en: string, fr: string): ManualEntry => ({ group, synopsis, summary: [en, fr] });

export const MANUAL: Record<string, ManualEntry> = {
  cat: e("files", "cat [-n] [FILE]...", "concatenate files and print them", "concatène des fichiers et les affiche"),
  cd: e("files", "cd [DIR|-]", "change the working directory; page directories open their page", "change de dossier ; les dossiers de page ouvrent leur page"),
  cp: e("files", "cp SOURCE DEST", "copy a file", "copie un fichier"),
  file: e("files", "file FILE...", "guess the type of a file", "devine le type d'un fichier"),
  find: e("files", "find [PATH] [-name PATTERN] [-type f|d]", "search for files in a directory tree", "cherche des fichiers dans une arborescence"),
  ls: e("files", "ls [-a] [-l] [-1] [PATH]...", "list directory contents", "liste le contenu d'un dossier"),
  mkdir: e("files", "mkdir DIR...", "make directories", "crée des dossiers"),
  mv: e("files", "mv SOURCE DEST", "move or rename a file", "déplace ou renomme un fichier"),
  nano: e("files", "nano [FILE]", "a sensible text editor", "un éditeur de texte raisonnable"),
  nvim: e("files", "nvim [FILE]", "a text editor you will not leave", "un éditeur de texte dont on ne sort pas"),
  pwd: e("files", "pwd", "print the working directory", "affiche le dossier courant"),
  rm: e("files", "rm [-r] [-f] FILE...", "remove files or directories", "supprime des fichiers ou des dossiers"),
  touch: e("files", "touch FILE...", "create empty files", "crée des fichiers vides"),
  tree: e("files", "tree [-a] [PATH]", "list directory contents as a tree", "affiche un dossier sous forme d'arbre"),
  vi: e("files", "vi [FILE]", "a text editor you will not leave", "un éditeur de texte dont on ne sort pas"),
  vim: e("files", "vim [FILE]", "a text editor you will not leave", "un éditeur de texte dont on ne sort pas"),

  cut: e("text", "cut -d DELIM -f LIST [FILE]...", "select fields from each line", "sélectionne des champs dans chaque ligne"),
  echo: e("text", "echo [-n] [-e] [STRING]...", "display a line of text", "affiche une ligne de texte"),
  grep: e("text", "grep [-i] [-v] [-n] [-c] [-r] PATTERN [FILE]...", "print lines that match a pattern", "affiche les lignes qui correspondent à un motif"),
  head: e("text", "head [-n N] [FILE]...", "output the first lines of files", "affiche le début des fichiers"),
  printf: e("text", "printf FORMAT [ARGUMENT]...", "format and print data", "formate et affiche des données"),
  rev: e("text", "rev [FILE]...", "reverse each line", "inverse chaque ligne"),
  seq: e("text", "seq [FIRST] LAST", "print a sequence of numbers", "affiche une suite de nombres"),
  sort: e("text", "sort [-r] [-n] [-u] [FILE]...", "sort lines of text", "trie les lignes de texte"),
  tac: e("text", "tac [FILE]...", "print files in reverse line order", "affiche les fichiers à l'envers, ligne par ligne"),
  tail: e("text", "tail [-n N] [FILE]...", "output the last lines of files", "affiche la fin des fichiers"),
  tr: e("text", "tr [-d] SET1 [SET2]", "translate or delete characters (stdin)", "remplace ou supprime des caractères (stdin)"),
  uniq: e("text", "uniq [-c] [FILE]...", "report or omit repeated lines", "signale ou supprime les lignes répétées"),
  wc: e("text", "wc [-l|-w|-c] [FILE]...", "count lines, words and bytes", "compte les lignes, mots et octets"),
  yes: e("text", "yes [STRING]", "output a string repeatedly (politely)", "répète une chaîne (poliment)"),

  base64: e("encoding", "base64 [-d] [FILE]", "encode or decode base64", "encode ou décode en base64"),
  jwt: e("encoding", "jwt TOKEN", "decode a JSON Web Token", "décode un JSON Web Token"),
  rot13: e("encoding", "rot13 [FILE]", "apply the rot13 substitution", "applique la substitution rot13"),
  sha1sum: e("encoding", "sha1sum [FILE]...", "compute SHA-1 digests", "calcule des empreintes SHA-1"),
  sha256sum: e("encoding", "sha256sum [FILE]...", "compute SHA-256 digests", "calcule des empreintes SHA-256"),
  sha512sum: e("encoding", "sha512sum [FILE]...", "compute SHA-512 digests", "calcule des empreintes SHA-512"),
  strings: e("encoding", "strings [-n MIN] [FILE]...", "print the printable strings in files", "affiche les chaînes imprimables des fichiers"),
  urldecode: e("encoding", "urldecode TEXT", "decode a percent-encoded string", "décode une chaîne encodée en pourcentage"),
  urlencode: e("encoding", "urlencode TEXT", "percent-encode a string", "encode une chaîne en pourcentage"),
  xxd: e("encoding", "xxd [-p] [-r] [-l LEN] [-s OFFSET] [FILE]", "make a hex dump, or reverse one", "produit un dump hexadécimal, ou l'inverse"),

  cal: e("system", "cal", "display a calendar", "affiche un calendrier"),
  clear: e("system", "clear", "clear the terminal screen", "efface l'écran du terminal"),
  date: e("system", "date [-u] [-d @EPOCH] [+FORMAT]", "print the date and time", "affiche la date et l'heure"),
  env: e("system", "env", "print the environment", "affiche l'environnement"),
  exit: e("system", "exit", "leave the current session", "quitte la session courante"),
  export: e("system", "export NAME=VALUE...", "set environment variables", "définit des variables d'environnement"),
  help: e("system", "help [NAME]", "list the commands, or describe one", "liste les commandes, ou décrit l'une d'elles"),
  history: e("system", "history [-c]", "show or clear the command history", "affiche ou efface l'historique"),
  hostname: e("system", "hostname", "show the host name", "affiche le nom de la machine"),
  id: e("system", "id", "print user and group identity", "affiche l'identité utilisateur et groupes"),
  man: e("system", "man NAME", "show the manual page of a command", "affiche la page de manuel d'une commande"),
  su: e("system", "su [root]", "switch user", "change d'utilisateur"),
  sudo: e("system", "sudo COMMAND...", "run a command as another user", "exécute une commande en tant qu'un autre utilisateur"),
  uname: e("system", "uname [-s] [-r]", "print system information", "affiche des informations système"),
  uptime: e("system", "uptime", "show how long the session has been up", "affiche depuis quand la session tourne"),
  whoami: e("system", "whoami", "print the current user name", "affiche le nom de l'utilisateur courant"),

  curl: e("network", "curl [OPTION]... URL", "transfer data from a URL", "transfère des données depuis une URL"),
  git: e("network", "git log|status|show", "the stupid content tracker (read-only here)", "le gestionnaire de contenu stupide (lecture seule ici)"),
  gpg: e("network", "gpg", "show the public key published on this site", "affiche la clé publique publiée sur ce site"),
  nmap: e("network", "nmap HOST", "network exploration tool", "outil d'exploration réseau"),
  ping: e("network", "ping [HOST]", "send ICMP echo requests", "envoie des requêtes ICMP echo"),
  ssh: e("network", "ssh [USER@]HOST", "OpenSSH client", "client OpenSSH"),

  ctf: e("site", "ctf [status|list [FILTER]|hint ID|submit FLAG]", "the capture-the-flag scoreboard", "le tableau du capture-the-flag"),
  lang: e("site", "lang [en|fr]", "switch the site language", "change la langue du site"),
  neofetch: e("site", "neofetch", "show system information with a logo", "affiche des informations système avec un logo"),
  theme: e("site", "theme [dark|light]", "switch the colour theme", "change le thème de couleurs"),

  adventure: e("fun", "adventure", "explore a colossal data centre", "explore un datacenter colossal"),
  cmatrix: e("fun", "cmatrix", "digital rain", "pluie numérique"),
  cowsay: e("fun", "cowsay [TEXT]", "a talking cow", "une vache qui parle"),
  figlet: e("fun", "figlet [TEXT]", "large letters from ordinary text", "de grandes lettres à partir de texte"),
  fortune: e("fun", "fortune", "print a random adage", "affiche une maxime au hasard"),
  lolcat: e("fun", "lolcat [TEXT]", "rainbow-coloured output", "sortie arc-en-ciel"),
  sl: e("fun", "sl", "a steam locomotive, for typos", "une locomotive à vapeur, pour les fautes de frappe"),
  snake: e("fun", "snake", "the classic snake game", "le classique jeu du serpent"),
  wordle: e("fun", "wordle", "guess the five-letter word", "devine le mot de cinq lettres"),
};

export const USAGE: Record<string, string> = Object.fromEntries(
  Object.entries(MANUAL).map(([name, entry]) => [name, entry.synopsis]),
);
