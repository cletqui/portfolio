import { Context, Hono } from "hono";

/* APP */
const app = new Hono<{}>();

/* ENDPOINTS */
app.get("/", (c: Context) => {
  return c.render(
    <div class="uk-flex uk-flex-column uk-flex-middle uk-flex-center">
      <h1 class="uk-heading-small uk-margin">Home</h1>

      <uk-select uk-cloak>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
        <option value="option4">Option 4</option>
        <option value="option5">Option 5</option>
      </uk-select>
    </div>
  );
});

export default app;
