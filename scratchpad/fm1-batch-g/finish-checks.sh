#!/usr/bin/env bash
# FM1 finish checks after a generator re-run (22 Sep fix pass). Prints the summary line of each check.
# Usage: bash scratchpad/fm1-batch-g/finish-checks.sh [label]    (content:check is run separately)
cd "/c/Users/feras/Downloads/CCEA GCSE Top Learning Platform" || exit 2
out="scratchpad/fm1-batch-g/finish-${1:-run}.txt"
: > "$out"
run() { echo "### $*" >> "$out"; "$@" >> "$out" 2>&1; echo "exit $?" >> "$out"; }
run node scripts/qa/lesson-v2.mjs --unit fm1
run node scripts/qa/figure-leaks.mjs --unit fm1 --quiet
run node scripts/qa/shingles.mjs --unit fm1
run npm run insights:unregistered
run npx tsx scripts/keyword-soft.mts
run npx tsx scripts/qa/text-parts-vs-solutions.mts
run node scripts/qa/svg-draws.mjs
run node scripts/qa/gate-context.mjs
run npx tsx scratchpad/fm1-batch-g/check-marking.mts
run node scratchpad/fm1-batch-g/verify-published.mjs
run npx tsx scratchpad/fm1-batch-f/check-marking.mts
run node scratchpad/fm1-batch-f/verify-published.mjs
run npx tsx scratchpad/fm1-batch-g/probe-fixpass-0922.mts
run node scratchpad/fm1-batch-g/check-printed-arithmetic.mjs matrix-arithmetic matrix-inverse-2x2 matrix-equations matrix-simultaneous-equations laws-of-logarithms
# the summary lines only
grep -E "^### |^exit |lesson-v2:|figure-leaks:|shingle|unregistered|hard|zero|SVG|gate|probes|findings|route checks|FAIL|FINDING|equalities|ok, " "$out" | grep -v "^ok  " | tail -80
