import { HTPASSWD } from "../../data/admin";
import { b64ToBytes, encoder } from "../shared/bytes";
import type { Translate } from "../shared/i18n";
import { CIPHER_TEXT, CLIENT_FLAGS } from "../shared/flags";
import { AUTH_LOG, BACKUP_SCRIPT, aboutText, contactText, ctfText, nowText, projectFile, projectsText, youText } from "./content";
import type { ShellData } from "./types";

export interface FileNode {
  type: "file";
  mtime: string;
  content?: string;
  b64?: string;
  remote?: string;
  size?: number;
  rootOnly?: boolean;
  mode?: string;
  sink?: boolean;
}
export interface DirNode {
  type: "dir";
  mtime: string;
  children: Record<string, FsNode>;
  rootOnly?: boolean;
  page?: string;
}
export type FsNode = FileNode | DirNode;

const MTIME = "Oct 14 12:00";

const dir = (children: Record<string, FsNode> = {}, rootOnly = false): DirNode => ({
  type: "dir",
  mtime: MTIME,
  children,
  ...(rootOnly ? { rootOnly } : {}),
});
const pageDir = (page: string, children: Record<string, FsNode>): DirNode => ({
  type: "dir",
  mtime: MTIME,
  children,
  page,
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
const exec = (content: string): FileNode => ({ ...file(content), mode: "rwxr-xr-x" });
const device = (): FileNode => ({ ...file(""), sink: true, mode: "rw-rw-rw-" });

const html = (title: string, route: string, body: string): string =>
  `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>${title} · cybai.re</title>\n</head>\n<body>\n  <!-- served at ${route} -->\n${body
    .split("\n")
    .map((l) => "  " + l)
    .join("\n")}\n</body>\n</html>\n`;
const escapeHtml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const pageFiles = (title: string, route: string, readme: string, extra: Record<string, FsNode> = {}): Record<string, FsNode> => ({
  "README.md": file(readme.endsWith("\n") ? readme : readme + "\n"),
  "index.html": file(html(escapeHtml(title), route, `<main>\n<h1>${escapeHtml(title)}</h1>\n<pre>${escapeHtml(readme)}</pre>\n</main>`)),
  ...extra,
});

const SHADOW_BAK = [
  "root:$6$cybai2038$us3NcqQtlRDB7a3YQIn6jnd.jfs10BYDPWzDwgsA2uBAo9I7D8J.CO03mFKyki5otmaMSlYhw.vLIRHuMcciB.:19650:0:99999:7:::",
  "deploy:$6$cybaisalt$1I3zirNIspzwXpjT2PudUr02C3.yZJKz9kjlhnNcluxAieAzNcYoV1hFnsuq63qIqGRUOcEf5NmwzCmevvCEf/:19650:0:99999:7:::",
  "guest:*:19650:0:99999:7:::",
  "",
].join("\n");

const USERS_CSV = [
  "id,user,role,md5",
  "1,admin,administrator,21232f297a57a5a743894a0e4a801fc3",
  "2,bob,editor,5f4dcc3b5aa765d61d8327deb882cf99",
  "3,carol,viewer,e10adc3949ba59abbe56e057f20f883e",
  "4,dave,viewer,37b4e2d82900d5e94b8da524fbeb33c0",
  "",
].join("\n");

export const buildTree = (data: ShellData, t: Translate): DirNode => {
  const projects: Record<string, FsNode> = {};
  for (const p of data.projects)
    projects[p.id] = pageDir(p.page, pageFiles(p.name, p.page, projectFile(p)));

  const pages: Record<string, FsNode> = {
    about: pageDir("/about/me", pageFiles("about", "/about/me", aboutText(t), {
      "skills.txt": file("typescript  python  bash  sigma  yara  a homelab that rarely sleeps\n"),
      ".env": file("MOOD=caffeinated\nCOFFEE_LEVEL=low\nTABS_OR_SPACES=yes\n"),
    })),
    you: pageDir("/about/you", pageFiles("about you", "/about/you", youText(t))),
    projects: pageDir("/projects", { ...pageFiles("projects", "/projects", projectsText(data, t)), ...projects }),
    contact: pageDir("/contact", pageFiles("contact", "/contact", contactText(data), {
      "pgp.asc": remote("/pgp.asc", 628),
      "contact.vcf": remote("/contact/contact.vcf", 214),
      ".env": file("REPLY_WITHIN=whenever\nCROCKER_RULES=true\n"),
    })),
    ctf: pageDir("/ctf", pageFiles("ctf", "/ctf", ctfText(data, t), {
      ".env": file("FLAG_FORMAT=cybai{...}\nSCOREBOARD=localStorage\nDIFFICULTY=somewhere between easy and unfair\n"),
    })),
    now: pageDir("/now", pageFiles("now", "/now", nowText(t))),
  };

  return dir({
    bin: dir({
      sh: exec("\u007fELF… (builtin)\n"),
      bash: exec("\u007fELF… (builtin)\n"),
      ls: exec("\u007fELF… (builtin)\n"),
      cat: exec("\u007fELF… (builtin)\n"),
      grep: exec("\u007fELF… (builtin)\n"),
      echo: exec("\u007fELF… (builtin)\n"),
    }),
    boot: dir({
      "grub.cfg": file("set timeout=0\nmenuentry 'CybaiOS' {\n\tlinux /boot/vmlinuz-6.18-cybai root=/dev/sda1 ro quiet\n}\n"),
      "vmlinuz-6.18-cybai": file("\u007fELF… (kernel image)\n"),
    }),
    dev: dir({ null: device(), tty: device(), zero: device() }),
    etc: dir({
      crontab: file("# m h dom mon dow user command\n17 * * * * root cd / && run-parts --report /etc/cron.hourly\n"),
      fstab: file("/dev/sda1  /      ext4   defaults,noatime  0 1\ntmpfs      /tmp   tmpfs  defaults          0 0\n"),
      group: file("root:x:0:\nwww-data:x:33:\nguest:x:1000:\ncurious:x:1337:guest\n"),
      hostname: file("cybai.re\n"),
      hosts: file("127.0.0.1\tlocalhost\n::1\t\tlocalhost\n127.0.1.1\tcybai.re cybai\n"),
      issue: file("CybaiOS 1.2 \\n \\l\n"),
      motd: file("Welcome to cybai.re (CybaiOS 1.2 edge).\nUnauthorised use will be mocked, affectionately.\n"),
      "os-release": file('NAME="CybaiOS"\nVERSION="1.2 (edge)"\nID=cybaios\nPRETTY_NAME="CybaiOS 1.2 (edge)"\nHOME_URL="https://www.cybai.re/"\n'),
      passwd: file("root:x:0:0:root:/root:/bin/bash\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\ndeploy:x:1001:1001:deploy bot:/home/deploy:/bin/bash\nadmin:x:1002:1002:site admin:/home/admin:/bin/bash\nguest:x:1000:1000:curious human:/home/guest:/bin/cybai-sh\nflag:x:1337:1337:nice try:/nonexistent:/usr/sbin/nologin\n"),
      "resolv.conf": file("nameserver 1.1.1.1\nnameserver 9.9.9.9\n"),
      shadow: file("root:$6$cybai$Qm0Zk3b1FakeHashNotRealJustForShowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:19650:0:99999:7:::\nguest:*:19650:0:99999:7:::\n", true),
      shells: file("/bin/sh\n/bin/bash\n/bin/cybai-sh\n"),
      sudoers: file("root ALL=(ALL:ALL) ALL\n%admin ALL=(ALL) NOPASSWD: ALL\n", true),
      "cron.d": dir({ backup: file("# nightly credential backup, what could go wrong\n0 3 * * * root /usr/local/bin/backup.sh\n") }),
      ssh: dir({
        sshd_config: file("Port 2\nPermitRootLogin no\nPasswordAuthentication no\n"),
        ssh_host_ed25519_key: file("-----BEGIN OPENSSH PRIVATE KEY-----\n(nice try)\n-----END OPENSSH PRIVATE KEY-----\n", true),
      }),
    }),
    home: dir({
      admin: dir(
        {
          notes: file("TODO: move the admin panel behind real auth.\nTODO: stop reusing passwords.\n"),
          ".bash_history": file("htpasswd -s -c /var/www/html/.htpasswd admin\n"),
        },
        true,
      ),
      deploy: dir({ ".bash_history": file("git pull\nsystemctl restart site\nexit\n") }, true),
      guest: dir({
        ...pages,
        "cipher.txt": file(CIPHER_TEXT + "\n"),
        ".secret": file(CLIENT_FLAGS["hidden-file"] + "\n"),
        ".bash_history": file("cd /var/log\ncat auth.log | tail\nls -la /var/backups\ncat /var/backups/.pw.bak\nsu root\nls /root\nexit\n"),
        ".bashrc": file("# ~/.bashrc\nexport PS1='\\u@\\h:\\w\\$ '\nexport CDPATH=.:~\nalias ll='ls -la'\n"),
        ".profile": file("# ~/.profile\n[ -f ~/.bashrc ] && . ~/.bashrc\n"),
        ".ssh": dir({
          config: file("Host cybai\n  HostName cybai.re\n  Port 2\n  User guest\n"),
          known_hosts: file("cybai.re ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFakeHostKeyFakeHostKeyFakeHostKeyFakeHost\n"),
        }),
        "todo.txt": file("- finish the portfolio\n- rotate the root password (it is still in the backup, oops)\n- stop leaving shell history lying around\n"),
        "avatar.png": remote("/static/avatar.png", 92915),
      }),
    }),
    "lost+found": dir({}, true),
    opt: dir({ cybai: dir({ README: file("Work in progress. Nothing to see here.\n") }) }),
    proc: dir({
      cpuinfo: file("processor\t: 0\nvendor_id\t: GenuineCybai\nmodel name\t: Cybai Virtual CPU @ 3.14GHz\ncpu MHz\t\t: 3140.000\n"),
      meminfo: file("MemTotal:         131072 kB\nMemFree:           65536 kB\nMemAvailable:      98304 kB\n"),
      version: file("Linux version 6.18-cybai (build@cybai.re) (gcc 15.2) #1 SMP Hono/Workers\n"),
    }),
    root: dir(
      {
        "flag.txt": file(CLIENT_FLAGS.root + "\n"),
        README: file("You made it. Lesson: rotate your secrets, and clear your history.\nOther people kept theirs in git, see /var/www/html.\n"),
        ".bash_history": file("cd /var/www/html\ngit log\ngit show be25215 -- config.js\nhistory -c\n"),
        ".profile": file("# root profile\numask 077\n"),
      },
      true,
    ),
    srv: dir({ ftp: dir() }),
    tmp: dir(),
    usr: dir({
      bin: dir(),
      local: dir({ bin: dir({ "backup.sh": exec(BACKUP_SCRIPT) }) }),
      share: dir({
        doc: dir({
          cybai: dir({
            README: file("cybai.re is a portfolio that doubles as a CTF.\nFlags look like cybai{...}. Submit them with `ctf submit`.\n"),
            changelog: file("1.2  shell grows a filesystem, pages become directories\n1.1  security headers, self-hosted fonts\n1.0  first light\n"),
          }),
        }),
      }),
    }),
    var: dir({
      backups: dir({
        "passwd.bak": file("root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000::/home/guest:/bin/cybai-sh\n"),
        "shadow.bak": file(SHADOW_BAK),
        "site.tgz": binary("H4sIAAAAAAAAA+3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA"),
        ".pw.bak": file("Y3liYWktcm9vdC0yMDM4\n"),
      }),
      lib: dir({ cybai: dir({ "users.csv": file(USERS_CSV) }) }),
      log: dir({
        "auth.log": file(AUTH_LOG),
        syslog: file("Oct 14 03:00:01 cybai CRON[2105]: (root) CMD (/usr/local/bin/backup.sh)\nOct 14 03:14:07 cybai kernel: time_t is 32 bits wide. Fine for now.\n"),
      }),
      mail: dir({
        guest: file(
          "From root@cybai.re Tue Oct 14 08:00:00 2026\nSubject: welcome\n\nThe old intranet lives at /admin now.\nIt is behind basic auth. The credentials file is in the usual place.\nDo not tell the interns.\n",
        ),
      }),
      www: dir({
        html: dir({
          "index.html": file("<h1>cybai.re</h1>\n<p>Under construction since forever.</p>\n"),
          ".env": file("NODE_ENV=production\nCTF_FLAG=nice-try-this-is-not-the-one\n"),
          ".htpasswd": file(HTPASSWD),
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
    const target = this.find(abs).node;
    if (target?.type === "file" && target.sink) return null;
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
    if (!/[*?]/.test(word)) return [word];
    const segs = word.split("/");
    const absolute = word.startsWith("/");
    let acc: string[] = [absolute ? "/" : ""];
    for (let i = absolute ? 1 : 0; i < segs.length; i++) {
      const seg = segs[i]!;
      const last = i === segs.length - 1;
      const tail = last ? "" : "/";
      const next: string[] = [];
      for (const prefix of acc) {
        if (!/[*?]/.test(seg)) {
          next.push(prefix + seg + tail);
          continue;
        }
        const re = globToRegex(seg);
        for (const name of this.list(this.norm(prefix || ".")) ?? []) {
          if (!re.test(name) || (name.startsWith(".") && !seg.startsWith("."))) continue;
          if (!last && this.find(this.norm(prefix + name)).node?.type !== "dir") continue;
          next.push(prefix + name + tail);
        }
      }
      acc = next;
    }
    const hits = acc.filter((p) => this.find(this.norm(p)).node);
    return hits.length ? hits : [word];
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
