import type { Translate } from "../shared/i18n";
import type { ShellData } from "./types";

export const aboutText = (t: Translate): string =>
  [
    "# cybai.re",
    t("cybersecurity engineer · full-stack developer", "ingénieur cybersécurité · développeur full-stack"),
    "",
    t("I build things you can see and secure things you can't.", "Je construis des choses que vous voyez et je sécurise celles que vous ne voyez pas."),
    t("Background: threat intelligence platforms, SIEM, SOC.", "Parcours : plateformes de threat intelligence, SIEM, SOC."),
    t("Stack: TypeScript, Python, Bash, and a homelab that rarely sleeps.", "Stack : TypeScript, Python, Bash, et un homelab qui dort rarement."),
  ].join("\n");

export const contactText = (data: ShellData): string =>
  [
    ...data.contacts.map((c) => `${c.name}:`.padEnd(10) + (c.href ?? "")),
    "PGP:".padEnd(10) + data.pgp,
  ].join("\n");

export const projectsText = (data: ShellData, t: Translate): string => {
  const width = Math.max(0, ...data.projects.map((p) => p.name.length)) + 2;
  return [
    ...data.projects.map((p) => p.name.padEnd(width) + p.url),
    t(
      "cat ~/projects/<name>.md for details, or open projects",
      "cat ~/projects/<nom>.md pour les détails, ou open projects",
    ),
  ].join("\n");
};

export const projectFile = (p: ShellData["projects"][number]): string =>
  `# ${p.name}\n${p.desc}\n\n${p.url}${p.github ? "\n" + p.github : ""}\n`;

export const BACKUP_SCRIPT =
  '#!/bin/sh\n# nightly backup of the admin credentials (base64, "for safety")\ntar czf /var/backups/site.tgz /var/www/html\necho "$ROOT_PW" | base64 > /var/backups/.pw.bak\n';

export const AUTH_LOG = [
  "Oct 14 03:11:09 cybai sshd[2190]: Failed password for invalid user admin from 203.0.113.9 port 51022 ssh2",
  "Oct 14 03:11:12 cybai sshd[2190]: Connection closed by invalid user admin 203.0.113.9 port 51022 [preauth]",
  "Oct 14 03:12:44 cybai su[2231]: pam_unix(su:auth): authentication failure; logname=visitor uid=1000 euid=0 tty=pts/0 ruser=visitor rhost= user=root",
  "Oct 14 03:13:02 cybai sudo: visitor : command not allowed ; TTY=pts/0 ; PWD=/home/visitor ; USER=root ; COMMAND=/bin/su",
  "Oct 14 03:14:07 cybai backup.sh[2250]: credentials archived to /var/backups/.pw.bak",
  "",
].join("\n");

export const FAKE_GIT_LOG = [
  "commit 8bfe412ec63df5a2536f9e47735561e334ba961e (HEAD -> main)",
  "Author: dev <dev@cybai.re>",
  "Date:   Sun Mar 2 10:42:00 2025 +0000",
  "",
  "    remove hardcoded secrets",
  "",
  "commit be252151d8441a2c99e5450c70cf3c4b41a6e507",
  "Author: dev <dev@cybai.re>",
  "Date:   Sun Mar 2 10:00:00 2025 +0000",
  "",
  "    initial prototype",
].join("\n");
