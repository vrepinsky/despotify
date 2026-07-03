import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: new URL("../../../.env", import.meta.url) });

const envSchema = z.object({
  API_ALLOWED_WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  API_PORT: z.coerce.number().int().positive().default(3000),
});

export const config = envSchema.parse(process.env);
