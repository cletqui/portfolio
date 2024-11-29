import { Button, Title } from "./layout";

const errors = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
};

export const Error = ({
  lang,
  error,
}: {
  lang: string;
  error: keyof typeof errors;
}) => {
  return (
    <div class="uk-flex uk-flex-column uk-flex-middle">
      <Title>{error}</Title>
      <uk-icon icon="ban" height="64" width="64" />
      <h4 class="uk-h4 uk-padding-top">{errors[error]}</h4>

      <div class="uk-flex uk-flex-center uk-padding-top">
        <Button
          text={lang === "fr" ? "Retour à l'accueil" : "Go back home"}
          icon="chevron-left"
          style="ghost"
          href="/"
          external={false}
        />

        <Button
          text={lang === "fr" ? "Signaler l'erreur" : "Report error"}
          icon="chevron-right"
          style="ghost"
          href="https://github.com/cletqui/portfolio/issues"
          reverse
        />
      </div>
    </div>
  );
};
