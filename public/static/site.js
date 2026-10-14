(function () {
  "use strict";

  var data = { lang: "en", items: [] };
  try {
    data = JSON.parse(document.getElementById("palette-data").textContent);
  } catch (e) {}
  var FR = data.lang === "fr";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* TOAST */
  function toast(title, body, ms) {
    var box = el(
      "div",
      "fixed bottom-4 right-4 z-[120] max-w-sm rounded-md border border-border bg-card p-4 shadow-lg font-mono text-sm space-y-1",
    );
    box.setAttribute("role", "status");
    box.appendChild(el("div", "font-semibold", title));
    box.appendChild(el("div", "text-green-500 break-all", body));
    box.addEventListener("click", function () {
      box.remove();
    });
    document.body.appendChild(box);
    setTimeout(function () {
      box.remove();
    }, ms || 15000);
  }

  /* COPY BUTTONS */
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-copy]") : null;
    if (!b) return;
    var label = b.querySelector("span");
    var original = label ? label.textContent : "";
    function done() {
      if (!label) return;
      label.textContent = b.getAttribute("data-copied") || "Copied!";
      setTimeout(function () {
        label.textContent = original;
      }, 1500);
    }
    if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute("data-copy")).then(done, function () {});
  });

  /* KONAMI */
  var SEQ = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
  ];
  var pos = 0;
  document.addEventListener("keydown", function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === SEQ[pos] ? pos + 1 : key === SEQ[0] ? 1 : 0;
    if (pos === SEQ.length) {
      pos = 0;
      toast(
        FR ? "↑↑↓↓←→←→BA — vieille école !" : "↑↑↓↓←→←→BA — old school!",
        "cybai{Up_Up_D0wn_D0wn_L3ft_R1ght}",
      );
    }
  });

  /* CONSOLE OBJECT */
  var cybai = {
    name: "cybai.re",
    role: "cybersecurity engineer, full-stack developer",
    site: "https://www.cybai.re",
    help: function () {
      return "about() · links() · ctf() · selfdestruct()";
    },
    about: function () {
      return "I build things you can see and secure things you can't.";
    },
    links: function () {
      return ["https://github.com/cletqui", "https://bsky.app/profile/cybai.re"];
    },
    ctf: function () {
      return "flags look like cybai{...}. submit them at /ctf";
    },
    selfdestruct: function () {
      console.log("3… 2… 1…");
      return "cybai{GlobalScopeLeak}";
    },
  };
  try {
    Object.defineProperty(window, "cybai", { value: cybai });
    console.log(
      "%c cybai.re %c psst… try cybai.help()",
      "background:#16a34a;color:#fff;border-radius:3px;padding:2px 6px;font-weight:bold",
      "color:#16a34a",
    );
  } catch (e) {}

  /* PALETTE */
  var overlay = null;
  var input = null;
  var list = null;
  var shown = [];
  var active = 0;
  var opener = null;

  function theme() {
    var h = document.documentElement;
    var dark =
      h.classList.contains("dark") ||
      (!h.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    h.className = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  }

  function run(item) {
    close();
    if (item.href) {
      if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
      else location.href = item.href;
    } else if (item.action === "theme") theme();
    else if (item.action === "lang") {
      var path = location.pathname.replace(/\/$/, "");
      location.href = path + "/" + (FR ? "en" : "fr");
    } else if (item.copy) {
      if (navigator.clipboard) navigator.clipboard.writeText(item.copy);
      toast(FR ? "Copié" : "Copied", item.copy, 3000);
    }
  }

  var rowEls = [];
  var mouseX = -1;
  var mouseY = -1;
  var ACTIVE = ["bg-accent", "text-accent-foreground"];

  function setActive(i, scroll) {
    if (rowEls[active]) ACTIVE.forEach(function (c) { rowEls[active].classList.remove(c); });
    active = i;
    if (!rowEls[i]) return;
    ACTIVE.forEach(function (c) { rowEls[i].classList.add(c); });
    if (scroll) rowEls[i].scrollIntoView({ block: "nearest" });
  }

  function filter(q) {
    var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    shown = data.items.filter(function (it) {
      var hay = (it.label + " " + it.group + " " + (it.hint || "")).toLowerCase();
      return tokens.every(function (t) {
        return hay.indexOf(t) !== -1;
      });
    });
    build();
    setActive(0, false);
    list.scrollTop = 0;
  }

  function build() {
    list.textContent = "";
    rowEls = [];
    if (!shown.length) {
      list.appendChild(el("li", "px-3 py-6 text-center text-sm text-muted-foreground font-mono", FR ? "commande introuvable" : "command not found"));
      return;
    }
    var last = "";
    shown.forEach(function (it, i) {
      if (it.group !== last) {
        last = it.group;
        list.appendChild(el("li", "px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground", it.group));
      }
      var li = el("li", "flex items-center justify-between gap-3 rounded px-3 py-2 text-sm cursor-pointer");
      li.setAttribute("role", "option");
      li.appendChild(el("span", "", it.label));
      if (it.hint) li.appendChild(el("span", "text-xs font-mono text-muted-foreground truncate", it.hint));
      li.addEventListener("mousemove", function (e) {
        if (e.screenX === mouseX && e.screenY === mouseY) return;
        mouseX = e.screenX;
        mouseY = e.screenY;
        if (active !== i) setActive(i, false);
      });
      li.addEventListener("click", function () {
        run(it);
      });
      list.appendChild(li);
      rowEls.push(li);
    });
  }

  function open() {
    if (overlay) return;
    opener = document.activeElement;
    overlay = el("div", "fixed inset-0 z-[110] flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm");
    var box = el("div", "w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xl");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", FR ? "Palette de commandes" : "Command palette");
    input = el("input", "w-full border-b border-border bg-transparent px-4 py-3 font-mono text-sm outline-none");
    input.type = "text";
    input.placeholder = FR ? "tape une commande ou une page…" : "type a command or a page…";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("name", "palette-search");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("data-bwignore", "true");
    input.setAttribute("data-lpignore", "true");
    input.setAttribute("data-1p-ignore", "true");
    input.setAttribute("data-form-type", "other");
    input.setAttribute("spellcheck", "false");
    list = el("ul", "max-h-80 overflow-y-auto p-2");
    list.setAttribute("role", "listbox");
    box.appendChild(input);
    box.appendChild(list);
    overlay.appendChild(box);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });
    input.addEventListener("input", function () {
      filter(input.value);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(Math.min(active + 1, shown.length - 1), true);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(Math.max(active - 1, 0), true);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (shown[active]) run(shown[active]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });
    document.body.appendChild(overlay);
    filter("");
    input.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    if (opener && opener.focus) opener.focus();
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (overlay) close();
      else open();
    }
  });
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("#palette-open") : null;
    if (t) open();
  });
})();
