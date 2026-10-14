import type { Translate } from "../shared/i18n";
import type { ScanState } from "./state";

export const parseSrflx = (candidate: string): string | null => {
  const parts = candidate.split(" ");
  return parts[7] === "srflx" && parts[4] ? parts[4] : null;
};

export const applyRtcResult = (state: ScanState, publicIps: string[], httpIp: string, t: Translate): void => {
  state.rtc = "done";
  if (!publicIps.length) {
    state.lie("rtc", "info", t("WebRTC leak test", "Test de fuite WebRTC"), t("No public candidate returned (WebRTC blocked or UDP filtered).", "Aucun candidat public (WebRTC bloqué ou UDP filtré)."));
    return;
  }
  const same = publicIps.includes(httpIp);
  state.add("net", "rtc", t("WebRTC public IPs", "IP publiques WebRTC"), publicIps.join(", "), 0, false);
  state.lie(
    "rtc",
    same ? "ok" : "bad",
    t("WebRTC agrees with the HTTP IP", "WebRTC correspond à l'IP HTTP"),
    same ? publicIps.join(", ") : t(`HTTP sees ${httpIp} but WebRTC sees ${publicIps.join(", ")}: a VPN leak, or split tunnelling.`, `HTTP voit ${httpIp} mais WebRTC voit ${publicIps.join(", ")} : fuite VPN, ou split tunnelling.`),
  );
};

export const gatherPublicIps = (timeoutMs = 4000): Promise<string[]> =>
  new Promise((resolve) => {
    if (!window.RTCPeerConnection) return resolve([]);
    const found = new Set<string>();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        pc.close();
      } catch {
        /* already closed */
      }
      resolve([...found]);
    };
    pc.onicecandidate = (e) => {
      if (!e.candidate) return finish();
      const ip = parseSrflx(e.candidate.candidate);
      if (ip) found.add(ip);
    };
    pc.createDataChannel("x");
    pc.createOffer().then((o) => pc.setLocalDescription(o)).catch(finish);
    setTimeout(finish, timeoutMs);
  });
