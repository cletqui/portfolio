import { jsxRenderer } from "hono/jsx-renderer";
import { Head } from "./components/Head";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <Head title="Portofolio" />
      {children}
    </html>
  );
});
