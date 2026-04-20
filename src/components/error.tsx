import { Button, Title } from "./layout";
import { Icon } from "../utils/icons";

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
}) => (
  <div class="flex flex-col items-center px-4 py-20 text-center">
    <div class="font-mono font-bold text-muted-foreground/20 select-none mb-4"
      style="font-size:clamp(5rem,20vw,10rem);line-height:1">
      {error}
    </div>
    <div class="flex items-center gap-2 mb-10">
      <Icon name="ban" size={14} class="text-destructive" />
      <span class="font-mono text-sm text-muted-foreground">
        [{errors[error].toLowerCase().replace(/ /g, "_")}]
      </span>
    </div>
    <div class="flex items-center gap-3">
      <Button
        text={lang === "fr" ? "Retour à l'accueil" : "Go back home"}
        icon="chevron-left"
        style="ghost"
        href="/"
      />
      <Button
        text={lang === "fr" ? "Signaler l'erreur" : "Report error"}
        icon="chevron-right"
        style="ghost"
        href="https://github.com/cletqui/portfolio/issues"
        reverse
        external
      />
    </div>
  </div>
);
