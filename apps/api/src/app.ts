import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { config } from "./config.js";
import { healthRoutes } from "./routes/health.js";
import { playlistRoutes } from "./routes/playlists.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(sensible);
  await app.register(cors, {
    origin: config.WEB_ORIGIN,
  });

  await app.register(healthRoutes);
  await app.register(playlistRoutes, { prefix: "/api" });

  return app;
}
