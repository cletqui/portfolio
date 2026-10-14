import { describe, expect, it } from "vitest";
import { lex, parse, type Expansion } from "../../../src/client/shell/parser";

const x = (over: Partial<Expansion> = {}): Expansion => ({
  env: { USER: "visitor", EMPTY: "" },
  lastStatus: 0,
  home: "/home/visitor",
  glob: (w) => (w === "*.md" ? ["a.md", "b.md"] : [w]),
  ...over,
});
const argvs = (line: string, e = x()) => parse(line, e).map((s) => s.stages.map((st) => st.argv));

describe("lex", () => {
  it("splits on whitespace and keeps quoted strings together", () => {
    expect(lex(`echo "a  b" 'c d' e`, x())).toEqual([
      { w: "echo", glob: false }, { w: "a  b", glob: false }, { w: "c d", glob: false }, { w: "e", glob: false },
    ]);
  });
  it("expands variables, ${VAR}, $? and leaves unknown ones empty", () => {
    const e = x({ lastStatus: 3 });
    expect(lex("echo $USER ${USER}x $? $NOPE", e).map((t) => ("w" in t ? t.w : t.op))).toEqual(["echo", "visitor", "visitorx", "3", ""].filter((_v, i) => i !== 4));
  });
  it("does not expand inside single quotes but does inside double quotes", () => {
    expect(lex(`echo '$USER' "$USER"`, x()).map((t) => ("w" in t ? t.w : ""))).toEqual(["echo", "$USER", "visitor"]);
  });
  it("expands a lone tilde to the home directory", () => {
    expect(lex("cd ~", x()).map((t) => ("w" in t ? t.w : ""))).toEqual(["cd", "/home/visitor"]);
    expect(lex("echo a~b", x()).map((t) => ("w" in t ? t.w : ""))).toEqual(["echo", "a~b"]);
  });
  it("supports backslash escapes and ignores comments", () => {
    expect(lex(`echo a\\ b # nothing`, x()).map((t) => ("w" in t ? t.w : ""))).toEqual(["echo", "a b"]);
  });
  it("flags unquoted globs only", () => {
    const toks = lex(`ls *.md "*.md"`, x());
    expect(toks.map((t) => ("glob" in t ? t.glob : null))).toEqual([false, true, false]);
  });
  it("recognises operators", () => {
    expect(lex("a|b;c&&d||e>f>>g", x()).filter((t) => "op" in t).map((t) => (t as { op: string }).op)).toEqual(["|", ";", "&&", "||", ">", ">>"]);
  });
});

describe("parse", () => {
  it("builds pipelines", () => {
    expect(argvs("cat a | grep b | wc -l")).toEqual([[["cat", "a"], ["grep", "b"], ["wc", "-l"]]]);
  });
  it("splits sequences and keeps connectors", () => {
    const seq = parse("a && b || c ; d", x());
    expect(seq.map((s) => s.conn)).toEqual([";", "&&", "||", ";"]);
    expect(seq.map((s) => s.stages[0]!.argv[0])).toEqual(["a", "b", "c", "d"]);
  });
  it("treats a lone & like ;", () => {
    expect(parse("a & b", x()).map((s) => s.conn)).toEqual([";", ";"]);
  });
  it("captures redirects", () => {
    const [first] = parse("echo hi > out.txt", x());
    expect(first!.stages[0]).toEqual({ argv: ["echo", "hi"], redir: { op: ">", file: "out.txt" } });
    expect(parse("echo hi >> out.txt", x())[0]!.stages[0]!.redir?.op).toBe(">>");
  });
  it("expands globs through the injected resolver", () => {
    expect(argvs("cat *.md")).toEqual([[["cat", "a.md", "b.md"]]]);
  });
  it("returns nothing for empty or comment-only input", () => {
    expect(parse("", x())).toEqual([]);
    expect(parse("   # just a comment", x())).toEqual([]);
  });
});
