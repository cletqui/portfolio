import { fnv, sha } from "../../shared/hash";
import { unavailable, type Collector } from "./context";

type AudioCtor = typeof AudioContext;
type OfflineCtor = typeof OfflineAudioContext;
interface AudioWindow {
  AudioContext?: AudioCtor;
  webkitAudioContext?: AudioCtor;
  OfflineAudioContext?: OfflineCtor;
  webkitOfflineAudioContext?: OfflineCtor;
  MediaSource?: { isTypeSupported(type: string): boolean };
}
const aw = (): AudioWindow => window as unknown as AudioWindow;

export const collectAudio: Collector = async ({ state, t }) => {
  const Ctx = aw().OfflineAudioContext ?? aw().webkitOfflineAudioContext;
  if (!Ctx) return unavailable(t("no OfflineAudioContext", "pas d'OfflineAudioContext"));
  const ctx = new Ctx(1, 44100, 44100);
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 10000;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -50;
  comp.knee.value = 40;
  comp.ratio.value = 12;
  comp.attack.value = 0;
  comp.release.value = 0.25;
  osc.connect(comp);
  comp.connect(ctx.destination);
  osc.start(0);
  const data = (await ctx.startRendering()).getChannelData(0);
  let sum = 0;
  for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]!);
  state.add("hardware", "audio", t("Audio stack", "Pile audio"), (await sha(String(sum))).slice(0, 16), 5);
};

export const collectAudioContext: Collector = ({ state, t }) => {
  const Ctx = aw().AudioContext ?? aw().webkitAudioContext;
  if (!Ctx) return unavailable(t("no AudioContext", "pas d'AudioContext"));
  const ctx = new Ctx();
  const d = ctx.destination;
  state.add("hardware", "audioctx", "AudioContext", [ctx.sampleRate, ctx.baseLatency, ctx.outputLatency, d.maxChannelCount, d.channelCount, d.channelCountMode].join(" / "), 3);
  void ctx.close?.();
};

export const AUDIO_TYPES = ["audio/mpeg", 'audio/ogg; codecs="vorbis"', 'audio/ogg; codecs="opus"', 'audio/wav; codecs="1"', "audio/aac", "audio/flac", 'audio/webm; codecs="opus"', 'audio/mp4; codecs="mp4a.40.2"', "audio/x-m4a"];
export const VIDEO_TYPES = ['video/mp4; codecs="avc1.42E01E"', 'video/mp4; codecs="avc1.64001F"', 'video/mp4; codecs="hev1.1.6.L93.B0"', 'video/mp4; codecs="av01.0.05M.08"', 'video/webm; codecs="vp8"', 'video/webm; codecs="vp9"', 'video/webm; codecs="av01.0.05M.08"', 'video/ogg; codecs="theora"', "video/x-matroska"];

export const countSupported = (answers: string[]): number => answers.filter((x) => x !== "no").length;

export const collectFormats: Collector = ({ state, t }) => {
  const audio = document.createElement("audio");
  const video = document.createElement("video");
  const a = AUDIO_TYPES.map((m) => audio.canPlayType(m) || "no");
  const v = VIDEO_TYPES.map((m) => video.canPlayType(m) || "no");
  state.add("caps", "audiofmt", t("Audio formats", "Formats audio"), `${countSupported(a)}/${AUDIO_TYPES.length} · ${fnv(a.join(""))}`, 3);
  state.add("caps", "videofmt", t("Video formats", "Formats vidéo"), `${countSupported(v)}/${VIDEO_TYPES.length} · ${fnv(v.join(""))}`, 3.5);
  const mse = aw().MediaSource;
  if (mse?.isTypeSupported) state.add("caps", "mse", "MediaSource", `${VIDEO_TYPES.filter((m) => mse.isTypeSupported(m)).length}/${VIDEO_TYPES.length}`, 1);
};
