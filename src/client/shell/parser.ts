export interface Expansion {
  env: Record<string, string>;
  lastStatus: number;
  home: string;
  glob(word: string): string[];
}

export interface Redirect {
  op: ">" | ">>";
  file: string;
}
export interface Stage {
  argv: string[];
  redir: Redirect | null;
}
export type Connector = ";" | "&&" | "||";
export interface Sequence {
  conn: Connector;
  stages: Stage[];
}

type Token = { w: string; glob: boolean } | { op: string };

const expandVar = (line: string, i: number, x: Expansion): { v: string; i: number } => {
  const next = line.charAt(i + 1);
  if (next === "?") return { v: String(x.lastStatus), i: i + 2 };
  if (next === "{") {
    const close = line.indexOf("}", i);
    if (close > 0) return { v: x.env[line.slice(i + 2, close)] ?? "", i: close + 1 };
  }
  const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(line.slice(i + 1));
  if (m) return { v: x.env[m[0]] ?? "", i: i + 1 + m[0].length };
  return { v: "$", i: i + 1 };
};

export const lex = (line: string, x: Expansion): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  let cur = "";
  let has = false;
  let glob = false;
  const push = () => {
    if (has) tokens.push({ w: cur, glob });
    cur = "";
    has = false;
    glob = false;
  };

  while (i < line.length) {
    const ch = line.charAt(i);
    if (ch === "'") {
      let j = line.indexOf("'", i + 1);
      if (j < 0) j = line.length;
      cur += line.slice(i + 1, j);
      has = true;
      i = j + 1;
    } else if (ch === '"') {
      i++;
      has = true;
      while (i < line.length && line.charAt(i) !== '"') {
        const c = line.charAt(i);
        if (c === "\\" && i + 1 < line.length && '"\\$`'.includes(line.charAt(i + 1))) {
          cur += line.charAt(i + 1);
          i += 2;
        } else if (c === "$") {
          const r = expandVar(line, i, x);
          cur += r.v;
          i = r.i;
        } else {
          cur += c;
          i++;
        }
      }
      i++;
    } else if (ch === "\\") {
      cur += line.charAt(i + 1);
      has = true;
      i += 2;
    } else if (ch === "$") {
      const r = expandVar(line, i, x);
      cur += r.v;
      if (r.v) has = true;
      i = r.i;
    } else if (ch === "#" && !has) {
      break;
    } else if (ch === " " || ch === "\t") {
      push();
      i++;
    } else if (ch === "|" || ch === ";" || ch === "&" || ch === ">") {
      push();
      let op = ch;
      if (ch !== ";" && line.charAt(i + 1) === ch) {
        op = ch + ch;
        i++;
      }
      tokens.push({ op });
      i++;
    } else if (ch === "~" && !has && (i + 1 >= line.length || " /\t".includes(line.charAt(i + 1)))) {
      cur += x.home;
      has = true;
      i++;
    } else {
      if (ch === "*" || ch === "?") glob = true;
      cur += ch;
      has = true;
      i++;
    }
  }
  push();
  return tokens;
};

export const parse = (line: string, x: Expansion): Sequence[] => {
  const seqs: Sequence[] = [];
  let stages: Stage[] = [];
  let argv: string[] = [];
  let redir: Redirect | null = null;
  let waiting: ">" | ">>" | null = null;
  let pending: Connector = ";";

  const endStage = () => {
    if (argv.length || redir) stages.push({ argv, redir });
    argv = [];
    redir = null;
  };
  const endSequence = (conn: Connector) => {
    endStage();
    if (stages.length) seqs.push({ conn, stages });
    stages = [];
  };

  for (const tok of lex(line, x)) {
    if ("op" in tok) {
      if (tok.op === "|") endStage();
      else if (tok.op === ">" || tok.op === ">>") waiting = tok.op;
      else {
        endSequence(pending);
        pending = tok.op === "&&" || tok.op === "||" ? tok.op : ";";
      }
    } else if (waiting) {
      redir = { op: waiting, file: tok.w };
      waiting = null;
    } else if (tok.glob) argv.push(...x.glob(tok.w));
    else argv.push(tok.w);
  }
  endSequence(pending);
  return seqs;
};
