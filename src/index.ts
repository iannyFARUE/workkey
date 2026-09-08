import { config } from "./config";
import { log } from "./logger";
import { state } from "./state";
import { closePool } from "./db";
import { healthz, readyz } from "./routes/health";
import { counter } from "./routes/counter";
import { metricsHandler, metrics } from "./routes/metrics";

const server = Bun.serve({
  port: config.port,
  hostname: "0.0.0.0",
  idleTimeout: 30,
  routes: {
    "/healthz": { GET: healthz },
    "/readyz": { GET: readyz },
    "/metrics": { GET: metricsHandler },
    "/counter": { GET: counter },
  },
  fetch() {
    return Response.json({ error: "not found" }, { status: 404 });
  },
  error(err) {
    log.error("unhandled", { err: String(err) });
    return Response.json({ error: "internal" }, { status: 500 });
  },
});

process.on("SIGUSR1", () => {
  state.live = !state.live;
  log.warn("SIGUSR1 received", { live: state.live });
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info("shutdown starting", { signal });

  // 1. Fail readiness so kubelet pulls us from Service endpoints.
  state.accepting = false;

  // 2. Wait for endpoint removal to propagate across the cluster.
  await Bun.sleep(config.shutdownGraceMs);

  // 3. Drain in-flight requests.
  await server.stop();

  // 4. Release the connection pool.
  await closePool();

  log.info("shutdown complete", { requests: metrics.requests });
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

log.info("listening", { port: config.port, version: config.version });
