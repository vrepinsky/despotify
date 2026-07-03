import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        response: {
          200: z.object({
            ok: z.literal(true),
            service: z.literal("api"),
          }),
        },
      },
    },
    async () => {
      return { ok: true, service: "api" } as const;
    },
  );
};
