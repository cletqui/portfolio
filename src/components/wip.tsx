import { Title } from "./layout";
import { Icon } from "../utils/icons";

export const WIP = ({ lang }: { lang: string }) => (
  <div class="flex flex-col items-center px-4 py-16 text-center">
    <Title>{lang === "fr" ? "Travail en cours" : "Work In Progress"}</Title>
    <Icon name="traffic-cone" size={64} class="text-muted-foreground mb-4" />
    <h4 class="text-lg font-semibold text-muted-foreground">
      {lang === "fr" ? "Revenez bientôt…" : "See you soon…"}
    </h4>
  </div>
);
