import { sha } from "../../shared/hash";
import { nav } from "../env";
import { unavailable, type Collector } from "./context";

const drawCanvas = (): string => {
  const cv = document.createElement("canvas");
  cv.width = 280;
  cv.height = 60;
  const ctx = cv.getContext("2d");
  if (!ctx) return unavailable("no 2d");
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
};

export const collectCanvas: Collector = async ({ state, t }) => {
  const [a, b] = await Promise.all([sha(drawCanvas()), sha(drawCanvas())]);
  state.add("hardware", "canvas", "Canvas", a.slice(0, 16), 8);
  if (a !== b)
    state.lie(
      "canvas-noise",
      "warn",
      t("Canvas noise injection", "Bruit injecté dans le canvas"),
      t("Two identical canvas draws gave different results: a privacy extension or browser is randomizing the output.", "Deux dessins identiques ont donné des résultats différents : une extension ou le navigateur randomise la sortie."),
    );
};

const webgl = (options?: WebGLContextAttributes): WebGLRenderingContext | null => {
  const cv = document.createElement("canvas");
  return (cv.getContext("webgl", options) ?? cv.getContext("experimental-webgl", options)) as WebGLRenderingContext | null;
};

export const collectWebGL: Collector = async ({ state, t }) => {
  const gl = webgl();
  if (!gl) return unavailable(t("WebGL unavailable", "WebGL indisponible"));
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const vendor = gl.getParameter(ext ? ext.UNMASKED_VENDOR_WEBGL : gl.VENDOR);
  const renderer = gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
  state.add("hardware", "gpu", "GPU", renderer, 7);
  state.add("hardware", "gpu-vendor", t("GPU vendor", "Fabricant GPU"), vendor, 1.5);
  const dims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array | null;
  const exts = gl.getSupportedExtensions() ?? [];
  const params = [gl.getParameter(gl.MAX_TEXTURE_SIZE), dims?.[0], gl.getParameter(gl.MAX_VERTEX_ATTRIBS), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) as Float32Array).join("-"), exts.length].join("/");
  state.add("hardware", "gl-params", t("WebGL limits", "Limites WebGL"), params, 4);
  state.add("hardware", "gl-ext", t("WebGL extensions", "Extensions WebGL"), `${exts.length} · ${(await sha(exts.join(","))).slice(0, 10)}`, 3);
};

export const collectWebGPU: Collector = async ({ state, t }) => {
  const gpu = nav().gpu;
  if (!gpu) return unavailable(t("WebGPU unavailable", "WebGPU indisponible"));
  const adapter = await gpu.requestAdapter();
  if (!adapter) return unavailable(t("no adapter", "aucun adaptateur"));
  const info = adapter.info ?? {};
  const desc = [info.vendor, info.architecture, info.device, info.description].filter(Boolean).join(" · ");
  state.add("hardware", "webgpu", "WebGPU", desc || t("available", "disponible"), 3);
};

const LIMIT_KEYS = ["MAX_VERTEX_UNIFORM_VECTORS", "MAX_FRAGMENT_UNIFORM_VECTORS", "MAX_VARYING_VECTORS", "MAX_TEXTURE_IMAGE_UNITS", "MAX_COMBINED_TEXTURE_IMAGE_UNITS", "MAX_CUBE_MAP_TEXTURE_SIZE", "ALIASED_POINT_SIZE_RANGE", "SUBPIXEL_BITS", "MAX_VERTEX_TEXTURE_IMAGE_UNITS", "RED_BITS", "GREEN_BITS", "BLUE_BITS", "ALPHA_BITS", "DEPTH_BITS", "STENCIL_BITS"] as const;

const compile = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

export const collectWebGLDeep: Collector = async ({ state, t }) => {
  const gl = webgl({ preserveDrawingBuffer: true });
  if (!gl) return unavailable(t("WebGL unavailable", "WebGL indisponible"));
  gl.canvas.width = 64;
  gl.canvas.height = 64;
  const values = LIMIT_KEYS.map((k) => {
    const v = gl.getParameter(gl[k]) as unknown;
    return ArrayBuffer.isView(v) ? Array.from(v as unknown as ArrayLike<number>).join("-") : String(v);
  });
  const precision: string[] = [];
  for (const shader of [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER])
    for (const level of [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT]) {
      const f = gl.getShaderPrecisionFormat(shader, level);
      precision.push(f ? `${f.rangeMin}.${f.rangeMax}.${f.precision}` : "x");
    }
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, "attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.0,1.0);}"));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;void main(){gl_FragColor=vec4(sin(v.x*12.9898)*0.5+0.5,cos(v.y*78.233)*0.5+0.5,v.x*v.y,1.0);}"));
  gl.linkProgram(program);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.9, -0.9, 0.9, -0.7, 0, 0.9]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const pixels = new Uint8Array(64 * 64 * 4);
  gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let sample = "";
  for (let i = 0; i < pixels.length; i += 61) sample += `${pixels[i]},`;
  const [limits, render] = await Promise.all([sha(`${values.join("|")}#${precision.join("|")}`), sha(sample)]);
  state.add("hardware", "gl-deep", t("WebGL limits (full)", "Limites WebGL (complètes)"), limits.slice(0, 12), 3);
  state.add("hardware", "gl-render", t("WebGL render", "Rendu WebGL"), render.slice(0, 12), 5);
};
