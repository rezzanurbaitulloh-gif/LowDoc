#!/usr/bin/env node --experimental-strip-types --no-warnings
/* Repo-level conversion-matrix QA (PRD §70-71): every advertised pair must
   resolve to a path with a capability label; honesty invariants must hold.
   Run: node scripts/qa-matrix.mjs */
import {
  TARGETS,
  OUTPUT_GROUPS,
  LOWDOC_MATRIX,
  findPath,
  getCapability,
  supportedTargets,
  isSupportedInput,
} from "../lib/lowdoc/matrix.ts";

const SOURCES = Object.keys(LOWDOC_MATRIX);
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("FAIL:", msg);
};

console.log(`sources: ${SOURCES.length} | targets: ${TARGETS.length}`);

// 1. every matrix source is a recognized input
for (const src of SOURCES) {
  if (!isSupportedInput(src)) fail(`source .${src} not recognized by isSupportedInput`);
}

// 2. every target group target resolves for at least one source
const allTargets = new Set(TARGETS);
for (const t of allTargets) {
  const ok = SOURCES.some((s) => findPath(s, t));
  if (!ok) fail(`target .${t} unreachable from every source`);
}

// 3. every reachable pair has capability + local flag consistent with hops
let pathed = 0;
for (const src of SOURCES) {
  for (const t of TARGETS) {
    if (src === t) continue;
    const path = findPath(src, t);
    if (!path) continue;
    pathed++;
    const cap = getCapability(src, t);
    if (!cap) {
      fail(`${src}->${t} has path but no capability`);
      continue;
    }
    const usesOffice = path.some((h) => h.engine === "office");
    if (usesOffice === cap.local) fail(`${src}->${t} local flag inconsistent (office=${usesOffice}, local=${cap.local})`);
  }
}
console.log(`pathed pairs: ${pathed}`);

// 4. supportedTargets agrees with findPath
for (const src of SOURCES) {
  for (const t of supportedTargets(src)) {
    if (!findPath(src, t)) fail(`supportedTargets lists ${src}->${t} but findPath is null`);
  }
}

// 5. OUTPUT_GROUPS cover all targets exactly once
const grouped = OUTPUT_GROUPS.flatMap((g) => g.targets);
const missing = TARGETS.filter((t) => !grouped.includes(t));
const extra = grouped.filter((t) => !TARGETS.includes(t));
if (missing.length) fail(`targets missing from OUTPUT_GROUPS: ${missing.join(",")}`);
if (extra.length) fail(`OUTPUT_GROUPS lists unknown targets: ${extra.join(",")}`);

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("MATRIX QA: all checks passed");
