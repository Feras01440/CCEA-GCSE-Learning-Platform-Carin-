#!/usr/bin/env bash
# Depth pilot finish checks (23 Sep): every check's summary line, for one topic slug. content:check is run separately.
#   bash scratchpad/fm1-batch-g/depth-pilot/finish-depth.sh <slug> [label]
cd "/c/Users/feras/Downloads/CCEA GCSE Top Learning Platform" || exit 2
slug="$1"; out="scratchpad/fm1-batch-g/depth-pilot/finish-${slug}-${2:-run}.txt"
FS="C:/Users/feras/AppData/Local/Temp/claude/C--Users-feras-Downloads-CCEA-GCSE-Top-Learning-Platform/4355edb7-b61d-472c-a7be-db688e7e239b/scratchpad/platform/depth-standard/frozen-surface.mjs"
: > "$out"
run() { echo "### $*" >> "$out"; "$@" >> "$out" 2>&1; echo "exit $?" >> "$out"; }
run node "$FS" check "packs/further-maths/content/fm1/$slug" "scratchpad/fm1-batch-g/depth-pilot/$slug.before.json"
run node scripts/qa/lesson-v2.mjs --unit fm1
run node scripts/qa/figure-leaks.mjs --unit fm1 --quiet
run node scripts/qa/shingles.mjs --unit fm1
run npm run insights:unregistered
run npx tsx scripts/keyword-soft.mts
run npx tsx scripts/qa/text-parts-vs-solutions.mts
run node scripts/qa/svg-draws.mjs
run node scripts/qa/gate-context.mjs
grep -E "^### |^exit |frozen-surface:|lesson-v2:|^depth:|figure-leaks|leak|shingle|unregistered|hard|zero|SVG|svg|gates [0-9]|FAIL|FINDING|$slug" "$out" | grep -v "^ok  " | tail -60
