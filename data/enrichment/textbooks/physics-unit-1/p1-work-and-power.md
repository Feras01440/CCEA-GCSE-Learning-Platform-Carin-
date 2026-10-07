# p1-work-and-power: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy (difficulty 4) and the P1 deck (`data/decks/science/P1.json`) has 12 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.4.13, 1.4.14, 1.4.15, 1.4.16 and Prescribed Practical P4 (all Foundation).
**Verdict.** **Thinner** (nothing authored). The book teaches "no movement, no work" with good everyday cases, shows that only the distance along the force counts (a slope), converts cm to m and hours to seconds in its examples, and ends with a neat nail-gun problem joining work, energy and power. But its slope example has impossible numbers, it never states the specification's definition of work (energy changing form), and Practical P4 (personal power) is absent, though CCEA set it as a six-mark answer in 2025.

---

## 1. Book chapter and pages

Section 1.4: learning outcomes pp. 38–39; "Work" pp. 43–45 (when work is done, W = F × d, the joule, three worked examples); "Power" pp. 48–49 (definition, two equations, the watt, three worked examples, a James Watt box).

## 2. The book's teaching sequence

1. Work needs a force that moves something: pushing a wall or holding a book still does none, lifting a book does (p. 43).
2. Work = force × the distance moved along the line of the force; newtons times centimetres gives N cm, newtons times metres gives N m, and N m is the joule (p. 43).
3. Doing work uses energy, and the energy used equals the work done (p. 44).
4. Worked examples: dragging a crate at steady speed, a crane lifting a load, a motor pulling a load up a slope (pp. 44–45).
5. Power: how quickly work is done, or energy transferred; P = W/t and P = E/t; one joule each second is a watt (p. 48).
6. Worked examples: a motor lifting a load, a crane working for an hour, a nail gun (pp. 48–49).

## 3. Explanations and devices worth recreating (our own words)

- **No movement, no work** (p. 43). The wall and the held book are memorable non-examples; a tired arm is not work done on the book.
- **Steady speed tells you the force** (p. 44). The crate moves at steady speed, so the pull equals the friction, and the work is that force times the distance. The same move as in `p1-newtons-laws`.
- **Only the distance along the force** (p. 44). On a slope, the work done by a pull along the slope uses the distance along the slope; the load's weight and the horizontal distance are distractors. CCEA's Summer 2025 Higher Q4(a) set exactly this (a box pulled up a slope, 500 J; `docs/sources/papers/science/2025-Summer/P1-H-Physics-MS-67250.txt`).
- **Units before substituting** (pp. 44, 48). Centimetres to metres for work; hours to seconds for power. The Summer 2024 Higher report (Q6(a)) and March 2026 Foundation report (Q5(a)) say most lost marks by leaving centimetres; the March 2026 Higher report (Q7(a)) names minutes left unconverted and kJ handled the wrong way.
- **Energy, work and power in one problem** (pp. 48–49, nail gun). The nail's kinetic energy equals the work done by the wood's resistance, which gives the stopping distance; that work over the stopping time is a power. A strong synoptic example.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Recreation note for our first figures |
|---|---|---|---|
| Crate dragged on a floor (p. 44) | A crate with friction to the left, a forward force to the right, a 4 m movement arrow. | Work at steady speed. | Recreate with our numbers. |
| Load pulled up a slope (p. 45) | A ball on a ramp, a string along the slope to a motor, the slope length and tension marked, the horizontal distance and the weight marked. | Distance along the force. | Recreate **with consistent numbers** (section 7): the pull along the slope must be at least weight × height ÷ slope length. |
| James Watt (p. 49) | A short box on horsepower (about 750 W). | Context. | Optional aside. |

## 5. Worked examples, calculations and data tasks

- **Crate** (p. 44): work at steady speed, and the energy needed equals the work.
- **Crane** (p. 44): the weight of a load from the work done and a lift given in cm.
- **Slope** (pp. 44–45): work done by a tension along the slope; the weight and the horizontal distance not needed.
- **Motor** (p. 48): work in lifting, then power.
- **Crane for an hour** (p. 48): work from power × time, with the hour turned into seconds, answer in MJ.
- **Nail gun** (pp. 48–49): stopping distance from kinetic energy and resistive force; average power of the resistance.

## 6. Practice question types, with CCEA evidence

Work and power appear in almost every series, both tiers.

- **Calculate** work done from a force and a distance, often in cm (4; Summer 2024 Higher Q6(a), forklift: the report says many did not convert cm to m and scored 2 of 4).
- **Calculate** a power, or a time from a power (3–4; Summer 2025 Higher Q4(c), Summer 2024 Higher Q6(b), 2022 November Higher).
- **Define** power (2; Summer 2025 Higher Q4(b): a gating mark for energy or work, then one for "each second"; the report calls it the hardest part of the paper, and the Foundation report says candidates equated power with energy, force or strength).
- **State** the unit of power (1; March 2026 Foundation Q5(b): few could).
- **Describe** how to measure personal power (6; 2025 November Higher Q2: measuring tape or metre rule, a timer, the height of the stairs, the time, work = force × distance, power = work ÷ time; 2024 March Higher Q3: instruments tape, stopclock and balance or scales; measurements height, time and weight or mass). `docs/sources/papers/science/2025-November/P1-H-Physics-MS-68219.txt`.

## 7. Definitions and wording, and a book error

- **Work** (p. 43): the book says work is done only when a force causes movement. The specification (1.4.13) says work is done when energy changes from one form to another. Both are true; the second is the one to learn for "when is work done?", and the first is the reason the distance must be along the force.
- **Power** (p. 48): describing power as a rate of working is correct, but CCEA's scheme and glossary want "energy transferred (or work done) per second" (1.4.15). Teach the scheme's words; "rate" alone risks the second mark.
- **Book error: the slope example is physically impossible** (pp. 44–45). With a 6.5 m slope and a 5.0 m horizontal run, the height is about 4.2 m, so lifting the 130 N load needs at least about 540 J, yet the pull does only 390 J; a 60 N pull along that slope could not raise the load at all (it needs at least about 83 N). The teaching point (use the distance along the force) is right, but the numbers must not be reused or adapted.
- **Units**: work in joules, force in newtons, distance in metres (1.4.14); the book's N cm aside is true but not what CCEA asks for.

## 8. Higher-tier-only content in the book

None (all Foundation). Slope and multi-step items (work then power, or power then time) appear on the Higher paper.

## 9. Pitfalls and "remember" notes in the book

- Convert cm to m before W = F × d (p. 44).
- Convert hours or minutes to seconds before P = W/t (p. 48).
- Only the distance travelled along the line of the force counts (p. 44).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **W = F × d with conversions**: See it with a distance in cm; non-example that leaves it in cm (cite the Summer 2024 and March 2026 reports).
2. **Power defined in CCEA's words** (energy transferred per second), with "power is energy" and "power is strength" as non-examples (cite the Summer 2025 reports); the watt as 1 J/s.
3. **P = E/t and P = W/t three ways**, including time in minutes.
4. **Practical P4, personal power**: instruments (tape or metre rule, stopclock, scales), measurements (vertical height of the stairs, time, mass then weight), calculation (work = weight × height; power = work ÷ time), and why the vertical height, not the length of the stairs, is used; a six-mark Your turn.
5. **Work on a slope**, with consistent numbers, and the steady-speed crate.
6. **The nail-gun synoptic**, rebuilt on our own numbers, as a Higher stretch.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 12 deck cards agree with the book, the specification and the schemes; the deck's P4 card is the only place our material covers personal power.
