/*mport "server-only";
import {createClient} from '@libsql/client';

export const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
});*/

import { createClient } from "@libsql/client";

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL");
  }

  return createClient({
    url,
    authToken,
  });
}