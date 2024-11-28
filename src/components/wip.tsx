import { Title } from "./layout";

export const WIP = ({lang}: {lang: string}) => {
  return (
    <div class="uk-flex uk-flex-center uk-flex-middle uk-flex-column">
      <Title>{lang === "fr" ? "Travail en cours" : "Work In Progress"}</Title>
      <uk-icon icon="traffic-cone" height="64" width="64" />
      <h4 class="uk-h4 uk-padding-top">
        {lang === "fr" ? "Revenez bientôt..." : "See you soon..."}
      </h4>
    </div>
  );
};
