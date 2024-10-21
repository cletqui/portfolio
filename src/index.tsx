import { Hono } from "hono";
import { renderer } from "./renderer";
import { Navbar } from "./components/Navbar";

const app = new Hono();

app.use(renderer);

const test = () => {
  console.log(test);
};

app.get("/", (c) => {
  return c.render(
    <body class="bg-background text-foreground">
      <Navbar />

      <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
        <h1 class="uk-heading-small uk-margin">Portofolio</h1>

        <uk-select uk-cloak>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
          <option value="option4">Option 4</option>
          <option value="option5">Option 5</option>
        </uk-select>

        <uk-input-pin name="PIN" uk-cloak></uk-input-pin>
      </div>
    </body>
  );
});

export default app;
