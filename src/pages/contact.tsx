import { Context, Hono } from "hono";
import { Title } from "../components/layout";

/* COMPONENTS */
const Button = ({
  name,
  link,
  icon,
  style = "primary",
  disabled = false,
}: {
  name: string;
  link: string;
  icon: string;
  style?: string;
  disabled?: boolean;
}) => {
  return (
    <a class={`uk-link${disabled && "-muted"} uk-link-toggle`} href={link}>
      <button class={`uk-button uk-button-${style}`} disabled={disabled}>
        <uk-icon class="uk-padding-small-right" icon={icon} />
        <span class="uk-link-text">{name}</span>
      </button>
    </a>
  );
};

/* APP */
const app = new Hono<{}>();

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <Title>{lang === "fr" ? "Connectons-nous !" : "Let's connect!"}</Title>

      <p class="uk-paragraph uk-padding-medium uk-text-center">
        {lang === "fr"
          ? "Si vous souhaitez discuter de quoi que ce soit, si vous avez une question sur un projet ou si vous voulez simplement dire bonjour, j'adorerais que vous me contactiez !"
          : "If you're interested in talking about anything, have a question about a project, or just want to say hello, I'd love to hear from you!"}
      </p>

      <div
        class="uk-child-width-1-3@s uk-grid-row-large uk-grid-column-small uk-text-center"
        uk-grid
      >
        <div>
          <Button name="Twitter" link="https://x.com/cletqui/" icon="twitter" />
        </div>
        <div>
          <Button
            name="GitHub"
            link="https://github.com/cletqui/"
            icon="github"
          />
        </div>

        <div>
          <Button
            name="GitLab"
            link="https://gitlab.com/cletqui/"
            icon="gitlab"
          />
        </div>

        <div>
          <Button
            name="Mail"
            link="mailto@admin.cybai.re"
            icon="mail"
            style="secondary"
          />
        </div>

        <div>
          <Button
            name={lang === "fr" ? "Carte" : "Map"}
            link="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
            icon="map-pin"
            style="secondary"
          />
        </div>

        <div>
          <Button
            name="LinkedIn"
            link=""
            icon="linkedin"
            style="secondary"
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
});

export default app;
