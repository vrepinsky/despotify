import { buildApp } from "./app.js";
import { config } from "./config.js";

const app = await buildApp();

const shutdown = async () => {
  await app.close();
};

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

await app.listen({
  host: "0.0.0.0",
  port: config.PORT,
});
