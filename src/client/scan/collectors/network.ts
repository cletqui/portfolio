import type { Collector } from "./context";

export const collectNetwork: Collector = ({ state, t, signals }) => {
  const n = signals.net;
  state.add("net", "ip", "IP", signals.ip, 0, false);
  state.add("net", "colo", t("Edge location", "Point de présence"), n.colo, 0, false);
  if (n.asn) state.add("net", "asn", "ASN", `AS${n.asn}${n.asOrganization ? " · " + n.asOrganization : ""}`, 3);
  state.add("net", "http", "HTTP", n.httpProtocol, 1);
  if (n.tlsVersion) state.add("net", "tls", "TLS", n.tlsVersion + (n.tlsCipher ? " · " + n.tlsCipher : ""), 2);
  state.add("net", "tlsext", t("TLS extensions hash", "Hash des extensions TLS"), n.tlsExtensionsSha1, 6);
  if (n.tcpRtt) state.add("net", "rtt", t("TCP round-trip", "Aller-retour TCP"), `${n.tcpRtt} ms`, 0, false);
  if (signals.languages.length)
    state.add("net", "accept-lang", "Accept-Language", signals.languages.map((l) => l.tag + (l.q < 1 ? `;q=${l.q}` : "")).join(", "), 5);
};
