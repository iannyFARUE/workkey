export const metrics = { requests: 0, dbErrors: 0, burnNs: 0 };

export function metricsHandler(): Response {
  const body = [
    "# TYPE app_requests_total counter",
    `app_requests_total ${metrics.requests}`,
    "# TYPE app_db_errors_total counter",
    `app_db_errors_total ${metrics.dbErrors}`,
    "# TYPE app_burn_seconds_total counter",
    `app_burn_seconds_total ${(metrics.burnNs / 1e9).toFixed(6)}`,
  ].join("\n");
  return new Response(body + "\n", {
    headers: { "Content-Type": "text/plain; version=0.0.4" },
  });
}
