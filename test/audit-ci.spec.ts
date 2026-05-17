import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/audit.js", () => ({
  default: vi.fn(),
}));

vi.mock("../lib/config.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/config.js")>();
  return {
    ...actual,
    runYargs: vi.fn(),
  };
});

import audit from "../lib/audit.js";
import { runAuditCi } from "../lib/audit-ci.js";
import { runYargs } from "../lib/config.js";

describe("runAuditCi", () => {
  afterEach(() => {
    vi.clearAllMocks();
    process.exitCode = undefined;
  });

  it("does not print Passed when pass-enoaudit skips the audit", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(runYargs).mockResolvedValue({
      "package-manager": "npm",
      "output-format": "text",
      "pass-enoaudit": true,
      "retry-count": 0,
      directory: process.cwd(),
      "report-type": "important",
      levels: { low: true, moderate: true, high: true, critical: true },
      allowlist: {
        advisories: [],
        paths: [],
        modules: [],
        advisoryRecords: [],
        moduleRecords: [],
        pathRecords: [],
      },
      "extra-args": [],
      "skip-dev": false,
      registry: "https://registry.npmjs.org",
      "show-not-found": true,
      "show-found": true,
      report: false,
      summary: false,
    });
    vi.mocked(audit).mockResolvedValue(undefined);

    await runAuditCi();

    expect(logSpy.mock.calls.some((call) => String(call[1]).includes("Passed"))).toBe(false);
    expect(process.exitCode).toBeUndefined();
  });
});
