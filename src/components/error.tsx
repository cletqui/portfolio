import { Button } from "./layout";

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

const errorScript = `(function(){var path=window.location.pathname;['error-path','error-path-2'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=path})})();`;

export const Error = ({
  lang,
  error,
}: {
  lang: string;
  error: keyof typeof errors;
}) => (
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
    <div class="w-full max-w-sm mx-auto">
      <div class="flex items-center gap-1.5 mb-3 opacity-40 select-none">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span class="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>

      <div class="rounded-md border border-border bg-muted/40 px-5 py-5 font-mono text-sm space-y-3">
        <div class="flex gap-3">
          <span class="text-green-500 select-none shrink-0">$</span>
          <span>
            cd <span id="error-path" class="text-muted-foreground">/</span>
          </span>
        </div>
        <div class="flex gap-3">
          <span class="text-destructive select-none shrink-0">✗</span>
          <span class="text-destructive break-all">
            <span id="error-path-2">/</span>
            {`: ${errors[error].toLowerCase()}`}
          </span>
        </div>
        <div class="flex gap-3 opacity-50">
          <span class="text-green-500 select-none shrink-0">$</span>
          <span class="cursor-blink">_</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 mt-8">
        <Button
          text={lang === "fr" ? "Retour à l'accueil" : "Go back home"}
          icon="chevron-left"
          style="ghost"
          href="/"
        />
        <Button
          text={lang === "fr" ? "Signaler" : "Report"}
          icon="bug"
          style="ghost"
          href="https://github.com/cletqui/portfolio/issues"
          reverse
          external
        />
      </div>
    </div>
    <script dangerouslySetInnerHTML={{ __html: errorScript }} />
  </div>
);
