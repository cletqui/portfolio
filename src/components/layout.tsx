import { Child } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const Title = ({ children }: { children: Child }) => (
  <h1 class="uk-h1 uk-heading-medium uk-margin-large uk-heading-divider uk-margin-medium-top">
    {children}
  </h1>
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