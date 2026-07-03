import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: new URL("../../../.env", import.meta.url) });

const envSchema = z.object({
  DATABASE_URL: z.string().url().default("postgres://despotify:despotify@localhost:5432/despotify"),
  PORT: z.coerce.number().int().positive().default(3000),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
});

export const config = envSchema.parse(process.env);
