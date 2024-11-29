import { Context, Hono } from "hono";

import { Title, Button } from "../components/layout";

/* APP */
const app = new Hono<{}>();

app.get("", (c: Context) => {
  const { lang } = c.var;
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{lang === "fr" ? "Connectons-nous !" : "Let's connect!"}</Title>

      <p class="uk-paragraph uk-padding-medium uk-text-center">
        {lang === "fr"
          ? "Si vous souhaitez discuter de quoi que ce soit, si vous avez une question sur un projet ou si vous voulez simplement dire bonjour, n'hésitez pas à me contacter !"
          : "If you're interested in talking about anything, have a question about a project, or just want to say hello, I'd love to hear from you!"}
      </p>

      <div
        class="uk-child-width-1-4@s uk-grid-row-medium uk-grid-column-small uk-text-center"
        uk-grid
      >
        <Button text="Twitter" href="https://x.com/cletqui/" icon="twitter" />

        <Button
          text="BlueSky"
          href="https://bsky.app/profile/cybai.re"
          icon="earth"
        />

        <Button
          text="GitHub"
          href="https://github.com/cletqui/"
          icon="github"
        />

        <Button
          text="GitLab"
          href="https://gitlab.com/cletqui/"
          icon="gitlab"
        />

        <Button
          text="Keybase"
          href="https://keybase.io/clet"
          icon="file-key"
          style="secondary"
        />

        <Button
          text="GPG key"
          href="https://github.com/cletqui.gpg"
          icon="key"
          style="secondary"
        />

        <Button
          text="Mail"
          href="mailto@admin.cybai.re"
          icon="mail"
          style="secondary"
        />

        <Button
          text={lang === "fr" ? "Carte" : "Map"}
          href="https://www.openstreetmap.org/#map=19/48.673657/-3.913592"
          icon="map-pin"
          style="secondary"
        />

        <Button
          text="LinkedIn"
          icon="linkedin"
          style="secondary"
          tooltip={
            lang === "fr" ? "PM moi si intéressé !" : "DM me if interested!"
          }
        />
      </div>

      <p class="uk-paragraph uk-padding-medium uk-text-center">
        {lang === "fr" ? "Je suis les " : "I follow "}
        <a class="uk-link" href="http://sl4.org/crocker.html">
          {lang === "fr" ? "règles de Crocker" : "Crocker's rules"}
        </a>
        {lang === "fr"
          ? " donc pas besoin de faire des excès de diplomatie."
          : ", so there's no need to be overly diplomatic."}
      </p>
    </div>
  );
});

export default app;
