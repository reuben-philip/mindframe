import "server-only";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_TOKEN;

if (!url) {
  throw new Error("Missing TURSO_URL in environment variables");
}

if (!authToken) {
  throw new Error("Missing TURSO_TOKEN in environment variables");
}

export const client = createClient({
  url,
  authToken,
});