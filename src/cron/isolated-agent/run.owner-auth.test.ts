import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../agents/test-helpers/fast-coding-tools.js";
import { createOpenClawCodingTools } from "../../agents/pi-tools.js";
import {
  clearFastTestEnv,
  loadRunCronIsolatedAgentTurn,
  resetRunCronIsolatedAgentTurnHarness,
  resolveDeliveryTargetMock,
  restoreFastTestEnv,
  runEmbeddedPiAgentMock,
  runWithModelFallbackMock,
} from "./run.test-harness.js";

const runCronIsolatedAgentTurn = await loadRunCronIsolatedAgentTurn();

function makeParams() {
  return {
    cfg: {},
    deps: {} as never,
    job: {
      id: "owner-auth",
      name: "Owner Auth",
      schedule: { kind: "every", everyMs: 60_000 },
      sessionTarget: "isolated",
      payload: { kind: "agentTurn", message: "check owner tools" },
      delivery: { mode: "none" },
    } as never,
    message: "check owner tools",
    sessionKey: "cron:owner-auth",
  };
}

describe("runCronIsolatedAgentTurn owner auth", () => {
  let previousFastTestEnv: string | undefined;

  beforeEach(() => {
    previousFastTestEnv = clearFastTestEnv();
    resetRunCronIsolatedAgentTurnHarness();
    resolveDeliveryTargetMock.mockResolvedValue({
      channel: "telegram",
      to: "123",
      accountId: undefined,
      error: undefined,
    });
    runWithModelFallbackMock.mockImplementation(async ({ provider, model, run }) => {
      const result = await run(provider, model);
      return { result, provider, model, attempts: [] };
    });
  });

  afterEach(() => {
    restoreFastTestEnv(previousFastTestEnv);
  });

  it("passes senderIsOwner=true to isolated cron agent runs", async () => {
    const randomUuidSpy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("11111111-1111-4111-8111-111111111111");
    await runCronIsolatedAgentTurn(makeParams());
    randomUuidSpy.mockRestore();

    expect(runEmbeddedPiAgentMock).toHaveBeenCalledTimes(1);
    const senderIsOwner = runEmbeddedPiAgentMock.mock.calls[0]?.[0]?.senderIsOwner;
    expect(senderIsOwner).toBe(true);
    expect(runWithModelFallbackMock.mock.calls[0]?.[0]?.runId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(runEmbeddedPiAgentMock.mock.calls[0]?.[0]?.runId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(runEmbeddedPiAgentMock.mock.calls[0]?.[0]?.runId).not.toBe("test-session-id");

    const toolNames = createOpenClawCodingTools({ senderIsOwner }).map((tool) => tool.name);
    expect(toolNames).toContain("cron");
    expect(toolNames).toContain("gateway");
  });
});
