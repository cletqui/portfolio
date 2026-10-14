(function () {
  "use strict";

  var root = document.getElementById("shell");
  if (!root) return;

  var data = { lang: "en", projects: [], contacts: [], challenges: 0, points: 0, card: "" };
  try {
    data = JSON.parse(document.getElementById("shell-data").textContent);
  } catch (e) {}
  var FR = data.lang === "fr";
  function t(en, fr) {
    return FR ? fr : en;
  }

  var screen = document.getElementById("shell-screen");
  var form = document.getElementById("shell-form");
  var input = document.getElementById("shell-input");
  var promptEl = document.getElementById("shell-prompt");

  var cwd = "~";
  var history = [];
  var hpos = 0;

  /* OUTPUT */
  function print(text, cls) {
    var lines = String(text).split("\n");
    lines.forEach(function (line) {
      var d = document.createElement("div");
      d.className = "whitespace-pre-wrap break-words " + (cls || "");
      d.textContent = line === "" ? " " : line;
      screen.appendChild(d);
    });
    screen.scrollTop = screen.scrollHeight;
  }

  function promptText() {
    return "visitor@cybai.re:" + cwd + "$";
  }

  function setPrompt() {
    promptEl.textContent = promptText();
  }

  /* FILESYSTEM */
  var ABOUT = [
    "# cybai.re",
    t("cybersecurity engineer · full-stack developer", "ingénieur cybersécurité · développeur full-stack"),
    "",
    t(
      "I build things you can see and secure things you can't.",
      "Je construis des choses que vous voyez et je sécurise celles que vous ne voyez pas.",
    ),
    t("Background: threat intelligence platforms, SIEM, SOC.", "Parcours : plateformes de threat intelligence, SIEM, SOC."),
    t("Stack: TypeScript, Python, Bash, and a homelab that rarely sleeps.", "Stack : TypeScript, Python, Bash, et un homelab qui dort rarement."),
  ].join("\n");

  var CONTACT = data.contacts
    .map(function (c) {
      return (c.name + ":").padEnd(10) + c.href;
    })
    .join("\n");

  var CIPHER = "NjM3OTYyNjE2OTdvMzA2cjMxMzA2cjM1NDgzNDc2MzM0cDM0NzkzMzcyMzU3cQ==";
  var SECRET = "cybai{ls_-a_FTW}";

  var files = {
    "~/about.md": ABOUT,
    "~/contact.txt": CONTACT,
    "~/cipher.txt": CIPHER,
    "~/.secret": SECRET,
  };
  data.projects.forEach(function (p) {
    files["~/projects/" + p.id + ".md"] =
      "# " + p.name + "\n" + p.desc + "\n\n" + p.url + (p.github ? "\n" + p.github : "");
  });

  var dirs = {
    "~": ["about.md", "contact.txt", "projects/", "cipher.txt", ".secret"],
    "~/projects": data.projects.map(function (p) {
      return p.id + ".md";
    }),
  };

  function resolve(path) {
    if (!path || path === "~") return "~";
    var base = path.charAt(0) === "~" || path.charAt(0) === "/" ? "~" : cwd;
    var rest = path.replace(/^~\/?/, "").replace(/^\/+/, "");
    var parts = (base === "~" ? [] : base.replace(/^~\//, "").split("/")).concat(rest.split("/"));
    var out = [];
    parts.forEach(function (p) {
      if (!p || p === ".") return;
      if (p === "..") out.pop();
      else out.push(p);
    });
    return out.length ? "~/" + out.join("/") : "~";
  }

  /* COMMANDS */
  var HELP = [
    ["help", t("this list", "cette liste")],
    ["ls [-a]", t("list files", "lister les fichiers")],
    ["cat <file>", t("read a file", "lire un fichier")],
    ["cd <dir>", t("change directory", "changer de dossier")],
    ["about", t("who am I", "qui je suis")],
    ["projects", t("things I built", "ce que j'ai construit")],
    ["contact", t("how to reach me", "me contacter")],
    ["ctf", t("flags hidden on this site", "flags cachés sur ce site")],
    ["open <page>", "about · you · projects · contact · ctf"],
    ["curl cybai.re", t("my business card", "ma carte de visite")],
    ["neofetch", t("system info", "infos système")],
    ["theme [dark|light]", t("switch theme", "changer de thème")],
    ["lang [en|fr]", t("switch language", "changer de langue")],
    ["clear", t("clear the screen", "effacer l'écran")],
  ];

  var QUOTES = [
    "There is no patch for human stupidity. — everyone, eventually",
    "Security is a process, not a product. — Bruce Schneier",
    "The S in IoT stands for security.",
    "It's not DNS. There's no way it's DNS. It was DNS.",
    "Trust, but verify. Then verify the verifier.",
    "Weeks of coding can save you hours of planning.",
  ];

  function go(url) {
    setTimeout(function () {
      location.href = url;
    }, 350);
  }

  var cmds = {
    help: function () {
      var w = 22;
      print(t("Available commands:", "Commandes disponibles :"));
      HELP.forEach(function (h) {
        print("  " + h[0].padEnd(w) + h[1], "text-muted-foreground");
      });
      print(t("Tab completes, ↑/↓ browses history. Some things aren't listed.", "Tab complète, ↑/↓ parcourt l'historique. Certaines choses ne sont pas listées."), "text-muted-foreground");
    },
    ls: function (args) {
      var all = false;
      var target = cwd;
      args.forEach(function (a) {
        if (a.charAt(0) === "-") all = all || a.indexOf("a") !== -1;
        else target = resolve(a);
      });
      var list = dirs[target];
      if (!list) {
        if (files[target]) return print(target.replace(/^~\//, ""));
        return print("ls: cannot access '" + args.join(" ") + "': No such file or directory", "text-destructive");
      }
      var shown = list.slice();
      if (target === "~" && !all) shown = shown.filter(function (f) { return f.charAt(0) !== "."; });
      if (all) shown = [".", ".."].concat(shown);
      print(shown.join("  "));
    },
    cat: function (args) {
      if (!args.length) return print("cat: missing file operand", "text-destructive");
      args.forEach(function (a) {
        if (a === "/etc/passwd")
          return print("root:x:0:0:root:/root:/bin/bash\nvisitor:x:1000:1000:curious human:/home/visitor:/bin/cybai-sh\nflag:x:1337:1337:nice try:/nonexistent:/usr/sbin/nologin");
        var p = resolve(a);
        if (dirs[p]) return print("cat: " + a + ": Is a directory", "text-destructive");
        if (files[p] === undefined) return print("cat: " + a + ": No such file or directory", "text-destructive");
        print(files[p], p === "~/.secret" ? "text-green-500" : "");
      });
    },
    cd: function (args) {
      var p = resolve(args[0] || "~");
      if (!dirs[p]) return print("cd: " + args[0] + (files[p] ? ": Not a directory" : ": No such file or directory"), "text-destructive");
      cwd = p;
      setPrompt();
    },
    pwd: function () {
      print(cwd === "~" ? "/home/visitor" : "/home/visitor/" + cwd.replace(/^~\//, ""));
    },
    clear: function () {
      screen.textContent = "";
    },
    echo: function (args) {
      print(args.join(" "));
    },
    whoami: function () {
      print("visitor");
      print(t("(guest session — your token: curl https://www.cybai.re/ctf/whoami)", "(session invité — ton jeton : curl https://www.cybai.re/ctf/whoami)"), "text-muted-foreground");
    },
    id: function () {
      print("uid=1000(visitor) gid=1000(visitor) groups=1000(visitor),1337(curious)");
    },
    hostname: function () {
      print("cybai.re");
    },
    uname: function () {
      print("CybaiOS 1.2 cloudflare-edge #1 SMP " + new Date().getFullYear() + " x86_64 Hono/Workers");
    },
    date: function () {
      print(new Date().toString());
    },
    history: function () {
      history.forEach(function (h, i) {
        print(String(i + 1).padStart(4) + "  " + h);
      });
    },
    about: function () {
      print(ABOUT);
    },
    contact: function () {
      print(CONTACT);
    },
    projects: function () {
      var width = data.projects.reduce(function (m, p) {
        return Math.max(m, p.name.length);
      }, 0) + 2;
      data.projects.forEach(function (p) {
        print(p.name.padEnd(width) + p.url, "");
      });
      print(t("cat projects/<name>.md for details, or open projects", "cat projects/<nom>.md pour les détails, ou open projects"), "text-muted-foreground");
    },
    ctf: function () {
      print(data.challenges + t(" challenges, ", " défis, ") + data.points + t(" points. Flags look like cybai{...}.", " points. Les flags ressemblent à cybai{...}."));
      print(t("Start with `open ctf`. Not every flag lives in a browser.", "Commence par `open ctf`. Tous les flags ne vivent pas dans un navigateur."), "text-muted-foreground");
    },
    open: function (args) {
      var map = { about: "/about/me", me: "/about/me", you: "/about/you", projects: "/projects", contact: "/contact", ctf: "/ctf", home: "/" };
      var dest = map[args[0]];
      if (!dest) return print("usage: open about|you|projects|contact|ctf", "text-destructive");
      print("opening " + dest + " …", "text-muted-foreground");
      go(dest);
    },
    curl: function (args) {
      var url = args.filter(function (a) { return a.charAt(0) !== "-"; })[0] || "";
      if (/^(https?:\/\/)?(www\.)?cybai\.re\/?$/.test(url)) return print(data.card);
      if (!url) return print("curl: try 'curl --help' or 'curl --manual' for more information", "text-destructive");
      print("curl: (6) Could not resolve host: " + url.replace(/^https?:\/\//, "").split("/")[0], "text-destructive");
    },
    neofetch: function () {
      var art = ["   ▄▄▄▄▄▄   ", "  █      █  ", " █  ▄▄▄▄  █ ", " █ █    █ █ ", " █  ▀▀▀▀  █ ", "  █      █  ", "   ▀▀▀▀▀▀   "];
      var info = [
        "visitor@cybai.re",
        "----------------",
        "OS: CybaiOS 1.2",
        "Host: Cloudflare Pages",
        "Shell: cybai-sh",
        "Stack: Hono · Tailwind · TypeScript",
        "Browser: " + (navigator.userAgent.match(/(Firefox|Edg|Chrome|Safari)\/[\d.]+/) || ["unknown"])[0],
        "Resolution: " + screen.width + "x" + screen.height,
      ];
      for (var i = 0; i < Math.max(art.length, info.length); i++) print((art[i] || "".padEnd(12)) + "  " + (info[i] || ""), "text-green-500");
    },
    theme: function (args) {
      var h = document.documentElement;
      var dark = h.classList.contains("dark") || (!h.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = args[0] === "dark" || args[0] === "light" ? args[0] : dark ? "light" : "dark";
      h.className = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      print("theme: " + next, "text-muted-foreground");
    },
    lang: function (args) {
      var next = args[0] === "en" || args[0] === "fr" ? args[0] : FR ? "en" : "fr";
      print("lang: " + next, "text-muted-foreground");
      go("/" + next);
    },
    fortune: function () {
      print(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    },
    ping: function (args) {
      var host = args[0] || "cybai.re";
      print("PING " + host + " 56(84) bytes of data.");
      print("64 bytes from " + host + ": icmp_seq=1 ttl=118 time=1.337 ms");
      print("64 bytes from " + host + ": icmp_seq=2 ttl=118 time=1.337 ms");
    },
    nmap: function () {
      print("Starting Nmap 7.99 ( https://nmap.org )\nPORT     STATE SERVICE  VERSION\n80/tcp   open  http     Cloudflare http proxy\n443/tcp  open  ssl/http Cloudflare http proxy\nNo, I will not tell you what is behind it.");
    },
    ssh: function () {
      print("Connecting to cybai.re … opening /contact");
      go("/contact");
    },
    sudo: function (args) {
      if (args.join(" ").replace(/\s+/g, " ").toLowerCase() === "make me a sandwich") {
        print("Okay.");
        print("cybai{Sud0M4k3M3AS4ndw1ch}", "text-green-500");
        return;
      }
      print("visitor is not in the sudoers file. This incident will be reported.", "text-destructive");
    },
    rm: function (args) {
      if (args.join(" ").indexOf("/") !== -1) print("rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe. Nice try.", "text-destructive");
      else print("rm: cannot remove: Read-only file system", "text-destructive");
    },
    exit: function () {
      print(t("logout\nThere is nowhere to go. This is the web.", "logout\nIl n'y a nulle part où aller. C'est le web."));
    },
    man: function (args) {
      print(args[0] ? "No manual entry for " + args[0] : "What manual page do you want?");
    },
    vim: function () {
      print("You are now trapped. Good luck. (:q! does nothing here.)");
    },
  };
  cmds.nvim = cmds.vim;
  cmds.vi = cmds.vim;
  cmds.dir = cmds.ls;
  cmds.ll = function (a) {
    cmds.ls(["-a"].concat(a));
  };
  cmds.hack = function () {
    print("[#####               ] 25% bypassing firewall\n[##########          ] 50% reticulating splines\n[###############     ] 75% sweet-talking the kernel\n[####################] 100% just kidding. Try `help`.");
  };

  function tokenize(line) {
    var tokens = [];
    var re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    var m;
    while ((m = re.exec(line))) tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
    return tokens;
  }

  function execute(line) {
    var tokens = tokenize(line.trim());
    if (!tokens.length) return;
    var name = tokens.shift();
    var fn = Object.prototype.hasOwnProperty.call(cmds, name) ? cmds[name] : null;
    if (!fn) return print(name + t(": command not found. Try `help`.", " : commande introuvable. Essaie `help`."), "text-destructive");
    fn(tokens);
  }

  /* INPUT */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var line = input.value;
    print(promptText() + " " + line, "text-muted-foreground");
    if (line.trim()) {
      history.push(line);
      hpos = history.length;
    }
    input.value = "";
    execute(line);
  });

  function complete() {
    var value = input.value;
    var parts = value.split(/\s+/);
    var last = parts[parts.length - 1];
    var pool;
    if (parts.length === 1) pool = Object.keys(cmds);
    else {
      var slash = last.lastIndexOf("/");
      var dir = slash === -1 ? cwd : resolve(last.slice(0, slash + 1));
      pool = (dirs[dir] || []).map(function (f) {
        return (slash === -1 ? "" : last.slice(0, slash + 1)) + f;
      });
    }
    var hits = pool.filter(function (p) {
      return p.indexOf(last) === 0 && (last !== "" || p.charAt(0) !== ".");
    });
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      input.value = parts.join(" ") + (hits[0].slice(-1) === "/" ? "" : " ");
    } else if (hits.length > 1) {
      print(promptText() + " " + value, "text-muted-foreground");
      print(hits.join("  "));
    }
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hpos > 0) input.value = history[--hpos];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hpos = Math.min(hpos + 1, history.length);
      input.value = history[hpos] || "";
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      cmds.clear();
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      print(promptText() + " " + input.value + "^C", "text-muted-foreground");
      input.value = "";
    }
  });

  root.addEventListener("click", function () {
    if (!window.getSelection || window.getSelection().toString() === "") input.focus({ preventScroll: true });
  });

  /* BOOT */
  setPrompt();
  print(t("Type 'help' to list the available commands.", "Tape 'help' pour lister les commandes disponibles."), "text-muted-foreground");
  print("");
})();
