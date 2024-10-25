import { Child } from "hono/jsx";

export const Title = ({ children }: { children: Child }) => (
  <h1 class="uk-h1 uk-heading-medium uk-margin-large uk-heading-divider uk-margin-medium-top">
    {children}
  </h1>
);
