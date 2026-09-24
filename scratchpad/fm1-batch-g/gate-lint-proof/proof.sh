#!/usr/bin/env bash
# 23 Sep: proof for lesson-v2's "gates that give nothing away" rule.
# Passes on the published (restored) fm1/algebraic-fractions-simplify; fails on a scratch copy of the 13 Sep broken pair
# (packs/ below holds bak-0923's note.blocks.json and bundle.json, taken before the restore).
ROOT="/c/Users/feras/Downloads/CCEA GCSE Top Learning Platform"
cd "$ROOT" && echo "--- published corpus (must pass):" && node scripts/qa/lesson-v2.mjs --unit fm1 | tail -2
mkdir -p "$ROOT/scratchpad/fm1-batch-g/gate-lint-proof/scripts/qa"
cp "$ROOT/scripts/qa/gate-context.mjs" "$ROOT/scratchpad/fm1-batch-g/gate-lint-proof/scripts/qa/"
cd "$ROOT/scratchpad/fm1-batch-g/gate-lint-proof" && echo "--- scratch copy of the broken pair (must fail):" && node "$ROOT/scripts/qa/lesson-v2.mjs" --unit fm1
echo "exit=$?"
