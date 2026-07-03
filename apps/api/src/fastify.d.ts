import type { AppContext } from "./app-context.js";

declare module "fastify" {
  interface FastifyInstance {
    appContext: AppContext;
  }
}
