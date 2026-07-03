import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createAppContext } from "./app-context.js";
import { config } from "./config.js";
import { healthRoutes } from "./routes/health.js";

export async function buildApp() {
  const appContext = createAppContext();
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("appContext", appContext);

  await app.register(sensible);
  await app.register(cors, {
    origin: config.API_ALLOWED_WEB_ORIGIN,
  });

  app.addHook("onClose", async () => {
    await appContext.pool.end();
  });

  await app.register(healthRoutes);

  return app;
}
