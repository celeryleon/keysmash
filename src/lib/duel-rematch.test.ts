import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { canRematch, isUuid } from "./duel-rematch";

const ME = "11111111-1111-4111-8111-111111111111";
const ALEX = "22222222-2222-4222-8222-222222222222";

// Minimal stand-in for the query builder chain canRematch uses. Records the
// `or` filter and resolves with the given rows.
function fakeClient(rows: { id: string }[] | null, error: unknown = null) {
  const calls: { or?: string } = {};
  const builder = {
    select: () => builder,
    not: () => builder,
    or: (filter: string) => {
      calls.or = filter;
      return builder;
    },
    limit: () => Promise.resolve({ data: rows, error }),
  };
  const client = { from: () => builder } as unknown as SupabaseClient<Database>;
  return { client, calls };
}

// Any query against this client fails the test.
const throwingClient = {
  from: () => {
    throw new Error("should not query");
  },
} as unknown as SupabaseClient<Database>;

describe("isUuid", () => {
  it("accepts a canonical UUID in either case", () => {
    expect(isUuid(ME)).toBe(true);
    expect(isUuid("ABCDEF12-3456-4789-ABCD-EF1234567890")).toBe(true);
  });

  it("rejects non-UUID values", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid(`${ME},challengee_wpm.is.null`)).toBe(false);
    expect(isUuid(`${ME})`)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid(42)).toBe(false);
    expect(isUuid([ME])).toBe(false);
  });
});

describe("canRematch", () => {
  it("rejects a malformed opponent id without querying", async () => {
    expect(await canRematch(throwingClient, ME, "x),or(id.neq.0")).toBe(false);
    expect(await canRematch(throwingClient, ME, undefined)).toBe(false);
  });

  it("rejects a rematch against yourself without querying", async () => {
    expect(await canRematch(throwingClient, ME, ME)).toBe(false);
  });

  it("is true when a completed duel exists between the two users", async () => {
    const { client, calls } = fakeClient([{ id: "duel-1" }]);
    expect(await canRematch(client, ME, ALEX)).toBe(true);
    expect(calls.or).toContain(
      `and(challenger_user_id.eq.${ME},challengee_user_id.eq.${ALEX})`
    );
    expect(calls.or).toContain(
      `and(challenger_user_id.eq.${ALEX},challengee_user_id.eq.${ME})`
    );
  });

  it("is false when no completed duel exists", async () => {
    expect(await canRematch(fakeClient([]).client, ME, ALEX)).toBe(false);
    expect(await canRematch(fakeClient(null).client, ME, ALEX)).toBe(false);
  });

  it("is false when the lookup errors", async () => {
    const { client } = fakeClient(null, { message: "boom" });
    expect(await canRematch(client, ME, ALEX)).toBe(false);
  });
});
