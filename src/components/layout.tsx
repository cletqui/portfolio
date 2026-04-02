import { Child } from "hono/jsx";
import { Icon } from "../utils/icons";

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
    class="rounded-full object-cover"
    style={`width:${size}px;height:${size}px;aspect-ratio:1/1`}
    src="/static/avatar.png"
    width={size}
    height={size}
    alt="avatar"
  />
);

export const Spinner = () => (
  <div
    class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground"
    role="status"
    aria-label="Loading"
  />
);

export const Epochalypse = ({ lang }: { lang: string }) => {
  const target = 2148609247000; // 2038-01-19T03:14:07Z
  return (
    <div>
      <div class="flex items-end gap-3 font-mono text-center">
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
                {lang === "fr"
                  ? unit === "days"
                    ? "Jours"
                    : unit === "hours"
                      ? "Heures"
                      : unit === "minutes"
                        ? "Minutes"
                        : "Secondes"
                  : unit.charAt(0).toUpperCase() + unit.slice(1)}
              </div>
            </div>
          </>
        ))}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=${target};function p(n){return String(n).padStart(2,'0')}function u(){var d=Math.max(0,t-Date.now());document.getElementById('epoch-days').textContent=Math.floor(d/86400000);document.getElementById('epoch-hours').textContent=p(Math.floor(d%86400000/3600000));document.getElementById('epoch-minutes').textContent=p(Math.floor(d%3600000/60000));document.getElementById('epoch-seconds').textContent=p(Math.floor(d%60000/1000))}u();setInterval(u,1000)})();`,
        }}
      />
    </div>
  );
};
