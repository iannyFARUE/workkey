import { ping } from "../db";
import { state } from "../state";
import { config } from "../config";

const noStore = { "Cache-Control": "no-store" };

// Liveness: process-level only. Never touches the DB.
export function healthz(): Response {
  return state.live
    ? Response.json(
        { status: "ok", version: config.version },
        { headers: noStore },
      )
    : Response.json({ status: "unhealthy" }, { status: 500, headers: noStore });
}

// Readiness: can this pod actually serve traffic right now?
export async function readyz(): Promise<Response> {
  if (!state.accepting) {
    return Response.json(
      { status: "draining" },
      { status: 503, headers: noStore },
    );
  }
  if (!(await ping())) {
    return Response.json(
      { status: "db unavailable" },
      { status: 503, headers: noStore },
    );
  }
  return Response.json({ status: "ready" }, { headers: noStore });
}
