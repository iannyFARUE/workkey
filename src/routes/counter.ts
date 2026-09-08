import { recordVisit, rebuildClient } from "../db";
import { burn, clampWork } from "../work";
import { log } from "../logger";
import { metrics } from "./metrics";

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

export async function counter(req: Request): Promise<Response> {
  const work = clampWork(new URL(req.url).searchParams.get("work"));
  if (work > 0) {
    const start = Bun.nanoseconds();
    burn(work);
    metrics.burnNs += Bun.nanoseconds() - start;
  }
  try {
    const count = await recordVisit();
    return Response.json({ count }, { headers });
  } catch (err) {
    log.error("counter failed", { err: String(err) });
    metrics.dbErrors++;
    rebuildClient();
    return Response.json(
      { error: "database unavailable" },
      { status: 503, headers },
    );
  }
}
