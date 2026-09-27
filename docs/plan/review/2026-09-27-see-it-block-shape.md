# The See it block: its shape in note.blocks.json (27 Sep 2026)

For the Slides and Read renderers and for the FM1 migration authors, so both read one shape. It applies the teach-first case (docs/plan/review/2026-09-24-teach-first-case.md, §6 and §8.3) as the owner approved it on 27 Sep, with the owner's eight answers. `pipeline/prompts/author-topic.md` carries the same text for authors; `scripts/qa/lesson-v2.mjs` checks it.

## 1. A teaching section, in order

```
{ "type": "h", "text": "2. Factorise first", "role": "variant" }      ← the section heading; role as today
  explanation: 1 to 3 blocks (p, a titled why/mustknow/examiner callout, a figure the prose reads),
               each p or callout ≤ 75 words, ≤ 225 words in all
{ "type": "see", … }                                                   ← the See it: our own worked steps (§2)
{ "type": "video", … } or { "type": "sim", … }                         ← optional, beside the See it, never instead of it
{ "type": "gate", … }                                                  ← the Your turn: the section's last block (§3)
```

- **Roles.** The heading keeps the depth standard's roles (`idea`, `why`, `variant`, `twists`, `further`, `derivation`, `recap`, `pointer`). A See it is a block inside its section, not a section of its own. A heading with role `see` ("See it done at writing speed") is still allowed; it continues the section above, and it too needs a `see` block before any gate it holds.
- Nothing is asked before its section has explained and shown: the gate never precedes the section's `see` block.

## 2. The See it block

The steps are **exactly the schema's `WorkedExampleStep`** (`src/lib/content/schema.ts`), so the type, the step renderer and the conversion from a bundle worked example come for free.

```json
{
  "type": "see",
  "stem": "Simplify $\\dfrac{x^2 - 9}{x^2 + 5x + 6}$.",
  "figure": { "kind": "svg", "src": "…", "alt": "…" },
  "steps": [
    { "n": 1, "working": "$x^2 - 9 = (x + 3)(x - 3)$", "decision": "Factorise the top first: a difference of two squares.", "earns": ["MW1"] },
    { "n": 2, "working": "$x^2 + 5x + 6 = (x + 3)(x + 2)$", "decision": "Then the bottom: two numbers that multiply to 6 and add to 5.", "earns": ["MW1"] },
    { "n": 3, "working": "$\\dfrac{x - 3}{x + 2}$", "decision": "Divide out the common bracket $(x + 3)$: it is a factor of both lines.", "earns": ["W1"] }
  ],
  "finalAnswer": "$\\dfrac{x - 3}{x + 2}$"
}
```

| field | required | what |
|---|---|---|
| `type` | yes | `"see"` |
| `stem` | yes | the example, with its maths (`$…$`), as the paper would set it |
| `figure` | no | a `FigureSpec`, when the example is read off a drawing |
| `steps` | yes | 2 to 6 `WorkedExampleStep`s, `n` = 1, 2, 3 … in order |
| `steps[].working` | yes | the line: maths (`$…$`, or `$$…$$` for a long line) or, in science, the prose line of a worked answer |
| `steps[].decision` | yes | the reason, shown under the line, ≤ 40 words |
| `steps[].earns` | no | the mark(s) the line earns, in the subject's mark language: Maths `M1` `A1` `MA1`; Further Maths `M1` `W1` `MW1`; Science `P1` (one marking point) |
| `steps[].input` | no | an `AnswerSpec`, when she types that line before it is revealed (as a faded worked-example step); marked, never recorded; at most one per See it, and never in the topic's first See it |
| `steps[].whyMenu` | — | not used in a See it (the lint warns); the Your turn is the check |
| `finalAnswer` | no | the answer line, when the last step does not already state it |

**A See it drawn from the bundle's worked example**, when the author uses it as it stands:

```json
{ "type": "see", "workedExample": "we.fm.u1.algebraic-fractions-simplify.02" }
```

The renderer takes `stem`, `figure`, `steps` (without `whyMenu` and without `input`: a worked example's step inputs belong to its faded versions, and a See it drawn from one is shown, never typed) and `finalAnswer` from that worked example; the worked example must be shipped (verified or published) and hold two to six steps. Use it only when the worked example is not also served later as a faded, twin or problem run on the same path: the overlap ruling of 25 Sep (a note must not work what a later item asks) otherwise applies, and the inline form on new numbers is the right one.

## 3. Your turn (the gate)

The gate block is unchanged (`{ "type": "gate", "id", "kind", "prompt", "options"?, "answer", "explain" }`), named "Your turn" on screen. In the section:

- It comes after the section's `see` block (and the video, if any) and is the section's **last** block. One gate per section; two, one after the other, only where the section showed two variants (two `see` blocks, or one whose steps work both).
- It asks for what the steps just showed. Its `explain` re-teaches in other words (≤ 60 words), points at the step ("This is step 2 of See it"), and never names an option by its position ("the second option", "option A"): the options are shuffled.
- Optional `twin`, the retry before the recap (the owner's answer 2; a new field, see §7):

```json
"twin": { "prompt": "…same structure, new numbers…", "options": ["…"], "answer": "…", "explain": "…" }
```

## 4. The first check

The topic's first gate follows the topic's first See it, in the same section, and is a real question answerable from that See it: never an interface warm-up ("One tap to start"). (The owner's answer 8.)

## 5. A video

`{ "type": "video", … }` (or a `sim`) sits in the same section directly after the `see` block and before the gate. A video is never a section's only See it: our own worked steps, with their marks, come first (the owner's answer 4). A section with a video and no `see` block is a lint warning.

## 6. The recall prompts

At most two `{ "type": "prompt", "promptId": "rp.…" }` blocks, the last blocks of the note, after the pointer paragraph. Each prompt: a question of at most 15 words, an answer of about 12 words (25 the hard cap); a must-know formula, the key word the scheme rewards, the first line to write, or one value. Optional on screen, with Skip; a skipped card is never scheduled (the owner's answer 3). Other prompts stay in the bundle, unwired, for the flashcards deck.

## 7. Against §8.3, and what needs a schema or type field

- **Departure: the step fields.** §8.3 wrote `{ "working", "because", "earns"? }` and an `answer`. This spec uses the worked example's own names, `n`, `working`, `decision`, `earns`, `input`, and `finalAnswer`, so a See it step IS a `WorkedExampleStep`: one type in the app, one renderer for the line and its reason, and a conversion that copies a worked example's steps unchanged. The meaning is the same (`decision` is the reason under the line). Otherwise §8.3 is applied verbatim, with the owner's answers 3, 4, 6 and 8 added.
- **New: the `see` block.** Note blocks have no zod schema; their type is the `NoteBlock` union in `src/components/items/gates.ts` (app-owned). It needs `| { type: "see"; stem: string; figure?: FigureSpec; steps: WorkedExampleStep[]; finalAnswer?: string } | { type: "see"; workedExample: string }` there, and a renderer in Slides and Read.
- **New: the gate's `twin`.** The `gate` member of that union needs `twin?: { prompt: string; options?: string[]; answer: string; explain: string }`.
- **No schema change** is needed in `src/lib/content/schema.ts` for either: they live in note.blocks.json.
