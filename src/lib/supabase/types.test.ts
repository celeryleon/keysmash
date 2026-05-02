import { describe, it, expectTypeOf } from "vitest";
import type { Profile, Duel } from "./types";

// These are compile-time assertions. The Vitest runtime is just here to keep
// the file in the test runner's view. If types.ts drifts from the live schema
// (typos, wrong nullability, missing columns), the type checker fails before
// the test runs.

describe("Profile type shape", () => {
  it("has streak columns from migration 003", () => {
    expectTypeOf<Profile>().toHaveProperty("current_streak").toEqualTypeOf<number>();
    expectTypeOf<Profile>().toHaveProperty("longest_streak").toEqualTypeOf<number>();
    expectTypeOf<Profile>().toHaveProperty("last_attempt_date").toEqualTypeOf<string | null>();
  });
});

describe("Duel type shape", () => {
  it("has identity columns from migration 003", () => {
    expectTypeOf<Duel>().toHaveProperty("challenger_user_id").toEqualTypeOf<string | null>();
    expectTypeOf<Duel>().toHaveProperty("intended_opponent_user_id").toEqualTypeOf<string | null>();
    expectTypeOf<Duel>().toHaveProperty("challengee_user_id").toEqualTypeOf<string | null>();
  });

  it("preserves pre-existing columns", () => {
    expectTypeOf<Duel>().toHaveProperty("passage_index").toEqualTypeOf<number>();
    expectTypeOf<Duel>().toHaveProperty("challenger_wpm").toEqualTypeOf<number>();
    expectTypeOf<Duel>().toHaveProperty("challengee_wpm").toEqualTypeOf<number | null>();
  });
});
