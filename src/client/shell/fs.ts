import { b64ToBytes, encoder } from "../shared/bytes";
import type { Translate } from "../shared/i18n";
import { CIPHER_TEXT, CLIENT_FLAGS } from "../shared/flags";
import { AUTH_LOG, BACKUP_SCRIPT, aboutText, contactText, projectFile } from "./content";
import type { ShellData } from "./types";

export interface FileNode {
  type: "file";
  mtime: string;
  content?: string;
  b64?: string;
  remote?: string;
  size?: number;
  rootOnly?: boolean;
}
export interface DirNode {
  type: "dir";
  mtime: string;
  children: Record<string, FsNode>;
  rootOnly?: boolean;
}
export type FsNode = FileNode | DirNode;

const MTIME = "Oct 14 12:00";

const dir = (children: Record<string, FsNode> = {}, rootOnly = false): DirNode => ({
  type: "dir",
  mtime: MTIME,
  children,
  ...(rootOnly ? { rootOnly } : {}),
});
const file = (content: string, rootOnly = false): FileNode => ({
  type: "file",
  mtime: MTIME,
  content,
  ...(rootOnly ? { rootOnly } : {}),
});
const binary = (b64: string): FileNode => ({ type: "file", mtime: MTIME, b64 });
const remote = (url: string, size: number): FileNode => ({
  type: "file",
  mtime: MTIME,
  remote: url,
  size,
});

export const buildTree = (data: ShellData, t: Translate): DirNode => {
  const projects: Record<string, FsNode> = {};
  for (const p of data.projects) projects[`${p.id}.md`] = file(projectFile(p));

  return dir({
    bin: dir({
      ls: file("\u007fELF… (builtin)\n"),
      cat: file("\u007fELF… (builtin)\n"),
      sh: file("\u007fELF… (builtin)\n"),
    }),
    etc: dir({
      hostname: file("cybai.re\n"),
      hosts: file("127.0.0.1\tlocalhost\n::1\t\tlocalhost\n"),
      issue: file("CybaiOS 1.2 \\n \\l\n"),
      motd: file("Welcome to cybai.re (CybaiOS 1.2 edge).\nUnauthorised use will be mocked, affectionately.\n"),
      "os-release": file('NAME="CybaiOS"\nVERSION="1.2 (edge)"\nID=cybaios\nPRETTY_NAME="CybaiOS 1.2 (edge)"\nHOME_URL="https://www.cybai.re/"\n'),
      passwd: file("root:x:0:0:root:/root:/bin/bash\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nvisitor:x:1000:1000:curious human:/home/visitor:/bin/cybai-sh\nflag:x:1337:1337:nice try:/nonexistent:/usr/sbin/nologin\n"),
      shadow: file("root:$6$cybai$Qm0Zk3b1FakeHashNotRealJustForShowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:19650:0:99999:7:::\nvisitor:*:19650:0:99999:7:::\n", true),
      "cron.d": dir({ backup: file("# nightly credential backup, what could go wrong\n0 3 * * * root /usr/local/bin/backup.sh\n") }),
      ssh: dir({ sshd_config: file("Port 2\nPermitRootLogin no\nPasswordAuthentication no\n") }),
    }),
    home: dir({
      visitor: dir({
        "about.md": file(aboutText(t) + "\n"),
        "contact.txt": file(contactText(data) + "\n"),
        "cipher.txt": file(CIPHER_TEXT + "\n"),
        ".secret": file(CLIENT_FLAGS["hidden-file"] + "\n"),
        ".bash_history": file("cd /var/log\ncat auth.log | tail\nls -la /var/backups\ncat /var/backups/.pw.bak\nsu root\nls /root\nexit\n"),
        ".bashrc": file("# ~/.bashrc\nexport PS1='\\u@\\h:\\w\\$ '\nalias ll='ls -la'\n"),
        "todo.txt": file("- finish the portfolio\n- rotate the root password (it is still in the backup, oops)\n- stop leaving shell history lying around\n"),
        "avatar.png": remote("/static/avatar.png", 92915),
        projects: dir(projects),
      }),
    }),
    opt: dir({ cybai: dir({ README: file("Work in progress. Nothing to see here.\n") }) }),
    root: dir(
      {
        "flag.txt": file(CLIENT_FLAGS.root + "\n"),
        README: file("You made it. Lesson: rotate your secrets, and clear your history.\nOther people kept theirs in git, see /var/www/html.\n"),
        ".bash_history": file("cd /var/www/html\ngit log\ngit show be25215 -- config.js\nhistory -c\n"),
        ".profile": file("# root profile\numask 077\n"),
      },
      true,
    ),
    tmp: dir(),
    usr: dir({ local: dir({ bin: dir({ "backup.sh": file(BACKUP_SCRIPT) }) }) }),
    var: dir({
      backups: dir({
        "passwd.bak": file("root:x:0:0:root:/root:/bin/bash\nvisitor:x:1000:1000::/home/visitor:/bin/cybai-sh\n"),
        "site.tgz": binary("H4sIAAAAAAAAA+3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA"),
        ".pw.bak": file("Y3liYWktcm9vdC0yMDM4\n"),
      }),
      log: dir({
        "auth.log": file(AUTH_LOG),
        syslog: file("Oct 14 03:00:01 cybai CRON[2105]: (root) CMD (/usr/local/bin/backup.sh)\nOct 14 03:14:07 cybai kernel: time_t is 32 bits wide. Fine for now.\n"),
      }),
      www: dir({
        html: dir({
          "index.html": file("<h1>cybai.re</h1>\n<p>Under construction since forever.</p>\n"),
          ".env": file("NODE_ENV=production\nCTF_FLAG=nice-try-this-is-not-the-one\n"),
          ".git": dir({
            HEAD: file("ref: refs/heads/main\n"),
            config: file('[core]\n\trepositoryformatversion = 0\n[remote "origin"]\n\turl = git@github.com:cybai/internal-dashboard.git\n'),
          }),
        }),
      }),
    }),
  });
};

export interface SessionView {
  cwd: string;
  home: string;
  user: string;
}

export interface Lookup {
  node: FsNode | null;
  denied: boolean;
}

export type ReadResult =
  | { ok: true; bytes: Uint8Array; abs: string }
  | { ok: false; err: string; abs: string };

export const dirname = (abs: string): string => {
  const i = abs.lastIndexOf("/");
  return i <= 0 ? "/" : abs.slice(0, i);
};
export const basename = (abs: string): string => abs.slice(abs.lastIndexOf("/") + 1);
export const join = (parent: string, name: string): string =>
  parent === "/" ? `/${name}` : `${parent}/${name}`;

export const globToRegex = (pattern: string): RegExp =>
  new RegExp(
    "^" +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".") +
      "$",
  );

export class VFS {
  constructor(
    readonly root: DirNode,
    private readonly session: SessionView,
    private readonly fetcher: typeof fetch,
  ) {}

  norm(path?: string): string {
    let p = path || this.session.cwd;
    if (p === "~" || p.startsWith("~/")) p = this.session.home + p.slice(1);
    if (!p.startsWith("/")) p = `${this.session.cwd}/${p}`;
    const out: string[] = [];
    for (const seg of p.split("/")) {
      if (!seg || seg === ".") continue;
      if (seg === "..") out.pop();
      else out.push(seg);
    }
    return "/" + out.join("/");
  }

  find(abs: string): Lookup {
    let node: FsNode = this.root;
    let denied = false;
    if (abs === "/") return { node, denied };
    for (const part of abs.slice(1).split("/")) {
      if (node.type !== "dir") return { node: null, denied };
      if (node.rootOnly && this.session.user !== "root") denied = true;
      const next: FsNode | undefined = node.children[part];
      if (!next) return { node: null, denied };
      node = next;
    }
    if (node.rootOnly && this.session.user !== "root") denied = true;
    return { node, denied };
  }

  list(abs: string): string[] | null {
    const { node, denied } = this.find(abs);
    if (!node || node.type !== "dir" || denied) return null;
    return Object.keys(node.children).sort();
  }

  writable(abs: string): boolean {
    if (this.session.user === "root") return true;
    const { home } = this.session;
    return abs === "/tmp" || abs.startsWith("/tmp/") || abs === home || abs.startsWith(home + "/");
  }

  async read(path: string): Promise<ReadResult> {
    const abs = this.norm(path);
    const { node, denied } = this.find(abs);
    if (!node) return { ok: false, err: "No such file or directory", abs };
    if (denied) return { ok: false, err: "Permission denied", abs };
    if (node.type === "dir") return { ok: false, err: "Is a directory", abs };
    if (node.remote) {
      try {
        const res = await this.fetcher(node.remote);
        return { ok: true, bytes: new Uint8Array(await res.arrayBuffer()), abs };
      } catch {
        return { ok: false, err: "Input/output error", abs };
      }
    }
    if (node.b64) return { ok: true, bytes: b64ToBytes(node.b64), abs };
    return { ok: true, bytes: encoder.encode(node.content ?? ""), abs };
  }

  write(path: string, text: string, append = false): string | null {
    const abs = this.norm(path);
    const parent = this.find(dirname(abs));
    if (!parent.node || parent.node.type !== "dir") return "No such file or directory";
    if (!this.writable(abs)) return "Permission denied";
    const name = basename(abs);
    const existing = parent.node.children[name];
    if (existing?.type === "dir") return "Is a directory";
    if (existing?.type === "file" && existing.content !== undefined && append) existing.content += text;
    else parent.node.children[name] = file(text);
    return null;
  }

  mkdir(path: string): string | null {
    const abs = this.norm(path);
    const parent = this.find(dirname(abs));
    if (!parent.node || parent.node.type !== "dir") return "No such file or directory";
    if (!this.writable(abs)) return "Permission denied";
    if (parent.node.children[basename(abs)]) return "File exists";
    parent.node.children[basename(abs)] = dir();
    return null;
  }

  remove(abs: string): void {
    const parent = this.find(dirname(abs)).node;
    if (parent?.type === "dir") delete parent.children[basename(abs)];
  }

  glob(word: string): string[] {
    const slash = word.lastIndexOf("/");
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : "";
    const pattern = slash >= 0 ? word.slice(slash + 1) : word;
    const names = this.list(this.norm(dirPart || "."));
    if (!names) return [word];
    const re = globToRegex(pattern);
    const hits = names.filter((n) => re.test(n) && (!n.startsWith(".") || pattern.startsWith(".")));
    return hits.length ? hits.map((n) => dirPart + n) : [word];
  }

  walk(abs: string, visit: (path: string, node: FsNode) => void): void {
    const { node, denied } = this.find(abs);
    if (!node || denied) return;
    visit(abs, node);
    if (node.type === "dir")
      for (const name of Object.keys(node.children).sort()) this.walk(join(abs, name), visit);
  }
}

export const nodeSize = (node: FsNode): number => {
  if (node.type === "dir") return 4096;
  if (node.size !== undefined) return node.size;
  if (node.b64) return Math.floor((node.b64.length * 3) / 4);
  return encoder.encode(node.content ?? "").length;
};
