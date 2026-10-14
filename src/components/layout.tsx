import { Child } from "hono/jsx";
import { Icon } from "../utils/icons";
import { EPOCH_TARGET_MS } from "../utils/epoch";

export const Title = ({ children }: { children: Child }) => (
  <h1 class="text-3xl font-bold tracking-tight border-b border-border pb-3 mb-6">
    {children}
  </h1>
);

export const Button = ({
  text,
  icon,
  href,
  style = "primary",
  reverse = false,
  external = false,
  tooltip,
}: {
  text: string;
  icon: string;
  href?: string;
  style?: string;
  reverse?: boolean;
  external?: boolean;
  tooltip?: string;
}) => (
  <a
    href={href}
    target={external ? "_blank" : "_self"}
    rel={external ? "noopener noreferrer" : ""}
    title={tooltip}
    class={`btn btn-${href ? style : "ghost"} ${reverse ? "flex-row-reverse" : ""} ${!href ? "opacity-50 pointer-events-none" : ""}`}
  >
    <Icon name={icon} size={15} />
    <span>{text}</span>
  </a>
);

export const Avatar = ({ size }: { size: number }) => (
  <img
    class="rounded-full object-cover ring-2 ring-foreground/20"
    style={`width:${size}px;height:${size}px;aspect-ratio:1/1`}
    src="/static/avatar.png"
    width={size}
    height={size}
    alt="cybai.re"
  />
);

export const Spinner = () => (
  <div
    class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground"
    role="status"
    aria-label="Loading"
  />
);

const UNIT_LABELS = {
  days: ["Days", "Jours"],
  hours: ["Hours", "Heures"],
  minutes: ["Minutes", "Minutes"],
  seconds: ["Seconds", "Secondes"],
} as const;

export const Epochalypse = ({ lang }: { lang: string }) => {
  return (
    <div>
      <div
        id="epoch-countdown"
        data-target={EPOCH_TARGET_MS}
        class="flex items-end gap-3 font-mono text-center"
      >
        {(["days", "hours", "minutes", "seconds"] as const).map((unit, idx) => (
          <>
            {idx > 0 && (
              <span class="text-4xl font-bold text-muted-foreground mb-5">
                :
              </span>
            )}
            <div>
              <div id={`epoch-${unit}`} class="text-5xl font-bold tabular-nums">
                --
              </div>
              <div class="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                {UNIT_LABELS[unit][lang === "fr" ? 1 : 0]}
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};
