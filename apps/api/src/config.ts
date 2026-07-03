import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: new URL("../../../.env", import.meta.url) });

const envSchema = z.object({
  API_ALLOWED_WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  API_PORT: z.coerce.number().int().positive().default(5000),
  DB_HOST: z.string().default("localhost"),
  DB_NAME: z.string().default("despotify"),
  DB_PASSWORD: z.string().default("despotify"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default("despotify"),
});

export const config = envSchema.parse(process.env);
