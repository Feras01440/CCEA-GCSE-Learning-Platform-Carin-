# p1-forces-and-resultant: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 7 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.2.1, 1.2.2, 1.2.3 (all Foundation).
**Verdict.** **Thinner** (nothing authored). The book handles resultants well (same direction, opposite directions, equal and opposite, signs) and has one strong crate example, but it never teaches the first half of 1.2.1: that forces come in equal and opposite pairs acting on two different objects. CCEA examined exactly that in Summer 2024, and the report says only the most able answered it.

---

## 1. Book chapter and pages

Section 1.2 (Force): learning outcomes p. 14; "Forces" pp. 15–16 (the newton, a 1 kg mass pressing on a bench, resultants by diagram, signs); the crate worked example p. 18; driving, drag and braking forces on a car p. 19.

## 2. The book's teaching sequence

1. Force is measured in newtons; a 1 kg mass resting on a bench presses down with 10 N (p. 15).
2. Two forces the same way: add them; the resultant points that way (p. 15).
3. Two forces opposite ways: subtract; the resultant points the way of the larger (p. 15).
4. Equal and opposite on one object: resultant zero (p. 16).
5. Signs: pick right as positive, so a leftward force is negative; a block sliding right with a larger leftward force has a negative resultant (p. 16).
6. The crate (p. 18) and the car (p. 19) carry the idea into motion, which belongs to `p1-newtons-laws`.

## 3. Explanations and devices worth recreating (our own words)

- **Arrow diagrams for each case** (p. 15). Two arrows tip-to-tail for the same direction and head-to-head for opposite directions, each with its resultant stated beside it. Simple, and the right first picture.
- **Motion one way, resultant the other** (p. 16). A block still sliding right while the bigger force points left: the resultant is negative, and (the book does not say this, but our note should) the block is slowing down. This separates "which way it moves" from "which way the resultant points", the confusion behind many wrong answers.
- **Zero resultant does not mean stopped** (p. 18, crate (iv)). When friction grows to match the pull, the crate keeps sliding at a steady speed. A clean non-example for the belief that motion needs a resultant force.
- **Name the opposing force** (p. 18, crate (a)). The first part is simply "what is this force called?" (friction). CCEA asks the same: 2024 November Higher Q2(i) wanted friction, air resistance or drag for a plane.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Recreation note for our first figures |
|---|---|---|---|
| Two pairs of force arrows (p. 15) | Two arrows of different lengths pointing the same way; two pointing opposite ways. | Adding and subtracting. | Our own arrows to scale, labelled with signed values once the sign rule is taught. |
| Block with two opposing forces (p. 16) | A block, a long arrow left, a short arrow right, a direction-of-motion arrow to the right. | Signs; motion against resultant. | Recreate with our numbers; add a caption saying the block slows. |
| Crate on a floor (p. 18) | A dark block, a pulling force to the right, friction to the left at the base, a motion arrow above. | Finding a force from a resultant. | Recreate; ask for the pulling force from a given resultant. |
| Car with drag and driving force; car with braking and driving force (p. 19) | A car with a short and a long arrow in each case. | Unbalanced forces and the change in motion. | Use in `p1-newtons-laws`; for this topic, reuse as "find the resultant" with numbers. |

## 5. Worked examples, calculations and data tasks

- **Resultant by addition and by subtraction** (p. 15): two forces of 8 N and 12 N, first together, then opposed. Use different numbers in our items.
- **Signed resultant** (p. 16): a block moving right with a larger force to the left; the answer given both as "8 N to the left" and as a negative number.
- **Crate** (p. 18): name the opposing force; find the pulling force when the resultant is known (pull minus friction equals resultant); describe the motion (it speeds up towards the pull); then friction rises to equal the pull and the crate moves on at constant velocity.

## 6. Practice question types, with CCEA evidence

- **Compare** two forces when an object accelerates, and **say** whether the backward force is positive or negative, and **name** it (3; 2024 November Higher Q2(i), scheme `docs/sources/papers/science/2024-November/P1-H-Physics-MS-58560.txt`: forward greater; negative; friction, air resistance or drag).
- **Compare** upward and downward forces at constant height (1; same paper Q2(ii): the same size).
- **Equal and opposite pairs between objects** (1; 2024 Summer Higher Q4(i): a pin held at rest between a finger and a thumb; the forces are equal; the report says only the most able saw this).
- **Calculate** a resultant, or a missing force from a resultant (2–3; inside many Newton's-law questions).
- **State** the effect of a resultant force (1; 2019 March Higher Q1(a) and 2022 March Higher Q8(a) ask what an unbalanced force always produces (an acceleration, or a change in velocity); it belongs with `p1-newtons-laws`).

## 7. Definitions and wording

- **Newton** (p. 15): the unit of force; the book also gives the newton's definition from F = ma later (p. 19).
- **Friction** is named but never defined in the body; the specification's wording (1.2.1: a force that always opposes motion) appears only in the book's learning-outcome list (p. 14). Our deck card uses the specification's wording, which is right.
- **Signs** (p. 16): the book's convention (one direction positive, the other negative) is the specification's 1.2.2 wording.
- **Forces in pairs**: not taught. The specification's 1.2.1 (forces arise between objects; the forces on these objects are equal and opposite) needs its own explanation: the two forces act on **different** objects, which is why they never cancel each other.

## 8. Higher-tier-only content in the book

None (1.2.1–1.2.3 are Foundation).

## 9. Pitfalls and "remember" notes in the book

- The resultant of opposite forces points the way of the larger one (p. 15).
- A resultant of zero leaves the motion unchanged: still at rest, or steady speed in a straight line (pp. 16, 18).
- Give the direction with the size: "to the left" or a minus sign (p. 16).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **Resultants in a line, with signs.** Explain, then See it on our own two-force cases (same way, opposite ways, equal), then Your turn; every answer with a size and a direction.
2. **Pairs of forces between two objects.** Explain with the pin-between-finger-and-thumb picture: the finger pushes the pin, the pin pushes the finger back equally; each force acts on a different object, so they do not add to a resultant on one object. Your turn modelled on the 2024 Summer item (new context: a book pressed between two hands).
3. **Friction always opposes motion.** One figure where the motion reverses and the friction arrow reverses with it.
4. **Find the missing force.** See it: pull minus friction equals a given resultant; twin where the resultant is zero (steady speed).
5. **Motion against resultant.** A Your turn where the object moves one way and the resultant points the other: it slows down.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 7 deck cards agree with the book and the specification. One card ("Balanced forces give a resultant of ____ N") is fine; consider adding a card for the pair rule (equal and opposite forces act on different objects), which the deck lacks.
