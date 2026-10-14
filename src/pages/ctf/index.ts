import { Hono } from "hono";
import type { Env } from "../..";
import api from "./api";
import page from "./page";

const ctf = new Hono<Env>();
ctf.route("/", api);
ctf.route("/", page);

export default ctf;
