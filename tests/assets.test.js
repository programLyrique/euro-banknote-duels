import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DENOMINATIONS, DESIGNS } from "../site/js/designs.js";

const root = fileURLToPath(new URL("../site/assets/banknotes/", import.meta.url));

test("all 120 ECB proposal images are bundled", async () => {
  const expected = DESIGNS.flatMap(({ id }) => DENOMINATIONS.flatMap((denomination) => ["front", "back"].map((side) =>
    `${root}banknote-design-proposal-${id.toLowerCase()}-${denomination}-${side}.jpg`,
  )));
  assert.equal(expected.length, 120);
  await Promise.all(expected.map((path) => access(path)));
});
