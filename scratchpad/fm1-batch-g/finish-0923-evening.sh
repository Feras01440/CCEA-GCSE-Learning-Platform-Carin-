#!/usr/bin/env bash
# 23 Sep evening (jobs 3, 4 and 5): every finish check and every marker probe, one summary line each.
#   bash scratchpad/fm1-batch-g/finish-0923-evening.sh [label]
cd "/c/Users/feras/Downloads/CCEA GCSE Top Learning Platform" || exit 2
out="scratchpad/fm1-batch-g/finish-0923-evening-${1:-run}.txt"
SP="C:/Users/feras/AppData/Local/Temp/claude/C--Users-feras-Downloads-CCEA-GCSE-Top-Learning-Platform"
FS="$SP/4355edb7-b61d-472c-a7be-db688e7e239b/scratchpad/platform/depth-standard/frozen-surface.mjs"
FORK="$SP/fff30cfd-5f49-45b6-b15c-ad0472230398/scratchpad"
BAK="scratchpad/fm1-batch-g/bak-0923-job45"
EIGHT="area-under-curve indicial-equations log-log-graphs logarithms-from-indices matrix-arithmetic matrix-inverse-2x2 matrix-equations matrix-simultaneous-equations"
: > "$out"
run() { echo "### $*" >> "$out"; "$@" >> "$out" 2>&1; echo "exit $?" >> "$out"; }
date -u +"started %Y-%m-%dT%H:%M:%SZ" >> "$out"
run npm run content:check
run node scripts/qa/lesson-v2.mjs --unit fm1 --depth
run node "$FS" check packs/further-maths/content/fm1/laws-of-logarithms "$BAK/laws-of-logarithms/frozen-before.json"
run node "$FS" check packs/further-maths/content/fm1/tangents-and-normals "$BAK/tangents-and-normals/frozen-before.json"
run node "$FS" check packs/further-maths/content/fm1/algebraic-fractions-simplify "$BAK/algebraic-fractions-simplify/frozen-before.json"
run npx tsx scratchpad/fm1-batch-g/depth-pilot/probe-depth-laws.mts
run npx tsx scratchpad/fm1-batch-g/depth-pilot/probe-depth-tangents.mts
run npx tsx scratchpad/fm1-batch-g/probe-afs-ftm01.mts
run npx tsx scratchpad/fm1-batch-g/probe-afs-gates.mts
run npx tsx scratchpad/fm1-batch-g/probe-drafts-0923.mts
run npx tsx scratchpad/fm1-batch-f/check-marking.mts
run node scratchpad/fm1-batch-f/verify-published.mjs
run npx tsx scratchpad/fm1-batch-f/probe-logs-0922.mts
run npx tsx scratchpad/fm1-batch-g/check-marking.mts
run node scratchpad/fm1-batch-g/verify-published.mjs
run npx tsx scratchpad/fm1-batch-g/probe-fixpass-0922.mts
run node scratchpad/fm1-batch-g/check-printed-arithmetic.mjs $EIGHT laws-of-logarithms
run npx tsx "$FORK/fm1-batch-d/check-marking.mts"
run node "$FORK/fm1-batch-d/verify-published.mjs"
run npx tsx "$FORK/fm1-batch-a/check-marking.mts"
run node scripts/qa/figure-leaks.mjs --unit fm1
run node scripts/qa/shingles.mjs --unit fm1
run npm run insights:unregistered
run npx tsx scripts/keyword-soft.mts
run npx tsx scripts/qa/text-parts-vs-solutions.mts
run node scripts/qa/svg-draws.mjs
run node scripts/qa/gate-context.mjs
date -u +"finished %Y-%m-%dT%H:%M:%SZ" >> "$out"
grep -E "^### |^exit |^started|^finished|topic bundle\(s\) published|lesson-v2:|^depth:|meets the floor|laws-of-logarithms  H5|tangents-and-normals  H4|frozen-surface:|CHANGED|probe-|marker self-check|verify-published:|no findings|FINDING|ok, [0-9]+ FAIL|printed arithmetic|published values|attributed|no route reached|assertions|marking check|figure-leaks:|No breach|BREACH|further-maths:|hard, [0-9]+ soft|zero, [0-9]+ partial|svgs scanned|gates [0-9]+ \|" "$out" | grep -v "^ok  "
