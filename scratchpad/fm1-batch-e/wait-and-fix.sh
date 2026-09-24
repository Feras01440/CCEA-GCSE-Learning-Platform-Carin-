#!/bin/bash
# Poll every five minutes and apply the waiting figure edits the moment each file has been quiet
# for thirty minutes. Both fixers re-read from disk and re-assert the spec hashes on every pass,
# so a pass that finds a file still warm simply skips it and tries again later.
cd "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform" || exit 1
LOG=scratchpad/fm1-batch-e/wait-and-fix.log
for i in $(seq 1 30); do
  {
    echo "=== pass $i  $(date +%H:%M:%S)"
    node scratchpad/fm1-batch-e/fix-figures-m3-m4.mjs 2>&1 | grep -E "^(FIXED|SKIPPED|NO MATCH|FAIL|MISSING)|^edited"
    node scratchpad/fm1-batch-e/fix-figures-m7.mjs 2>&1 | grep -E "^(FIXED|SKIPPED|NO MATCH|FAIL|MISSING)|^edited"
  } >> "$LOG" 2>&1
  waiting=$( { node scratchpad/fm1-batch-e/fix-figures-m3-m4.mjs --dry; node scratchpad/fm1-batch-e/fix-figures-m7.mjs --dry; } 2>/dev/null | grep -c "^SKIPPED\|^WOULD FIX" )
  echo "    outstanding: $waiting" >> "$LOG"
  if [ "$waiting" = "0" ]; then echo "ALL APPLIED at $(date +%H:%M:%S)" >> "$LOG"; break; fi
  sleep 300
done
echo "poller finished at $(date +%H:%M:%S)" >> "$LOG"
