import { Child } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const Title = ({ children }: { children: Child }) => (
  <h1 class="uk-h1 uk-heading-medium uk-margin-large uk-heading-divider uk-margin-medium-top">
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
  <div>
    <a
      href={href}
      class={`uk-link${!href && "-muted"} uk-link-toggle`}
      target={external ? "_blank" : "_self"}
      rel={external ? "noopener noreferrer" : ""}
      uk-tooltip={tooltip && `pos:bottom;title:${tooltip}`}
    >
      <button
        class={`uk-button uk-button-${style} uk-flex-row${
          reverse && "-reverse"
        }`}
        disabled={!href}
      >
        <uk-icon
          class={`uk-padding-small-${reverse ? "left" : "right"}`}
          icon={icon}
        />
        <span class="uk-link-text">{text}</span>
      </button>
    </a>
  </div>
);

export const Spinner = () => <div uk-spinner></div>;

export const Epochalypse = () => {
  const c = useRequestContext();
  const { lang } = c.var;
  return (
    <>
      <h1 class="uk-h3 uk-margin uk-heading-divider">{"Epochalypse"}</h1>
      <div
        class="uk-grid-small uk-margin uk-child-width-auto"
        uk-grid
        uk-countdown="date: 2038-01-19T03:14:07+00:00"
      >
        <div>
          <div class="uk-countdown-days uk-countdown-number"></div>
          <div class="uk-visible@s uk-countdown-label uk-margin-small uk-text-center">
            {lang === "fr" ? "Jours" : "Days"}
          </div>
        </div>
        <div class="uk-countdown-separator">:</div>
        <div>
          <div class="uk-countdown-hours uk-countdown-number"></div>
          <div class="uk-visible@s uk-countdown-label uk-margin-small uk-text-center">
            {lang === "fr" ? "Heures" : "Hours"}
          </div>
        </div>
        <div class="uk-countdown-separator">:</div>
        <div>
          <div class="uk-countdown-minutes uk-countdown-number"></div>
          <div class="uk-visible@s uk-countdown-label uk-margin-small uk-text-center">
            {lang === "fr" ? "Minutes" : "Minutes"}
          </div>
        </div>
        <div class="uk-countdown-separator">:</div>
        <div>
          <div class="uk-countdown-seconds uk-countdown-number"></div>
          <div class="uk-visible@s uk-countdown-label uk-margin-small uk-text-center">
            {lang === "fr" ? "Secondes" : "Seconds"}
          </div>
        </div>
      </div>
    </>
  );
};
