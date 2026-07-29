export const SESSION_VERSION = 1;

export function pairKey(pair) {
  return [...pair].sort().join("");
}

export function allPairs(ids) {
  const pairs = [];
  for (let left = 0; left < ids.length; left += 1) {
    for (let right = left + 1; right < ids.length; right += 1) {
      pairs.push([ids[left], ids[right]]);
    }
  }
  return pairs;
}

export function shuffle(items, random = Math.random) {
  const result = items.map((item) => Array.isArray(item) ? [...item] : item);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createSession(ids, random = Math.random) {
  const pairs = shuffle(allPairs(ids), random).map((pair) => random() < 0.5 ? pair : [pair[1], pair[0]]);
  return {
    version: SESSION_VERSION,
    pairs,
    votes: {},
    index: 0,
    denomination: 20,
    side: "front",
  };
}

export function voteFor(session, winner) {
  if (session.index < 0 || session.index >= session.pairs.length) throw new RangeError("No active matchup");
  const pair = session.pairs[session.index];
  if (!pair.includes(winner)) throw new TypeError("Winner must belong to the active matchup");
  return {
    ...session,
    votes: { ...session.votes, [pairKey(pair)]: winner },
    index: session.index + 1,
  };
}

export function previous(session) {
  return { ...session, index: Math.max(0, session.index - 1) };
}

export function rank(ids, votes) {
  const scores = Object.fromEntries(ids.map((id) => [id, 0]));
  Object.values(votes).forEach((winner) => {
    if (winner in scores) scores[winner] += 1;
  });
  return ids
    .map((id) => ({ id, wins: scores[id] }))
    .sort((a, b) => b.wins - a.wins || ids.indexOf(a.id) - ids.indexOf(b.id));
}

export function winners(ids, votes) {
  const ranking = rank(ids, votes);
  const best = ranking[0]?.wins ?? 0;
  return ranking.filter((entry) => entry.wins === best);
}

export function isValidSession(value, ids) {
  if (!value || value.version !== SESSION_VERSION || !Array.isArray(value.pairs) || typeof value.votes !== "object") return false;
  const expected = allPairs(ids).map(pairKey).sort();
  const actual = value.pairs.map((pair) => Array.isArray(pair) && pair.length === 2 ? pairKey(pair) : "").sort();
  if (expected.length !== actual.length || !expected.every((key, index) => key === actual[index])) return false;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index > value.pairs.length) return false;
  if (![5, 10, 20, 50, 100, 200].includes(value.denomination) || !["front", "back"].includes(value.side)) return false;
  return Object.entries(value.votes).every(([key, winner]) => expected.includes(key) && key.includes(winner));
}
