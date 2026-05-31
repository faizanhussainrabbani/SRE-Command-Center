import process from "node:process";
import { runBackendBoundarySuite } from "../src/test/backend-boundary.test";
import { runDashboardRealtimeE2ESuite } from "../src/test/e2e/dashboard-realtime.e2e";
import { runAccuracySuite } from "../src/test/phase-accuracy.test";
import { runDashboardPerfSuite } from "../src/test/perf/dashboard-perf.test";
import { runIncidentDetailSuite } from "../src/test/incident-detail.test";
import { runIncidentsFeedSuite } from "../src/test/incidents-feed.test";
import { runIncidentsSuite } from "../src/test/incidents.test";
import { runErrorAdapterSuite } from "../src/test/error-adapter.test";
import { runRealtimeSuite } from "../src/test/realtime.test";
import { runRouteRenderingSuite } from "../src/test/route-rendering.test";

type Suite = {
  name: string;
  tags: string[];
  run: () => Promise<void>;
};

const suites: Suite[] = [
  {
    name: "incidents",
    tags: ["incidents", "timeline"],
    run: runIncidentsSuite,
  },
  {
    name: "incidents-feed",
    tags: ["incidents", "feed", "integration"],
    run: runIncidentsFeedSuite,
  },
  {
    name: "incident-detail",
    tags: ["incidents", "detail", "timeline", "integration"],
    run: runIncidentDetailSuite,
  },
  {
    name: "phase-accuracy",
    tags: ["phase", "accuracy"],
    run: runAccuracySuite,
  },
  {
    name: "realtime",
    tags: ["realtime", "ws", "reconcile"],
    run: runRealtimeSuite,
  },
  {
    name: "error-adapter",
    tags: ["error-adapter", "error", "retry"],
    run: runErrorAdapterSuite,
  },
  {
    name: "backend-boundary",
    tags: ["boundary", "backend", "contracts"],
    run: runBackendBoundarySuite,
  },
  {
    name: "dashboard-perf",
    tags: ["perf", "acceptance"],
    run: runDashboardPerfSuite,
  },
  {
    name: "dashboard-realtime-e2e",
    tags: ["e2e", "realtime", "acceptance", "reconnect"],
    run: runDashboardRealtimeE2ESuite,
  },
  {
    name: "route-rendering",
    tags: ["routes", "render", "integration"],
    run: runRouteRenderingSuite,
  },
];

async function main() {
  const filters = process.argv
    .slice(2)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0 && value !== "--");
  const selected = suites.filter((suite) => {
    if (filters.length === 0) {
      return true;
    }
    return filters.every((filter) =>
      suite.name.includes(filter) || suite.tags.some((tag) => tag.includes(filter)),
    );
  });

  if (selected.length === 0) {
    throw new Error(`No test suites matched filters: ${filters.join(", ")}`);
  }

  for (const suite of selected) {
    await suite.run();
    console.log(`PASS ${suite.name}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`FAIL ${message}`);
  process.exit(1);
});