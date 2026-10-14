import { byId, prefersReducedMotion, readJson } from "../shared/dom";
import { asLang, makeT } from "../shared/i18n";
import { initBehaviorPanel } from "./behavior";
import { runChecks } from "./checks";
import { runCollectors, runTask, type TaskReport } from "./collectors";
import type { Ctx } from "./collectors/context";
import { collectTimer } from "./collectors/system";
import { fingerprintId } from "./entropy";
import { snapshotEnv } from "./env";
import { runInference } from "./inference";
import { TerminalLog } from "./log";
import { inferHtml, resultsHtml } from "./render";
import { applyRtcResult, gatherPublicIps } from "./rtc";
import { ScanState } from "./state";
import { emptySignals, type ServerSignals } from "./types";

const initFrameLoader = (): void => {
  document.addEventListener("click", (e) => {
    const trigger = (e.target as Element | null)?.closest?.("[data-load-frame]");
    const holder = trigger && byId(trigger.getAttribute("data-load-frame") ?? "");
    if (!holder) return;
    const frame = document.createElement("iframe");
    frame.src = holder.getAttribute("data-src") ?? "";
    frame.width = "100%";
    frame.height = "300";
    frame.className = "block border-t border-border";
    holder.textContent = "";
    holder.appendChild(frame);
  });
};

const boot = async (): Promise<void> => {
  const root = byId("scan");
  if (!root) return;
  const lang = asLang(root.dataset.lang);
  const t = makeT(lang);
  const signals = readJson<ServerSignals>("server-signals", emptySignals);
  const state = new ScanState();
  const log = new TerminalLog(byId("scan-log"), prefersReducedMotion() ? 0 : 45);
  const resultsEl = byId("scan-results");
  const ctx: Ctx = { state, t, signals };
  let fingerprint = "";

  const render = () => {
    if (!resultsEl) return;
    resultsEl.innerHTML = resultsHtml(state, fingerprint, t);
    resultsEl.classList.remove("hidden");
    const infer = byId("scan-infer");
    if (infer) {
      infer.innerHTML = inferHtml(state, t);
      infer.classList.toggle("hidden", !state.infer.length);
    }
    byId("scan-rtc")?.addEventListener("click", async () => {
      state.rtc = "running";
      render();
      applyRtcResult(state, await gatherPublicIps(), signals.ip, t);
      render();
    });
  };

  const report: TaskReport = (name, ok, error) => log.push(ok ? `[ ok ] ${name}` : `[skip] ${name} — ${error}`, ok ? "ok" : "warn");

  log.push("$ ./scan --deep --no-upload", "ok");
  log.push(t("// everything below is computed locally in your browser", "// tout est calculé localement dans ton navigateur"));

  let timer = 0;
  await Promise.all([runTask("timers", () => void (timer = collectTimer(ctx)), report), runCollectors(ctx, report)]);

  const env = snapshotEnv();
  runChecks(state, signals, env, timer, t);
  state.infer = runInference(state, env, timer, t);
  fingerprint = await fingerprintId(state.rows);
  log.push(`[done] fingerprint ${fingerprint} · ${state.rows.length} ${t("attributes", "attributs")} · 0 ${t("bytes uploaded", "octet envoyé")}`, "ok");
  render();

  const panel = byId("scan-behavior");
  if (panel) initBehaviorPanel(panel, t);
};

initFrameLoader();
void boot();
