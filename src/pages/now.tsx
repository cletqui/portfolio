import { Context, Hono } from "hono";

import { Env } from "..";
import { Title } from "../components/layout";
import { Icon } from "../utils/icons";

const UPDATED = "2026-10-14";

const NOW: {
  icon: string;
  title: [string, string];
  items: [string, string][];
}[] = [
  {
    icon: "code-xml",
    title: ["Building", "En construction"],
    items: [
      [
        "A deeper fingerprinting demo and a few more flags for this site.",
        "Une démo de fingerprinting plus poussée et quelques flags de plus pour ce site.",
      ],
      [
        "A sheet-music score editor on top of Verovio.",
        "Un éditeur de partitions basé sur Verovio.",
      ],
    ],
  },
  {
    icon: "laptop-minimal-check",
    title: ["Tinkering", "Bidouille"],
    items: [
      [
        "A Linux desktop on Void with a tiling Wayland compositor.",
        "Un bureau Linux sous Void avec un compositeur Wayland en mosaïque.",
      ],
      [
        "The homelab: rootless containers, WireGuard, and too many services.",
        "Le homelab : conteneurs rootless, WireGuard, et trop de services.",
      ],
    ],
  },
  {
    icon: "heart",
    title: ["Off-screen", "Hors écran"],
    items: [
      [
        "Bouldering, running, cycling, and discovering new music.",
        "Bloc, course, vélo, et découverte de nouvelle musique.",
      ],
    ],
  },
];

/* APP */
const app = new Hono<Env>();

app.get("/", (c: Context<Env>) => {
  const { lang } = c.var;
  const i = lang === "fr" ? 1 : 0;
  return c.render(
    <div class="mx-auto max-w-3xl px-4 py-12">
      <div class="flex flex-col items-center mb-8">
        <Title>{lang === "fr" ? "En ce moment" : "Now"}</Title>
        <p class="text-sm text-muted-foreground text-center -mt-2">
          {lang === "fr"
            ? "Ce que je fais en ce moment, dans l'esprit de "
            : "What I'm up to right now, in the spirit of "}
          <a
            href="https://nownownow.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-foreground underline underline-offset-4"
          >
            nownownow.com
          </a>
          .
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
        {NOW.map((section) => (
          <div class="card-secondary">
            <h3 class="font-semibold text-center mb-3 flex items-center justify-center gap-1.5">
              <Icon
                name={section.icon}
                size={14}
                class="text-muted-foreground shrink-0"
              />
              {section.title[i]}
            </h3>
            <ul class="text-sm leading-relaxed space-y-2 list-disc pl-4 marker:text-muted-foreground">
              {section.items.map((item) => (
                <li>{item[i]}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p class="mt-8 text-center text-xs font-mono text-muted-foreground">
        {`// ${lang === "fr" ? "mis à jour le" : "last updated"} ${UPDATED}`}
      </p>
    </div>,
    {
      title: lang === "fr" ? "En ce moment" : "Now",
      description:
        lang === "fr"
          ? "Ce que je fais en ce moment."
          : "What I'm up to right now.",
    },
  );
});

export default app;
