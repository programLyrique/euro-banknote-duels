import test from "node:test";
import assert from "node:assert/strict";
import { allPairs, createSession, isValidSession, pairKey, previous, rank, voteFor, winners } from "../site/js/tournament.js";

const IDS = "ABCDEFGHIJ".split("");

test("creates every unordered matchup exactly once", () => {
  const pairs = allPairs(IDS);
  assert.equal(pairs.length, 45);
  assert.equal(new Set(pairs.map(pairKey)).size, 45);
  IDS.forEach((id) => assert.equal(pairs.filter((pair) => pair.includes(id)).length, 9));
});

test("creates a valid shuffled session", () => {
  let seed = 0;
  const values = [0.71, 0.12, 0.93, 0.34, 0.58];
  const session = createSession(IDS, () => values[(seed += 1) % values.length]);
  assert.equal(isValidSession(session, IDS), true);
  assert.equal(session.index, 0);
  assert.equal(session.denomination, 20);
  assert.equal(session.side, "front");
});

test("records, revisits, and revises a vote", () => {
  let session = createSession(IDS, () => 0.5);
  const pair = session.pairs[0];
  session = voteFor(session, pair[0]);
  assert.equal(session.votes[pairKey(pair)], pair[0]);
  session = previous(session);
  session = voteFor(session, pair[1]);
  assert.equal(session.votes[pairKey(pair)], pair[1]);
  assert.equal(session.index, 1);
});

test("rejects malformed or incompatible saved sessions", () => {
  const session = createSession(IDS, () => 0.5);
  assert.equal(isValidSession({ ...session, version: 999 }, IDS), false);
  assert.equal(isValidSession({ ...session, pairs: session.pairs.slice(1) }, IDS), false);
  assert.equal(isValidSession({ ...session, index: 46 }, IDS), false);
  assert.equal(isValidSession({ ...session, side: "edge" }, IDS), false);
});

test("ranks by wins and preserves a shared first place", () => {
  const votes = { AB: "A", AC: "A", BC: "B" };
  const ranking = rank(["A", "B", "C"], votes);
  assert.deepEqual(ranking, [
    { id: "A", wins: 2 },
    { id: "B", wins: 1 },
    { id: "C", wins: 0 },
  ]);
  assert.deepEqual(winners(["A", "B", "C"], { AB: "A", AC: "C", BC: "B" }), [
    { id: "A", wins: 1 },
    { id: "B", wins: 1 },
    { id: "C", wins: 1 },
  ]);
});

test("requires the winner to be in the active pair", () => {
  const session = createSession(IDS, () => 0.5);
  const invalid = IDS.find((id) => !session.pairs[0].includes(id));
  assert.throws(() => voteFor(session, invalid), /active matchup/);
});
