import { afterEach, describe, expect, it, vi } from "vitest";
import Allowlist from "../lib/allowlist.js";
import audit from "../lib/audit.js";
import * as npmAuditor from "../lib/npm-auditor.js";
import * as pnpmAuditor from "../lib/pnpm-auditor.js";
import * as yarnAuditor from "../lib/yarn-auditor.js";
import { config } from "./common.js";

describe("audit retry and pass-enoaudit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retries npm audits when the registry does not support audit", async () => {
    const auditSpy = vi
      .spyOn(npmAuditor, "auditWithFullConfig")
      .mockRejectedValueOnce(
        new Error(
          "Your configured registry (https://registry.example.com/) does not support audit requests.",
        ),
      )
      .mockResolvedValueOnce({
        advisoriesFound: [],
        failedLevelsFound: [],
        allowlistedAdvisoriesNotFound: [],
        allowlistedModulesNotFound: [],
        allowlistedPathsNotFound: [],
        allowlistedAdvisoriesFound: [],
        allowlistedModulesFound: [],
        allowlistedPathsFound: [],
        advisoryPathsFound: [],
      });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await audit(
      config({
        "package-manager": "npm",
        "retry-count": 1,
        levels: { low: true },
      }),
    );

    expect(auditSpy).toHaveBeenCalledTimes(2);
    expect(logSpy.mock.calls.some((call) => call[0] === "Retrying audit...")).toBe(true);
  });

  it("passes without auditing when pass-enoaudit is enabled for npm", async () => {
    vi.spyOn(npmAuditor, "auditWithFullConfig").mockRejectedValue(
      new Error(
        "Your configured registry (https://registry.example.com/) does not support audit requests.",
      ),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await audit(
      config({
        "package-manager": "npm",
        "pass-enoaudit": true,
        "retry-count": 0,
        levels: { low: true },
      }),
    );

    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("retries yarn audits on transient 503 responses", async () => {
    const auditSpy = vi
      .spyOn(yarnAuditor, "auditWithFullConfig")
      .mockRejectedValueOnce(new Error('Request failed "503 Service Unavailable"'))
      .mockResolvedValueOnce({
        advisoriesFound: [],
        failedLevelsFound: [],
        allowlistedAdvisoriesNotFound: [],
        allowlistedModulesNotFound: [],
        allowlistedPathsNotFound: [],
        allowlistedAdvisoriesFound: [],
        allowlistedModulesFound: [],
        allowlistedPathsFound: [],
        advisoryPathsFound: [],
      });

    await audit(
      config({
        "package-manager": "yarn",
        "retry-count": 1,
        "output-format": "json",
        levels: { low: true },
      }),
    );

    expect(auditSpy).toHaveBeenCalledTimes(2);
  });

  it("retries pnpm audits when the registry does not support audit", async () => {
    const auditSpy = vi
      .spyOn(pnpmAuditor, "auditWithFullConfig")
      .mockRejectedValueOnce(
        new Error(
          "Your configured registry (https://registry.example.com/) does not support audit requests.",
        ),
      )
      .mockResolvedValueOnce({
        advisoriesFound: [],
        failedLevelsFound: [],
        allowlistedAdvisoriesNotFound: [],
        allowlistedModulesNotFound: [],
        allowlistedPathsNotFound: [],
        allowlistedAdvisoriesFound: [],
        allowlistedModulesFound: [],
        allowlistedPathsFound: [],
        advisoryPathsFound: [],
      });

    await audit(
      config({
        "package-manager": "pnpm",
        "retry-count": 1,
        "output-format": "json",
        levels: { low: true },
      }),
    );

    expect(auditSpy).toHaveBeenCalledTimes(2);
  });

  it("rethrows non-retryable audit failures", async () => {
    vi.spyOn(npmAuditor, "auditWithFullConfig").mockRejectedValue(
      new Error("Failed security audit due to high vulnerabilities."),
    );

    await expect(
      audit(
        config({
          "package-manager": "npm",
          "retry-count": 3,
          allowlist: new Allowlist([]),
          levels: { high: true },
        }),
      ),
    ).rejects.toThrow("Failed security audit");
  });
});
