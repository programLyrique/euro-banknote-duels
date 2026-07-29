import test from "node:test";
import assert from "node:assert/strict";
import { TEXT } from "../site/js/translations.js";

function placeholders(value) {
  return [...value.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();
}

test("all locales contain the same interface strings and placeholders", () => {
  const referenceKeys = Object.keys(TEXT.en).sort();
  for (const [locale, strings] of Object.entries(TEXT)) {
    assert.deepEqual(Object.keys(strings).sort(), referenceKeys, `${locale} has a different set of translation keys`);
    for (const key of referenceKeys) {
      assert.equal(strings[key].trim().length > 0, true, `${locale}.${key} is empty`);
      assert.deepEqual(placeholders(strings[key]), placeholders(TEXT.en[key]), `${locale}.${key} has different placeholders`);
    }
  }
});
