(function () {
  "use strict";

  var root = document.getElementById("scan");
  if (!root) return;

  var FR = root.getAttribute("data-lang") === "fr";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function t(en, fr) {
    return FR ? fr : en;
  }

  var S = { languages: [], headers: [], net: {} };
  try {
    S = JSON.parse(document.getElementById("server-signals").textContent);
  } catch (e) {}

  var rows = [];
  var lies = [];
  var infer = [];
  var rtcState = "idle";

  /* HELPERS */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch];
    });
  }

  function add(group, id, label, value, bits, stable) {
    if (value === undefined || value === null || value === "") return;
    rows.push({
      g: group,
      id: id,
      l: label,
      v: String(value),
      b: bits || 0,
      s: stable !== false,
    });
  }

  function get(id) {
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return rows[i].v;
    return undefined;
  }

  function lie(id, level, title, detail) {
    for (var i = 0; i < lies.length; i++) {
      if (lies[i].id === id) {
        lies[i] = { id: id, level: level, title: title, detail: detail };
        return;
      }
    }
    lies.push({ id: id, level: level, title: title, detail: detail });
  }

  function fnv(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  function sha(str) {
    try {
      if (window.crypto && crypto.subtle) {
        return crypto.subtle
          .digest("SHA-256", new TextEncoder().encode(str))
          .then(function (buf) {
            return Array.prototype.map
              .call(new Uint8Array(buf), function (b) {
                return ("0" + b.toString(16)).slice(-2);
              })
              .join("");
          });
      }
    } catch (e) {}
    return Promise.resolve(fnv(str) + fnv(str.split("").reverse().join("")));
  }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error("timeout"));
      }, ms);
      promise.then(
        function (v) {
          clearTimeout(timer);
          resolve(v);
        },
        function (e) {
          clearTimeout(timer);
          reject(e);
        },
      );
    });
  }

  /* TERMINAL LOG */
  var logEl = document.getElementById("scan-log");
  var queue = [];
  var draining = false;
  function drain() {
    if (draining) return;
    draining = true;
    (function next() {
      var item = queue.shift();
      if (!item) {
        draining = false;
        return;
      }
      var p = document.createElement("p");
      p.className =
        item.state === "warn"
          ? "text-amber-500"
          : item.state === "ok"
            ? "text-green-500"
            : "text-muted-foreground";
      p.textContent = item.text;
      logEl.appendChild(p);
      logEl.scrollTop = logEl.scrollHeight;
      setTimeout(next, REDUCED ? 0 : 45);
    })();
  }
  function log(text, state) {
    if (!logEl) return;
    queue.push({ text: text, state: state });
    drain();
  }

  function task(name, fn, ms) {
    return withTimeout(Promise.resolve().then(fn), ms || 2500).then(
      function () {
        log("[ ok ] " + name, "ok");
      },
      function (e) {
        log(
          "[skip] " + name + " — " + (e && e.message ? e.message : "unavailable"),
          "warn",
        );
      },
    );
  }

  /* COLLECTORS */
  function collectNetwork() {
    add("net", "ip", "IP", S.ip, 0, false);
    var n = S.net || {};
    if (n.colo) add("net", "colo", t("Edge location", "Point de présence"), n.colo, 0, false);
    if (n.asn)
      add("net", "asn", "ASN", "AS" + n.asn + (n.asOrganization ? " · " + n.asOrganization : ""), 3, true);
    if (n.httpProtocol) add("net", "http", "HTTP", n.httpProtocol, 1, true);
    if (n.tlsVersion)
      add("net", "tls", "TLS", n.tlsVersion + (n.tlsCipher ? " · " + n.tlsCipher : ""), 2, true);
    if (n.tlsExtensionsSha1)
      add("net", "tlsext", t("TLS extensions hash", "Hash des extensions TLS"), n.tlsExtensionsSha1, 6, true);
    if (n.tcpRtt)
      add("net", "rtt", t("TCP round-trip", "Aller-retour TCP"), n.tcpRtt + " ms", 0, false);
    if (S.languages && S.languages.length)
      add(
        "net",
        "accept-lang",
        "Accept-Language",
        S.languages
          .map(function (l) {
            return l.tag + (l.q < 1 ? ";q=" + l.q : "");
          })
          .join(", "),
        5,
        true,
      );
  }

  function collectNavigator() {
    var n = navigator;
    add("browser", "ua", "User-Agent", n.userAgent, 10);
    add("browser", "platform", "navigator.platform", n.platform, 2);
    add("browser", "vendor", t("Vendor", "Éditeur"), n.vendor, 1);
    add("browser", "langs", t("JS languages", "Langues JS"), (n.languages || [n.language]).join(", "), 5);
    add("browser", "cores", t("CPU threads", "Threads CPU"), n.hardwareConcurrency, 2.5);
    add(
      "browser",
      "mem",
      t("Device memory", "Mémoire"),
      n.deviceMemory ? n.deviceMemory + " GB (" + t("capped at 8", "plafonné à 8") + ")" : undefined,
      2,
    );
    add("browser", "touch", t("Touch points", "Points tactiles"), n.maxTouchPoints, 1.5);
    add("browser", "plugins", t("PDF viewer", "Lecteur PDF"), n.pdfViewerEnabled, 0.5);
    add(
      "browser",
      "dnt",
      "Do Not Track / GPC",
      "DNT=" + (n.doNotTrack || window.doNotTrack || "unset") + " · GPC=" + (n.globalPrivacyControl ? "on" : "unset"),
      1,
    );
    add("browser", "webdriver", "navigator.webdriver", String(!!n.webdriver), 0);
    add("browser", "cookies", t("Cookies enabled", "Cookies activés"), n.cookieEnabled, 0.3);
    add("browser", "history", t("History length", "Taille de l'historique"), history.length, 0, false);
    add("browser", "referrer", "document.referrer", document.referrer || t("(none)", "(aucun)"), 0, false);
    var c = n.connection || n.mozConnection;
    if (c)
      add(
        "net",
        "conn",
        t("Connection API", "API connexion"),
        [c.effectiveType, c.downlink && c.downlink + " Mbps", c.rtt && c.rtt + " ms", c.saveData && "save-data"]
          .filter(Boolean)
          .join(" · "),
        1.5,
        false,
      );
  }

  function collectHighEntropy() {
    var uad = navigator.userAgentData;
    if (!uad || !uad.getHighEntropyValues) throw new Error(t("not exposed (non-Chromium)", "non exposé (hors Chromium)"));
    return uad
      .getHighEntropyValues([
        "architecture",
        "bitness",
        "model",
        "platformVersion",
        "fullVersionList",
        "wow64",
      ])
      .then(function (h) {
        add("browser", "uad-platform", "Client Hints platform", (uad.platform || "") + " " + (h.platformVersion || ""), 3);
        add("browser", "uad-arch", "Client Hints arch", (h.architecture || "") + (h.bitness ? "-" + h.bitness : "") + (h.wow64 ? " (WoW64)" : ""), 2);
        if (h.model) add("browser", "uad-model", t("Device model", "Modèle d'appareil"), h.model, 5);
        if (h.fullVersionList)
          add(
            "browser",
            "uad-brands",
            t("Full versions", "Versions complètes"),
            h.fullVersionList
              .map(function (b) {
                return b.brand + " " + b.version;
              })
              .join(", "),
            4,
          );
      });
  }

  function mq(q) {
    return window.matchMedia(q).matches;
  }

  function collectDisplay() {
    var s = screen;
    add("display", "screen", t("Screen", "Écran"), s.width + "×" + s.height, 4.8);
    add("display", "avail", t("Available area", "Zone disponible"), s.availWidth + "×" + s.availHeight, 2);
    add("display", "dpr", t("Pixel ratio", "Ratio de pixels"), window.devicePixelRatio, 2);
    add("display", "depth", t("Color depth", "Profondeur couleur"), s.colorDepth + " bit", 1);
    add("display", "viewport", t("Viewport", "Fenêtre"), window.innerWidth + "×" + window.innerHeight, 0, false);
    add(
      "display",
      "gamut",
      t("Color gamut", "Gamut couleur"),
      mq("(color-gamut: rec2020)") ? "rec2020" : mq("(color-gamut: p3)") ? "p3" : mq("(color-gamut: srgb)") ? "srgb" : "?",
      1.5,
    );
    add("display", "hdr", "HDR", mq("(dynamic-range: high)"), 1);
    add("display", "refresh", t("Orientation", "Orientation"), (s.orientation && s.orientation.type) || "", 0.5, false);
    add(
      "prefs",
      "scheme",
      t("Color scheme", "Thème"),
      mq("(prefers-color-scheme: dark)") ? t("dark", "sombre") : t("light", "clair"),
      1,
    );
    add("prefs", "motion", t("Reduced motion", "Animations réduites"), mq("(prefers-reduced-motion: reduce)"), 0.5);
    add("prefs", "contrast", t("Contrast preference", "Contraste"), mq("(prefers-contrast: more)") ? "more" : mq("(prefers-contrast: less)") ? "less" : "no-preference", 0.5);
    add("prefs", "forced", "forced-colors", mq("(forced-colors: active)"), 0.5);
    add("prefs", "inverted", "inverted-colors", mq("(inverted-colors: inverted)"), 0.3);
    add("prefs", "pointer", t("Pointer / hover", "Pointeur / survol"), (mq("(pointer: fine)") ? "fine" : mq("(pointer: coarse)") ? "coarse" : "none") + " / " + (mq("(hover: hover)") ? "hover" : "no-hover"), 1.5);
  }

  function collectLocale() {
    var o = Intl.DateTimeFormat().resolvedOptions();
    add("locale", "tz", t("Timezone", "Fuseau horaire"), o.timeZone, 3);
    add("locale", "locale", "Locale", o.locale, 3);
    add("locale", "cal", t("Calendar / numbering", "Calendrier / chiffres"), o.calendar + " / " + o.numberingSystem, 0.5);
    add("locale", "offset", t("UTC offset", "Décalage UTC"), -new Date().getTimezoneOffset() / 60 + " h", 0, false);
    var sample = new Date(Date.UTC(2001, 11, 31, 23, 59, 58));
    add("locale", "datefmt", t("Date format", "Format de date"), sample.toLocaleString(), 2);
    add("locale", "numfmt", t("Number format", "Format de nombre"), (1234567.891).toLocaleString(), 1);
    add("locale", "localtime", t("Your local time", "Ton heure locale"), new Date().toLocaleTimeString(), 0, false);
  }

  function canvasHash() {
    var cv = document.createElement("canvas");
    cv.width = 280;
    cv.height = 60;
    var ctx = cv.getContext("2d");
    if (!ctx) throw new Error("no 2d");
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.font = "15px 'Arial'";
    ctx.fillText("cybai.re <canvas> 1.0 🕵️", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.font = "18px 'Times New Roman'";
    ctx.fillText("cybai.re <canvas> 1.0 🕵️", 4, 45);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgb(255,0,255)";
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    return cv.toDataURL();
  }

  function collectCanvas() {
    var a = canvasHash();
    var b = canvasHash();
    return Promise.all([sha(a), sha(b)]).then(function (h) {
      add("hardware", "canvas", "Canvas", h[0].slice(0, 16), 8);
      if (h[0] !== h[1])
        lie(
          "canvas-noise",
          "warn",
          t("Canvas noise injection", "Bruit injecté dans le canvas"),
          t(
            "Two identical canvas draws gave different results: a privacy extension or browser is randomizing the output.",
            "Deux dessins identiques ont donné des résultats différents : une extension ou le navigateur randomise la sortie.",
          ),
        );
    });
  }

  function collectWebGL() {
    var cv = document.createElement("canvas");
    var gl = cv.getContext("webgl") || cv.getContext("experimental-webgl");
    if (!gl) throw new Error(t("WebGL unavailable", "WebGL indisponible"));
    var ext = gl.getExtension("WEBGL_debug_renderer_info");
    var vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    var renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    add("hardware", "gpu", "GPU", renderer, 7);
    add("hardware", "gpu-vendor", t("GPU vendor", "Fabricant GPU"), vendor, 1.5);
    var dims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    var exts = gl.getSupportedExtensions() || [];
    var params = [
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      dims && dims[0],
      gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE).join("-"),
      exts.length,
    ].join("/");
    add("hardware", "gl-params", t("WebGL limits", "Limites WebGL"), params, 4);
    return sha(exts.join(",")).then(function (h) {
      add("hardware", "gl-ext", t("WebGL extensions", "Extensions WebGL"), exts.length + " · " + h.slice(0, 10), 3);
    });
  }

  function collectWebGPU() {
    if (!navigator.gpu) throw new Error(t("WebGPU unavailable", "WebGPU indisponible"));
    return navigator.gpu.requestAdapter().then(function (a) {
      if (!a) throw new Error(t("no adapter", "aucun adaptateur"));
      var info = a.info || {};
      var desc = [info.vendor, info.architecture, info.device, info.description].filter(Boolean).join(" · ");
      add("hardware", "webgpu", "WebGPU", desc || t("available", "disponible"), 3);
    });
  }

  function collectAudio() {
    var Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctx) throw new Error(t("no OfflineAudioContext", "pas d'OfflineAudioContext"));
    var ctx = new Ctx(1, 44100, 44100);
    var osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 10000;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -50;
    comp.knee.value = 40;
    comp.ratio.value = 12;
    comp.attack.value = 0;
    comp.release.value = 0.25;
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);
    return ctx.startRendering().then(function (buf) {
      var data = buf.getChannelData(0);
      var sum = 0;
      for (var i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
      return sha(String(sum)).then(function (h) {
        add("hardware", "audio", t("Audio stack", "Pile audio"), h.slice(0, 16), 5);
      });
    });
  }

  var FONTS = [
    "Arial", "Arial Black", "Arial Narrow", "Calibri", "Cambria", "Cambria Math", "Candara", "Comic Sans MS", "Consolas",
    "Constantia", "Corbel", "Courier New", "Franklin Gothic Medium", "Gabriola", "Georgia", "Impact", "Lucida Console",
    "Lucida Sans Unicode", "Microsoft Sans Serif", "Palatino Linotype", "Segoe UI", "Segoe UI Emoji", "Tahoma",
    "Times New Roman", "Trebuchet MS", "Verdana", "Helvetica", "Helvetica Neue", "Menlo", "Monaco", "Geneva", "Optima",
    "Futura", "Gill Sans", "Avenir", "Avenir Next", "American Typewriter", "Baskerville", "Didot", "Hoefler Text",
    "SF Pro Text", "Apple Color Emoji", "Ubuntu", "Ubuntu Mono", "Cantarell", "DejaVu Sans", "DejaVu Sans Mono",
    "Liberation Sans", "Liberation Mono", "Noto Sans", "Noto Color Emoji", "Droid Sans", "Roboto", "Open Sans",
    "Fira Code", "Fira Sans", "JetBrains Mono", "Source Code Pro", "Hack", "Inconsolata", "Adobe Garamond Pro",
    "Minion Pro", "Myriad Pro", "Wingdings", "MS Gothic", "SimSun", "Meiryo", "Malgun Gothic",
  ];

  function collectFonts() {
    var bases = ["monospace", "sans-serif", "serif"];
    var text = "mmmmmmmmmmlli1WwOo0";
    var span = document.createElement("span");
    span.textContent = text;
    span.style.cssText = "position:absolute;left:-9999px;top:-9999px;font-size:72px;visibility:hidden";
    document.body.appendChild(span);
    var baseW = {};
    bases.forEach(function (b) {
      span.style.fontFamily = b;
      baseW[b] = span.offsetWidth + "x" + span.offsetHeight;
    });
    var found = [];
    FONTS.forEach(function (f) {
      for (var i = 0; i < bases.length; i++) {
        span.style.fontFamily = "'" + f + "'," + bases[i];
        if (span.offsetWidth + "x" + span.offsetHeight !== baseW[bases[i]]) {
          found.push(f);
          return;
        }
      }
    });
    document.body.removeChild(span);
    add("hardware", "fonts", t("Fonts detected", "Polices détectées"), found.length + "/" + FONTS.length + (found.length ? " · " + found.slice(0, 8).join(", ") + (found.length > 8 ? "…" : "") : ""), 7);
    return found;
  }

  function collectMedia() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
      throw new Error(t("no mediaDevices", "pas de mediaDevices"));
    return navigator.mediaDevices.enumerateDevices().then(function (list) {
      var c = { audioinput: 0, audiooutput: 0, videoinput: 0 };
      list.forEach(function (d) {
        if (c[d.kind] !== undefined) c[d.kind]++;
      });
      add("hardware", "media", t("Media devices", "Périphériques média"), c.videoinput + " cam · " + c.audioinput + " mic · " + c.audiooutput + " out", 2);
    });
  }

  function collectStorage() {
    var parts = [];
    ["localStorage", "sessionStorage", "indexedDB"].forEach(function (k) {
      try {
        parts.push(k + "=" + (window[k] ? "yes" : "no"));
      } catch (e) {
        parts.push(k + "=blocked");
      }
    });
    add("caps", "storage", t("Storage APIs", "APIs de stockage"), parts.join(" "), 0.5);
    if (!navigator.storage || !navigator.storage.estimate) return;
    return navigator.storage.estimate().then(function (e) {
      var gb = e.quota / 1073741824;
      add("caps", "quota", t("Storage quota", "Quota de stockage"), gb.toFixed(1) + " GB", 1.5);
      if (e.quota < 300 * 1048576)
        lie(
          "private-mode",
          "info",
          t("Private window likely", "Fenêtre privée probable"),
          t("The storage quota is tiny, a typical sign of incognito / private browsing.", "Le quota de stockage est minuscule, signe classique de la navigation privée."),
        );
    });
  }

  function collectBattery() {
    if (!navigator.getBattery) throw new Error(t("Battery API not exposed", "API batterie non exposée"));
    return navigator.getBattery().then(function (b) {
      add("hardware", "battery", t("Battery", "Batterie"), Math.round(b.level * 100) + "% " + (b.charging ? t("charging", "en charge") : t("discharging", "sur batterie")), 0.5, false);
    });
  }

  function collectVoices() {
    if (!window.speechSynthesis) throw new Error(t("no speechSynthesis", "pas de speechSynthesis"));
    return new Promise(function (resolve) {
      function read() {
        var v = speechSynthesis.getVoices();
        if (v.length) {
          var langs = {};
          v.forEach(function (x) {
            langs[x.lang] = 1;
          });
          add("locale", "voices", t("Speech voices", "Voix de synthèse"), v.length + " · " + Object.keys(langs).slice(0, 6).join(", "), 4);
          resolve();
          return true;
        }
        return false;
      }
      if (read()) return;
      speechSynthesis.addEventListener("voiceschanged", read);
      setTimeout(resolve, 900);
    });
  }

  function collectKeyboard() {
    if (!navigator.keyboard || !navigator.keyboard.getLayoutMap) throw new Error(t("Keyboard API not exposed", "API clavier non exposée"));
    return navigator.keyboard.getLayoutMap().then(function (m) {
      var q = m.get("KeyQ");
      var w = m.get("KeyW");
      var y = m.get("KeyY");
      var layout =
        q === "a" ? "AZERTY"
        : y === "z" ? "QWERTZ"
        : q === "'" ? "Dvorak"
        : q === "b" ? "BÉPO"
        : q === "q" && w === "w" ? "QWERTY"
        : t("alternative layout", "disposition alternative") + " (" + [q, w, m.get("KeyE"), m.get("KeyR")].join("") + ")";
      add("locale", "keyboard", t("Keyboard layout", "Disposition clavier"), layout, 2.5);
    });
  }

  function collectPermissions() {
    if (!navigator.permissions || !navigator.permissions.query) throw new Error(t("no Permissions API", "pas d'API Permissions"));
    var names = ["geolocation", "notifications", "camera", "microphone"];
    return Promise.all(
      names.map(function (n) {
        return navigator.permissions.query({ name: n }).then(
          function (r) {
            return n + "=" + r.state;
          },
          function () {
            return n + "=?";
          },
        );
      }),
    ).then(function (r) {
      add("caps", "perms", t("Permission states", "États des permissions"), r.join(" "), 1.5);
    });
  }

  function collectTimer() {
    var min = Infinity;
    var last = performance.now();
    var end = last + 25;
    while (last < end) {
      var now = performance.now();
      if (now > last && now - last < min) min = now - last;
      last = now;
    }
    var ms = isFinite(min) ? min : 0;
    add("caps", "timer", t("Timer resolution", "Résolution du timer"), ms >= 1 ? ms.toFixed(0) + " ms" : (ms * 1000).toFixed(0) + " µs", 1.5);
    return ms;
  }

  function collectClock() {
    if (!S.now) return;
    var skew = Date.now() - S.now;
    add("locale", "skew", t("Clock vs server", "Horloge vs serveur"), (skew > 0 ? "+" : "") + (skew / 1000).toFixed(1) + " s", 0, false);
    if (Math.abs(skew) > 120000)
      lie(
        "clock",
        "warn",
        t("Clock is off", "Horloge décalée"),
        t("Your system clock differs from the server by more than two minutes.", "L'horloge de ton système diffère du serveur de plus de deux minutes."),
      );
  }

  function collectAdblock() {
    return new Promise(function (resolve) {
      var bait = document.createElement("div");
      bait.className = "adsbox ad-banner ad-placement textads banner-ads pub_300x250";
      bait.style.cssText = "position:absolute;left:-9999px;width:10px;height:10px;";
      bait.innerHTML = "&nbsp;";
      document.body.appendChild(bait);
      setTimeout(function () {
        var blocked = !bait.offsetHeight || getComputedStyle(bait).display === "none" || getComputedStyle(bait).visibility === "hidden";
        document.body.removeChild(bait);
        add("caps", "adblock", t("Content blocker", "Bloqueur de contenu"), blocked ? t("detected", "détecté") : t("none detected", "non détecté"), 1.2);
        resolve();
      }, 120);
    });
  }

  function collectFeatures() {
    var checks = {
      WebGPU: !!navigator.gpu,
      WebAssembly: typeof WebAssembly === "object",
      SharedArrayBuffer: typeof SharedArrayBuffer === "function",
      Bluetooth: !!navigator.bluetooth,
      USB: !!navigator.usb,
      Serial: !!navigator.serial,
      HID: !!navigator.hid,
      MIDI: !!navigator.requestMIDIAccess,
      Gamepad: !!navigator.getGamepads,
      WebAuthn: !!window.PublicKeyCredential,
      Share: !!navigator.share,
      Wakelock: !!navigator.wakeLock,
      ServiceWorker: !!navigator.serviceWorker,
      "Speech recognition": !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      "View Transitions": !!document.startViewTransition,
      "Container queries": !!(window.CSS && CSS.supports && CSS.supports("container-type: inline-size")),
    };
    var names = Object.keys(checks);
    var on = names.filter(function (k) {
      return checks[k];
    });
    add("caps", "features", t("Web APIs present", "APIs web présentes"), on.length + "/" + names.length + " · " + on.join(", "), 3);
    return checks;
  }

  function detectEngine() {
    if (window.CSS && CSS.supports && CSS.supports("-moz-appearance", "none")) return "Gecko";
    if (navigator.userAgentData || window.chrome) return "Blink";
    if (window.GestureEvent || (navigator.vendor || "").indexOf("Apple") === 0) return "WebKit";
    return "unknown";
  }

  function collectMath() {
    var v = [Math.tan(-1e300), Math.sinh(1), Math.expm1(1), Math.cbrt(100), Math.atanh(0.5), Math.pow(Math.PI, -100)].join("|");
    return sha(v).then(function (h) {
      add("browser", "math", t("JS math quirks", "Particularités maths JS"), h.slice(0, 12) + " · " + detectEngine(), 3);
    });
  }


  /* DEEPER COLLECTORS */
  function collectNavigatorDeep() {
    var n = navigator;
    var own = Object.getOwnPropertyNames(n);
    var proto = Object.getOwnPropertyNames(Object.getPrototypeOf(n));
    return sha(own.join(",") + "|" + proto.join(",")).then(function (h) {
      add("browser", "navprops", t("Navigator properties", "Propriétés du navigator"), proto.length + " · " + h.slice(0, 12), 5);
      add("browser", "product", "product / productSub / vendorSub", [n.product, n.productSub, n.vendorSub || "-"].join(" / "), 1.5);
      if (n.buildID) add("browser", "buildid", "buildID", n.buildID, 3);
      add("browser", "java", "javaEnabled", typeof n.javaEnabled === "function" ? String(n.javaEnabled()) : "n/a", 0.2);
    });
  }

  function collectPlugins() {
    var names = [].slice.call(navigator.plugins || []).map(function (p) {
      return p.name;
    });
    var mimes = [].slice.call(navigator.mimeTypes || []).map(function (m) {
      return m.type;
    });
    add("browser", "plugins", t("Plugins", "Plugins"), names.length + (names.length ? " · " + names.slice(0, 3).join(", ") + (names.length > 3 ? "…" : "") : ""), 2);
    add("browser", "mimes", t("MIME types", "Types MIME"), mimes.length + " · " + fnv(mimes.join(",")), 2);
  }

  function collectEngineQuirks() {
    var msgs = [];
    var probes = [
      function () { null.x; },
      function () { undefined.y(); },
      function () { new Array(-1); },
      function () { (1).toFixed(101); },
      function () { JSON.parse("{"); },
      function () { decodeURIComponent("%"); },
    ];
    probes.forEach(function (f) {
      try {
        f();
      } catch (e) {
        msgs.push(String(e && e.message));
      }
    });
    return sha(msgs.join("|")).then(function (h) {
      add("browser", "errors", t("Error messages", "Messages d'erreur"), h.slice(0, 12), 2.5);
      add("browser", "evalen", "eval.toString().length", String(eval.toString().length), 1.2);
    });
  }

  var AUDIO_TYPES = ["audio/mpeg", 'audio/ogg; codecs="vorbis"', 'audio/ogg; codecs="opus"', 'audio/wav; codecs="1"', "audio/aac", "audio/flac", 'audio/webm; codecs="opus"', 'audio/mp4; codecs="mp4a.40.2"', "audio/x-m4a"];
  var VIDEO_TYPES = ['video/mp4; codecs="avc1.42E01E"', 'video/mp4; codecs="avc1.64001F"', 'video/mp4; codecs="hev1.1.6.L93.B0"', 'video/mp4; codecs="av01.0.05M.08"', 'video/webm; codecs="vp8"', 'video/webm; codecs="vp9"', 'video/webm; codecs="av01.0.05M.08"', 'video/ogg; codecs="theora"', "video/x-matroska"];

  function collectFormats() {
    var a = document.createElement("audio");
    var v = document.createElement("video");
    var ar = AUDIO_TYPES.map(function (m) { return a.canPlayType(m) || "no"; });
    var vr = VIDEO_TYPES.map(function (m) { return v.canPlayType(m) || "no"; });
    var yes = function (arr) { return arr.filter(function (x) { return x !== "no"; }).length; };
    add("caps", "audiofmt", t("Audio formats", "Formats audio"), yes(ar) + "/" + AUDIO_TYPES.length + " · " + fnv(ar.join("")), 3);
    add("caps", "videofmt", t("Video formats", "Formats vidéo"), yes(vr) + "/" + VIDEO_TYPES.length + " · " + fnv(vr.join("")), 3.5);
    if (window.MediaSource && MediaSource.isTypeSupported) {
      var mse = VIDEO_TYPES.map(function (m) { return MediaSource.isTypeSupported(m) ? 1 : 0; });
      add("caps", "mse", "MediaSource", mse.reduce(function (x, y) { return x + y; }, 0) + "/" + VIDEO_TYPES.length, 1);
    }
  }

  function collectAudioContext() {
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) throw new Error(t("no AudioContext", "pas d'AudioContext"));
    var ctx = new C();
    var d = ctx.destination;
    var info = [ctx.sampleRate, ctx.baseLatency, ctx.outputLatency, d.maxChannelCount, d.channelCount, d.channelCountMode].join(" / ");
    if (ctx.close) ctx.close();
    add("hardware", "audioctx", "AudioContext", info, 3);
  }

  function collectSensors() {
    var names = ["Accelerometer", "Gyroscope", "Magnetometer", "AbsoluteOrientationSensor", "AmbientLightSensor", "DeviceMotionEvent", "DeviceOrientationEvent"];
    var present = names.filter(function (k) { return k in window; });
    add("caps", "sensors", t("Sensor APIs", "APIs de capteurs"), present.length ? present.join(", ") : t("none", "aucune"), 2);
    var touchEvent = false;
    try {
      document.createEvent("TouchEvent");
      touchEvent = true;
    } catch (e) {}
    add("browser", "touchapi", t("Touch support", "Support tactile"), navigator.maxTouchPoints + " pts · TouchEvent=" + touchEvent + " · ontouchstart=" + ("ontouchstart" in window), 1.5);
  }

  function collectWindowChrome() {
    var bars = ["locationbar", "menubar", "personalbar", "statusbar", "toolbar", "scrollbars"].map(function (k) {
      return window[k] && window[k].visible ? 1 : 0;
    });
    add("display", "bars", t("Window bars", "Barres de la fenêtre"), bars.join(""), 1);
    add("display", "winpos", t("Window position", "Position de la fenêtre"), window.screenX + "," + window.screenY + " · " + t("avail", "dispo") + " " + (screen.availLeft || 0) + "," + (screen.availTop || 0), 0, false);
  }

  function collectWebGLDeep() {
    var cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 64;
    var gl = cv.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) throw new Error(t("WebGL unavailable", "WebGL indisponible"));
    var keys = ["MAX_VERTEX_UNIFORM_VECTORS", "MAX_FRAGMENT_UNIFORM_VECTORS", "MAX_VARYING_VECTORS", "MAX_TEXTURE_IMAGE_UNITS", "MAX_COMBINED_TEXTURE_IMAGE_UNITS", "MAX_CUBE_MAP_TEXTURE_SIZE", "ALIASED_POINT_SIZE_RANGE", "SUBPIXEL_BITS", "MAX_VERTEX_TEXTURE_IMAGE_UNITS", "RED_BITS", "GREEN_BITS", "BLUE_BITS", "ALPHA_BITS", "DEPTH_BITS", "STENCIL_BITS"];
    var vals = keys.map(function (k) {
      var v = gl.getParameter(gl[k]);
      return v && v.length !== undefined ? [].slice.call(v).join("-") : String(v);
    });
    var prec = [];
    [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach(function (sh) {
      [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT].forEach(function (pt) {
        var f = gl.getShaderPrecisionFormat(sh, pt);
        prec.push(f ? f.rangeMin + "." + f.rangeMax + "." + f.precision : "x");
      });
    });
    function shader(type, src) {
      var s2 = gl.createShader(type);
      gl.shaderSource(s2, src);
      gl.compileShader(s2);
      return s2;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, "attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.0,1.0);}"));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;void main(){gl_FragColor=vec4(sin(v.x*12.9898)*0.5+0.5,cos(v.y*78.233)*0.5+0.5,v.x*v.y,1.0);}"));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.9, -0.9, 0.9, -0.7, 0.0, 0.9]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    var px = new Uint8Array(64 * 64 * 4);
    gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, px);
    var sum = "";
    for (var i = 0; i < px.length; i += 61) sum += px[i] + ",";
    return Promise.all([sha(vals.join("|") + "#" + prec.join("|")), sha(sum)]).then(function (h) {
      add("hardware", "gl-deep", t("WebGL limits (full)", "Limites WebGL (complètes)"), h[0].slice(0, 12), 3);
      add("hardware", "gl-render", t("WebGL render", "Rendu WebGL"), h[1].slice(0, 12), 5);
    });
  }

  /* CHECKS */
  function uaOs(ua) {
    if (/Windows/.test(ua)) return "Windows";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
    if (/CrOS/.test(ua)) return "ChromeOS";
    if (/Linux|X11/.test(ua)) return "Linux";
    return "unknown";
  }

  function platformOs(p) {
    p = p || "";
    if (/^Win/i.test(p)) return "Windows";
    if (/^Mac/i.test(p)) return "macOS";
    if (/iPhone|iPad|iPod/i.test(p)) return "iOS";
    if (/Android/i.test(p)) return "Android";
    if (/CrOS/i.test(p)) return "ChromeOS";
    if (/Linux|X11/i.test(p)) return "Linux";
    return "unknown";
  }

  function uaEngine(ua) {
    if (/Firefox\//.test(ua)) return "Gecko";
    if (/Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua)) return "Blink";
    if (/Safari\//.test(ua)) return "WebKit";
    return "unknown";
  }

  function runChecks(ctx) {
    var ua = navigator.userAgent;
    var osUA = uaOs(ua);
    var osNav = platformOs((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform);
    var osMismatch = osUA !== "unknown" && osNav !== "unknown" && osUA !== osNav && !(osUA === "Android" && osNav === "Linux");
    lie(
      "os",
      osMismatch ? "bad" : "ok",
      t("User-Agent OS matches the real platform", "L'OS du User-Agent correspond à la plateforme"),
      osMismatch
        ? t("UA claims " + osUA + " but the platform says " + osNav + ": the UA is spoofed.", "Le UA annonce " + osUA + " mais la plateforme dit " + osNav + " : le UA est usurpé.")
        : osUA + " / " + osNav,
    );

    var eng = detectEngine();
    var engUA = uaEngine(ua);
    var engBad = eng !== "unknown" && engUA !== "unknown" && eng !== engUA;
    lie(
      "engine",
      engBad ? "bad" : "ok",
      t("Claimed engine matches the real engine", "Le moteur annoncé correspond au vrai moteur"),
      engBad ? t("UA says " + engUA + ", feature detection says " + eng + ".", "Le UA dit " + engUA + ", la détection de fonctionnalités dit " + eng + ".") : engUA + " / " + eng,
    );

    var mobileUA = /Mobi|Android|iPhone/.test(ua);
    var touchy = navigator.maxTouchPoints > 0 && screen.width < 900;
    lie(
      "mobile",
      mobileUA !== touchy && mobileUA ? "warn" : "ok",
      t("Mobile claim matches the hardware", "Le type d'appareil annoncé correspond au matériel"),
      (mobileUA ? "mobile UA" : "desktop UA") + " · " + navigator.maxTouchPoints + " touch · " + screen.width + "px",
    );

    var tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var tzIp = S.ipTimezone;
    if (tzIp) {
      var tzBad = tzBrowser !== tzIp;
      lie(
        "tz",
        tzBad ? "warn" : "ok",
        t("Browser timezone matches IP timezone", "Le fuseau du navigateur correspond à celui de l'IP"),
        tzBad
          ? t("Browser: " + tzBrowser + " · IP: " + tzIp + ". Classic VPN tell (or you are travelling).", "Navigateur : " + tzBrowser + " · IP : " + tzIp + ". Signe classique d'un VPN (ou tu voyages).")
          : tzBrowser,
      );
    }

    var accept = (S.languages && S.languages[0] && S.languages[0].tag.toLowerCase().split("-")[0]) || "";
    var jsLang = (navigator.language || "").toLowerCase().split("-")[0];
    if (accept) {
      var langBad = accept !== jsLang;
      lie(
        "lang",
        langBad ? "warn" : "ok",
        t("HTTP and JS languages agree", "Langues HTTP et JS cohérentes"),
        langBad ? "Accept-Language: " + accept + " · navigator.language: " + jsLang : accept,
      );
    }

    if (navigator.webdriver)
      lie("webdriver", "bad", t("Automation flag set", "Drapeau d'automatisation actif"), t("navigator.webdriver is true: you look like a bot (Selenium / Puppeteer / Playwright).", "navigator.webdriver est vrai : tu ressembles à un bot (Selenium / Puppeteer / Playwright)."));
    else lie("webdriver", "ok", t("Not flagged as automated", "Pas marqué comme automatisé"), "navigator.webdriver = false");

    var renderer = get("gpu") || "";
    var soft = /swiftshader|llvmpipe|software|microsoft basic render|virtualbox|vmware|parallels/i.test(renderer);
    if (renderer)
      lie(
        "gpu",
        soft ? "info" : "ok",
        t("Real GPU", "Vrai GPU"),
        soft ? t("Software rendering (" + renderer + "): a VM, a headless browser or a server.", "Rendu logiciel (" + renderer + ") : une VM, un navigateur headless ou un serveur.") : renderer,
      );

    var headless = /HeadlessChrome/.test(ua) || (/Chrome/.test(ua) && !window.chrome);
    lie("headless", headless ? "bad" : "ok", t("No headless-browser traces", "Aucune trace de navigateur headless"), headless ? t("The UA or missing window.chrome suggests headless mode.", "Le UA ou l'absence de window.chrome suggère le mode headless.") : "OK");

    var AUTO = ["callPhantom", "_phantom", "phantom", "__nightmare", "domAutomation", "domAutomationController", "_selenium", "__selenium_unwrapped", "__webdriver_evaluate", "__driver_evaluate", "__webdriver_script_fn", "__fxdriver_unwrapped", "_Selenium_IDE_Recorder", "calledSelenium", "__playwright", "__pw_manual", "__PW_inspect"];
    var autoHits = AUTO.filter(function (k) { return k in window; });
    Object.keys(document).forEach(function (k) {
      if (k.indexOf("$cdc_") === 0 || k.indexOf("$chrome_asyncScriptInfo") === 0) autoHits.push(k);
    });
    lie(
      "automation-globals",
      autoHits.length ? "bad" : "ok",
      t("No automation-tool traces", "Aucune trace d'outil d'automatisation"),
      autoHits.length ? t("Found: " + autoHits.join(", "), "Trouvé : " + autoHits.join(", ")) : t("Selenium / Playwright / Phantom / Nightmare probes are clean.", "Les sondes Selenium / Playwright / Phantom / Nightmare sont propres."),
    );

    if (navigator.buildID === "20181001000000")
      lie("buildid", "info", t("Frozen Firefox buildID", "buildID Firefox figé"), t("buildID 20181001000000 is the fixed value of Firefox resistFingerprinting.", "Le buildID 20181001000000 est la valeur fixe de resistFingerprinting de Firefox."));

    var timer = ctx.timer;
    if (timer >= 50)
      lie("rfp", "info", t("Fingerprint-resistance mode", "Mode anti-fingerprinting"), t("Timers are rounded to " + Math.round(timer) + " ms and the clock is probably UTC: Tor Browser / Firefox resistFingerprinting.", "Les timers sont arrondis à " + Math.round(timer) + " ms : Tor Browser / Firefox resistFingerprinting."));
    else if (tzBrowser === "UTC" && /en/.test(jsLang) && screen.width % 200 === 0 && screen.height % 100 === 0)
      lie("rfp", "info", t("Looks like Tor-style letterboxing", "Ressemble au letterboxing de Tor"), t("UTC timezone and round screen dimensions.", "Fuseau UTC et dimensions d'écran arrondies."));

    var devtools = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 200;
    if (devtools && !/Mobi|Android/.test(ua))
      lie("devtools", "info", t("DevTools probably open", "DevTools probablement ouverts"), t("The window is much bigger than its viewport: a docked inspector, hopefully hunting flags.", "La fenêtre est bien plus grande que son viewport : un inspecteur ancré, à la chasse aux flags j'espère."));
  }

  function runInference(ctx) {
    var out = [];
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var hour = new Date().getHours();
    var gpu = get("gpu") || "";
    var os = uaOs(navigator.userAgent);

    out.push(
      t("It is ", "Il est ") + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + t(" in " + tz + (hour >= 23 || hour < 5 ? ": a night owl, or a different shift." : hour < 9 ? ": early start." : hour < 18 ? ": working hours, are you supposed to be browsing portfolios?" : "."), " (" + tz + ")" + (hour >= 23 || hour < 5 ? " : oiseau de nuit, ou autre quart." : hour < 9 ? " : tôt ce matin." : hour < 18 ? " : heures de bureau, tu devrais travailler ?" : ".")),
    );

    if (gpu) {
      var disc = /nvidia|geforce|rtx|gtx|radeon rx|radeon pro|arc a/i.test(gpu);
      var apple = /apple/i.test(gpu);
      var integ = /intel|uhd|iris|radeon graphics|vega|adreno|mali|powervr/i.test(gpu);
      out.push(
        disc
          ? t("A dedicated GPU (" + gpu.split("(")[0].trim() + "): gamer, creator, or just someone who likes fast things.", "Un GPU dédié (" + gpu.split("(")[0].trim() + ") : gamer, créateur, ou amateur de vitesse.")
          : apple
            ? t("Apple silicon, a unified-memory machine and probably a good keyboard.", "Apple silicon, mémoire unifiée et sûrement un bon clavier.")
            : integ
              ? t("An integrated GPU: a laptop or a small form factor, built for efficiency over frames.", "Un GPU intégré : un portable ou un mini-PC, l'efficacité avant les images par seconde.")
              : t("GPU: " + gpu, "GPU : " + gpu),
      );
    }

    var layout = get("keyboard");
    if (layout && layout.indexOf("AZERTY") === 0) out.push(t("AZERTY keyboard: francophone, most likely France or Belgium.", "Clavier AZERTY : francophone, très probablement France ou Belgique."));
    else if (layout && /alternative|BÉPO|Dvorak/.test(layout)) out.push(t("A non-QWERTY layout (" + layout + "): you type for a living, or for fun.", "Une disposition non-QWERTY (" + layout + ") : tu tapes pour vivre, ou pour le plaisir."));

    var f = get("fonts") || "";
    if (/Segoe UI|Calibri|Consolas/.test(f)) out.push(t("Microsoft fonts installed: Windows (or a Windows font pack).", "Polices Microsoft installées : Windows (ou un pack de polices)."));
    else if (/Ubuntu|DejaVu|Liberation|Cantarell|Noto/.test(f)) out.push(t("Linux-flavoured font stack: Ubuntu / DejaVu / Liberation.", "Pile de polices typique Linux : Ubuntu / DejaVu / Liberation."));
    else if (/Helvetica Neue|Menlo|SF Pro/.test(f)) out.push(t("Apple system fonts: macOS or iOS.", "Polices système Apple : macOS ou iOS."));
    if (/Fira Code|JetBrains Mono|Source Code Pro|Hack/.test(f)) out.push(t("Coding fonts installed (" + (f.match(/Fira Code|JetBrains Mono|Source Code Pro|Hack/) || [""])[0] + "): you write code.", "Polices de code installées (" + (f.match(/Fira Code|JetBrains Mono|Source Code Pro|Hack/) || [""])[0] + ") : tu écris du code."));
    if (/Adobe Garamond|Minion|Myriad/.test(f)) out.push(t("Adobe fonts: design or print work.", "Polices Adobe : du design ou de l'impression."));

    if (get("adblock") && get("adblock").indexOf("detected") === 0 || get("adblock") === "détecté")
      out.push(t("A content blocker is running: you care about what loads on your machine.", "Un bloqueur de contenu tourne : tu fais attention à ce qui se charge chez toi."));
    if (navigator.globalPrivacyControl || navigator.doNotTrack === "1") out.push(t("You sent a Do-Not-Track / GPC signal. Nobody honours it, but it is a statement.", "Tu as envoyé un signal Do-Not-Track / GPC. Personne ne le respecte, mais c'est un message."));
    if (ctx.timer >= 50) out.push(t("Fingerprint-resistance is on. Respect, and you are in a very small crowd.", "L'anti-fingerprinting est actif. Respect, et vous êtes très peu nombreux."));
    if (os === "Linux" && !/Android/.test(navigator.userAgent)) out.push(t("Linux desktop. I do not need more than that to know we would get along.", "Linux de bureau. Rien de plus à savoir, on va s'entendre."));
    var m = get("media");
    if (m && /^0 cam/.test(m)) out.push(t("No camera is visible to the browser: desktop without a webcam, privacy switch, or blocked.", "Aucune caméra visible par le navigateur : pas de webcam, interrupteur de confidentialité, ou bloquée."));
    if (mq("(prefers-color-scheme: dark)")) out.push(t("Dark mode. Statistically correlates with security people, and with sleeping less.", "Mode sombre. Corrélé aux profils sécu, et à dormir moins."));
    infer = out;
  }

  var ICONS = {
  "net": "<rect x=\"16\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\" /> <rect x=\"2\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\" /> <rect x=\"9\" y=\"2\" width=\"6\" height=\"6\" rx=\"1\" /> <path d=\"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3\" /> <path d=\"M12 12V8\" />",
  "browser": "<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" /> <path d=\"M10 4v4\" /> <path d=\"M2 8h20\" /> <path d=\"M6 4v4\" />",
  "display": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /> <line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />",
  "hardware": "<path d=\"M12 20v2\" /> <path d=\"M12 2v2\" /> <path d=\"M17 20v2\" /> <path d=\"M17 2v2\" /> <path d=\"M2 12h2\" /> <path d=\"M2 17h2\" /> <path d=\"M2 7h2\" /> <path d=\"M20 12h2\" /> <path d=\"M20 17h2\" /> <path d=\"M20 7h2\" /> <path d=\"M7 20v2\" /> <path d=\"M7 2v2\" /> <rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" /> <rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"1\" />",
  "locale": "<path d=\"m5 8 6 6\" /> <path d=\"m4 14 6-6 2-3\" /> <path d=\"M2 5h12\" /> <path d=\"M7 2h1\" /> <path d=\"m22 22-5-10-5 10\" /> <path d=\"M14 18h6\" />",
  "prefs": "<path d=\"M10 5H3\" /> <path d=\"M12 19H3\" /> <path d=\"M14 3v4\" /> <path d=\"M16 17v4\" /> <path d=\"M21 12h-9\" /> <path d=\"M21 19h-5\" /> <path d=\"M21 5h-7\" /> <path d=\"M8 10v4\" /> <path d=\"M8 12H3\" />",
  "caps": "<path d=\"M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z\" />",
  "lies": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /> <path d=\"M12 8v4\" /> <path d=\"M12 16h.01\" />",
  "infer": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\" /> <path d=\"M9 18h6\" /> <path d=\"M10 22h4\" />",
  "fp": "<path d=\"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4\" /> <path d=\"M14 13.12c0 2.38 0 6.38-1 8.88\" /> <path d=\"M17.29 21.02c.12-.6.43-2.3.5-3.02\" /> <path d=\"M2 12a10 10 0 0 1 18-6\" /> <path d=\"M2 16h.01\" /> <path d=\"M21.8 16c.2-2 .131-5.354 0-6\" /> <path d=\"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2\" /> <path d=\"M8.65 22c.21-.66.45-1.32.57-2\" /> <path d=\"M9 6.8a6 6 0 0 1 9 5.2v2\" />",
  "behavior": "<path d=\"M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z\" />",
  "check": "<path d=\"M20 6 9 17l-5-5\" />",
  "warn": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />",
  "bad": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m15 9-6 6\" /> <path d=\"m9 9 6 6\" />",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 16v-4\" /> <path d=\"M12 8h.01\" />"
};
  function ico(name, cls) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block shrink-0 ' + (cls || '') + '" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* RENDERING */
  var GROUPS = [
    ["net", t("Network & request", "Réseau & requête")],
    ["browser", t("Browser", "Navigateur")],
    ["display", t("Display", "Affichage")],
    ["hardware", t("Hardware fingerprints", "Empreintes matérielles")],
    ["locale", t("Locale & input", "Locale & saisie")],
    ["prefs", t("Preferences", "Préférences")],
    ["caps", t("Capabilities", "Capacités")],
  ];

  function bitsClass(b) {
    return b >= 5 ? "text-amber-500" : b >= 3 ? "text-foreground" : "text-muted-foreground";
  }

  function valueHtml(r) {
    if (r.v === "true" || r.v === "false") {
      var yes = r.v === "true";
      return '<span class="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ' + (yes ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground") + '">' + (yes ? t("yes", "oui") : t("no", "non")) + "</span>";
    }
    return '<span class="font-mono text-xs break-all">' + esc(r.v) + "</span>";
  }

  function rowHtml(r) {
    return (
      '<li class="grid grid-cols-[7.5rem_1fr_auto] items-baseline gap-x-3 border-b border-border py-2 first:pt-0 last:border-0 last:pb-0">' +
      '<span class="text-xs text-muted-foreground">' + esc(r.l) + "</span>" +
      "<span>" + valueHtml(r) + "</span>" +
      (r.b ? '<span class="font-mono text-[10px] ' + bitsClass(r.b) + '" title="' + esc(t("estimated identifying information", "information identifiante estimée")) + '">+' + r.b.toFixed(1) + "</span>" : "<span></span>") +
      "</li>"
    );
  }

  function cardHtml(icon, title, body, badge) {
    return (
      '<section class="card">' +
      '<h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">' +
      ico(icon, "text-muted-foreground") + esc(title) +
      (badge ? '<span class="ml-auto">' + badge + "</span>" : "") +
      "</h3>" + body + "</section>"
    );
  }

  function groupsHtml() {
    return GROUPS.map(function (g) {
      var items = rows.filter(function (r) {
        return r.g === g[0];
      });
      if (!items.length) return "";
      return cardHtml(g[0], g[1], "<ul>" + items.map(rowHtml).join("") + "</ul>", '<span class="font-mono text-[10px] text-muted-foreground">' + items.length + "</span>");
    }).join("");
  }

  var LIE_STYLE = {
    ok: ["check", "text-green-500"],
    warn: ["warn", "text-amber-500"],
    bad: ["bad", "text-destructive"],
    info: ["info", "text-sky-500"],
  };

  function liesHtml() {
    var order = { bad: 0, warn: 1, info: 2, ok: 3 };
    var sorted = lies.slice().sort(function (a, b) {
      return order[a.level] - order[b.level];
    });
    var flagged = lies.filter(function (l) {
      return l.level === "bad" || l.level === "warn";
    }).length;
    var badge = flagged
      ? '<span class="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-500">' + flagged + " " + t("flagged", "signalé(s)") + "</span>"
      : '<span class="rounded bg-green-500/15 px-1.5 py-0.5 text-[11px] font-medium text-green-500">' + t("consistent", "cohérent") + "</span>";
    var body =
      '<p class="mb-3 text-xs text-muted-foreground">' +
      esc(t("What your browser claims versus what it actually does.", "Ce que ton navigateur annonce face à ce qu'il fait vraiment.")) +
      "</p>" +
      '<ul class="space-y-3">' +
      sorted.map(function (l) {
        var st = LIE_STYLE[l.level];
        return '<li class="flex gap-2.5"><span class="' + st[1] + ' mt-0.5">' + ico(st[0]) + '</span><div class="min-w-0"><div class="text-sm font-medium leading-snug">' + esc(l.title) + '</div><div class="break-words text-xs text-muted-foreground">' + esc(l.detail) + "</div></div></li>";
      }).join("") +
      "</ul>" +
      rtcHtml();
    return cardHtml("lies", t("Lie detector", "Détecteur de mensonges"), body, badge);
  }

  function rtcHtml() {
    if (rtcState === "idle")
      return (
        '<div class="mt-4 space-y-2 border-t border-border pt-3"><p class="text-xs text-muted-foreground">' +
        esc(t("Optional: WebRTC can reveal your real public IP behind a VPN. It contacts Google's public STUN server, the only request on this page that leaves your browser.", "Optionnel : WebRTC peut révéler ta vraie IP publique derrière un VPN. Cela contacte le serveur STUN public de Google, la seule requête de cette page qui quitte ton navigateur.")) +
        '</p><button type="button" id="scan-rtc" class="btn btn-secondary">' + esc(t("Run WebRTC leak test", "Lancer le test de fuite WebRTC")) + "</button></div>"
      );
    if (rtcState === "running") return '<p class="mt-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">' + esc(t("gathering ICE candidates…", "collecte des candidats ICE…")) + "</p>";
    return "";
  }

  var SIZE_TOTAL = 33;

  function entropyHtml(idHash) {
    var stable = rows.filter(function (r) {
      return r.s && r.b > 0;
    });
    var raw = stable.reduce(function (s, r) {
      return s + r.b;
    }, 0);
    var total = SIZE_TOTAL * (1 - Math.exp(-raw / 55));
    var top = stable
      .slice()
      .sort(function (a, b) {
        return b.b - a.b;
      })
      .slice(0, 8);
    var max = top.length ? top[0].b : 1;
    var unique = total >= 29;
    var verdict = unique
      ? t("Statistically unique among everyone online.", "Statistiquement unique parmi toutes les personnes connectées.")
      : t("Roughly 1 in " + Math.round(Math.pow(2, total)).toLocaleString(), "Environ 1 sur " + Math.round(Math.pow(2, total)).toLocaleString());
    var pct = Math.min(100, Math.round((total / SIZE_TOTAL) * 100));
    return (
      '<section class="card-primary">' +
      '<div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">' +
      "<div class=\"space-y-4\">" +
      '<h3 class="flex items-center gap-2 text-sm font-semibold">' + ico("fp") + esc(t("Your fingerprint", "Ton empreinte")) + "</h3>" +
      '<div><div class="text-xs opacity-60">' + esc(t("Fingerprint ID", "ID d'empreinte")) + '</div><div class="break-all font-mono text-2xl tracking-wider">' + esc(idHash) + "</div></div>" +
      '<div><div class="mb-1 flex items-baseline justify-between"><span class="text-xs opacity-60">' + esc(t("Estimated entropy", "Entropie estimée")) + '</span><span class="font-mono text-sm">~' + total.toFixed(0) + " bits</span></div>" +
      '<div class="h-2 overflow-hidden rounded bg-primary-foreground/15"><div class="h-full rounded ' + (unique ? "bg-amber-400" : "bg-green-400") + '" style="width:' + pct + '%"></div></div></div>' +
      '<p class="text-sm font-medium">' + esc(verdict) + "</p>" +
      "</div>" +
      '<div class="space-y-1.5">' +
      '<div class="mb-2 text-xs opacity-60">' + esc(t("Biggest contributors (bits)", "Plus gros contributeurs (bits)")) + "</div>" +
      top.map(function (r) {
        return '<div class="flex items-center gap-2 text-xs"><span class="w-32 shrink-0 truncate opacity-70">' + esc(r.l) + '</span><div class="h-1.5 flex-1 overflow-hidden rounded bg-primary-foreground/15"><div class="h-full rounded bg-primary-foreground/80" style="width:' + Math.round((r.b / max) * 100) + '%"></div></div><span class="w-8 text-right font-mono opacity-70">' + r.b.toFixed(1) + "</span></div>";
      }).join("") +
      "</div></div>" +
      '<p class="mt-5 border-t border-primary-foreground/15 pt-3 text-xs opacity-60">' +
      esc(t("Bars are ballpark estimates from public fingerprinting studies. Attributes are correlated, so the total uses a saturating model rather than a plain sum. The ID hashes stable attributes only: reload, or open a private window, and compare.", "Les barres sont des estimations issues d'études publiques. Les attributs sont corrélés : le total suit un modèle saturant plutôt qu'une simple somme. L'ID hashe uniquement les attributs stables : recharge, ou ouvre une fenêtre privée, et compare.")) +
      "</p></section>"
    );
  }

  function inferHtml() {
    if (!infer.length) return "";
    return cardHtml(
      "infer",
      t("What I can deduce", "Ce que j'en déduis"),
      '<ul class="space-y-2.5 text-sm">' +
        infer.map(function (s) {
          return '<li class="flex gap-2"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50"></span><span>' + esc(s) + "</span></li>";
        }).join("") +
        "</ul>",
    );
  }

  var resultsEl = document.getElementById("scan-results");
  var idHash = "";

  function render() {
    if (!resultsEl) return;
    resultsEl.innerHTML =
      entropyHtml(idHash) +
      '<div class="columns-1 gap-6 lg:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid">' + liesHtml() + inferHtml() + groupsHtml() + "</div>";
    resultsEl.classList.remove("hidden");
    var btn = document.getElementById("scan-rtc");
    if (btn) btn.addEventListener("click", runRtc);
  }

  /* WEBRTC (opt-in) */
  function runRtc() {
    if (!window.RTCPeerConnection) {
      rtcState = "done";
      lie("rtc", "info", "WebRTC", t("Not available in this browser.", "Indisponible dans ce navigateur."));
      render();
      return;
    }
    rtcState = "running";
    render();
    var found = {};
    var pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      try {
        pc.close();
      } catch (e) {}
      var pub = Object.keys(found);
      rtcState = "done";
      if (!pub.length) {
        lie("rtc", "info", t("WebRTC leak test", "Test de fuite WebRTC"), t("No public candidate returned (WebRTC blocked or UDP filtered).", "Aucun candidat public (WebRTC bloqué ou UDP filtré)."));
      } else {
        var same = pub.indexOf(S.ip) !== -1;
        add("net", "rtc", t("WebRTC public IPs", "IP publiques WebRTC"), pub.join(", "), 0, false);
        lie(
          "rtc",
          same ? "ok" : "bad",
          t("WebRTC agrees with the HTTP IP", "WebRTC correspond à l'IP HTTP"),
          same ? pub.join(", ") : t("HTTP sees " + S.ip + " but WebRTC sees " + pub.join(", ") + ": a VPN leak, or split tunnelling.", "HTTP voit " + S.ip + " mais WebRTC voit " + pub.join(", ") + " : fuite VPN, ou split tunnelling."),
        );
      }
      render();
    }
    pc.onicecandidate = function (e) {
      if (!e.candidate) return finish();
      var parts = e.candidate.candidate.split(" ");
      if (parts[7] === "srflx" && parts[4]) found[parts[4]] = 1;
    };
    pc.createDataChannel("x");
    pc.createOffer().then(function (o) {
      return pc.setLocalDescription(o);
    }).catch(finish);
    setTimeout(finish, 4000);
  }

  /* BEHAVIOR */
  var B = { moves: 0, turns: 0, dist: 0, speeds: [], lastX: null, lastY: null, lastT: 0, lastAng: null, keys: 0, keyTimes: [], scrolls: 0, touches: 0, untrusted: 0, start: performance.now() };

  function std(arr) {
    if (arr.length < 2) return 0;
    var m = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
    return Math.sqrt(arr.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / arr.length);
  }
  function mean(arr) {
    return arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0;
  }

  function behaviorScore() {
    var score = 0;
    var parts = [];
    var mouseOk = (B.moves >= 30 && B.turns >= 5) || B.touches >= 3;
    var cv = mean(B.speeds) ? std(B.speeds) / mean(B.speeds) : 0;
    var speedOk = B.speeds.length >= 20 && cv > 0.5;
    var intervals = [];
    for (var i = 1; i < B.keyTimes.length; i++) intervals.push(B.keyTimes[i] - B.keyTimes[i - 1]);
    var keyOk = intervals.length >= 8 && mean(intervals) > 0 && std(intervals) / mean(intervals) > 0.25;
    var scrollOk = B.scrolls >= 2;
    if (mouseOk) { score += 25; parts.push("path"); }
    if (speedOk) { score += 25; parts.push("speed"); }
    if (keyOk) { score += 25; parts.push("rhythm"); }
    if (scrollOk) { score += 25; parts.push("scroll"); }
    if (B.untrusted) score = 0;
    return { score: score, intervals: intervals, cv: cv };
  }

  function behaviorShell() {
    var el = document.getElementById("scan-behavior");
    if (!el) return;
    el.classList.remove("hidden");
    el.innerHTML =
      '<h3 class="flex items-center gap-2 text-sm font-semibold">' + ico("behavior", "text-muted-foreground") + esc(t("Behavioural biometrics", "Biométrie comportementale")) + "</h3>" +
      '<p class="text-xs text-muted-foreground">' + esc(t("Move your mouse, scroll, and type a sentence below. Sites use movement curves and keystroke rhythm to tell humans from bots, and sometimes to recognise you. Nothing leaves this page.", "Bouge la souris, scrolle et tape une phrase ci-dessous. Les sites utilisent les trajectoires et le rythme de frappe pour distinguer humains et bots, et parfois pour te reconnaître. Rien ne quitte cette page.")) + "</p>" +
      '<textarea id="scan-type" rows="2" class="w-full rounded border border-border bg-background p-2 text-sm font-mono" placeholder="' + esc(t("type something here…", "tape quelque chose ici…")) + '"></textarea>' +
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono" id="scan-bstats"></div>' +
      '<div><div class="flex justify-between text-xs mb-1"><span class="text-muted-foreground">' + esc(t("Human-likeness (toy model)", "Humanité (modèle jouet)")) + '</span><span id="scan-bscore">0%</span></div><div class="h-2 rounded bg-muted overflow-hidden"><div id="scan-bbar" class="h-full bg-green-500 transition-all" style="width:0%"></div></div></div>';
    refreshBehavior();
  }

  var bRaf = false;
  function refreshBehavior() {
    if (bRaf) return;
    bRaf = true;
    requestAnimationFrame(function () {
      bRaf = false;
      var stats = document.getElementById("scan-bstats");
      if (!stats) return;
      var r = behaviorScore();
      var iv = r.intervals;
      var cells = [
        [t("mouse moves", "mouvements"), B.moves],
        [t("direction changes", "changements de direction"), B.turns],
        [t("avg speed px/s", "vitesse moy. px/s"), Math.round(mean(B.speeds))],
        [t("scroll events", "défilements"), B.scrolls],
        [t("keystrokes", "frappes"), B.keys],
        [t("avg key gap ms", "écart moy. touches ms"), Math.round(mean(iv))],
        [t("rhythm σ ms", "rythme σ ms"), Math.round(std(iv))],
        [t("synthetic events", "événements synthétiques"), B.untrusted],
      ];
      stats.innerHTML = cells.map(function (c) {
        return '<div><div class="text-muted-foreground">' + esc(c[0]) + '</div><div class="text-base">' + c[1] + "</div></div>";
      }).join("");
      document.getElementById("scan-bscore").textContent = r.score + "%";
      document.getElementById("scan-bbar").style.width = r.score + "%";
    });
  }

  function bindBehavior() {
    function trust(e) {
      if (e.isTrusted === false) B.untrusted++;
    }
    document.addEventListener("mousemove", function (e) {
      trust(e);
      var now = performance.now();
      if (B.lastX !== null) {
        var dx = e.clientX - B.lastX;
        var dy = e.clientY - B.lastY;
        var d = Math.sqrt(dx * dx + dy * dy);
        var dt = now - B.lastT;
        if (d > 0 && dt > 0) {
          B.moves++;
          B.dist += d;
          if (dt < 200) B.speeds.push((d / dt) * 1000);
          if (B.speeds.length > 400) B.speeds.shift();
          var ang = Math.atan2(dy, dx);
          if (B.lastAng !== null) {
            var diff = Math.abs(ang - B.lastAng);
            if (diff > Math.PI) diff = 2 * Math.PI - diff;
            if (diff > 0.35) B.turns++;
          }
          B.lastAng = ang;
        }
      }
      B.lastX = e.clientX;
      B.lastY = e.clientY;
      B.lastT = now;
      refreshBehavior();
    }, { passive: true });
    document.addEventListener("scroll", function () { B.scrolls++; refreshBehavior(); }, { passive: true });
    document.addEventListener("touchmove", function (e) { trust(e); B.touches++; refreshBehavior(); }, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (!e.target || e.target.id !== "scan-type") return;
      trust(e);
      B.keys++;
      B.keyTimes.push(performance.now());
      if (B.keyTimes.length > 200) B.keyTimes.shift();
      refreshBehavior();
    });
  }

  /* RUN */
  function run() {
    log("$ ./scan --deep --no-upload", "ok");
    log(t("// everything below is computed locally in your browser", "// tout est calculé localement dans ton navigateur"));
    var ctx = { timer: 0 };

    var jobs = [
      task("network & headers", collectNetwork),
      task("navigator", collectNavigator),
      task("client hints", collectHighEntropy),
      task("display & media queries", collectDisplay),
      task("locale & Intl", collectLocale),
      task("canvas", collectCanvas),
      task("WebGL", collectWebGL),
      task("WebGPU", collectWebGPU),
      task("audio", collectAudio),
      task("fonts", collectFonts),
      task("media devices", collectMedia),
      task("storage", collectStorage),
      task("battery", collectBattery),
      task("speech voices", collectVoices),
      task("keyboard layout", collectKeyboard),
      task("permissions", collectPermissions),
      task("timers", function () { ctx.timer = collectTimer(); }),
      task("clock skew", collectClock),
      task("content blocker", collectAdblock),
      task("web APIs", collectFeatures),
      task("JS engine", collectMath),
      task("navigator internals", collectNavigatorDeep),
      task("plugins & MIME types", collectPlugins),
      task("engine quirks", collectEngineQuirks),
      task("audio & video formats", collectFormats),
      task("audio context", collectAudioContext),
      task("sensors & touch", collectSensors),
      task("window chrome", collectWindowChrome),
      task("WebGL render", collectWebGLDeep),
    ];

    Promise.all(jobs).then(function () {
      runChecks(ctx);
      runInference(ctx);
      var stable = rows.filter(function (r) { return r.s; }).map(function (r) { return r.id + "=" + r.v; }).sort().join("\n");
      return sha(stable).then(function (h) {
        idHash = h.slice(0, 16).toUpperCase();
        log("[done] fingerprint " + idHash + " · " + rows.length + " " + t("attributes", "attributs") + " · 0 " + t("bytes uploaded", "octet envoyé"), "ok");
        render();
        behaviorShell();
      });
    });
  }

  bindBehavior();
  run();

  /* OPT-IN MAP */
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-load-frame]") : null;
    if (!el) return;
    var holder = document.getElementById(el.getAttribute("data-load-frame"));
    if (!holder) return;
    var f = document.createElement("iframe");
    f.src = holder.getAttribute("data-src");
    f.width = "100%";
    f.height = "300";
    f.className = "block border-t border-border";
    holder.innerHTML = "";
    holder.appendChild(f);
  });
})();
