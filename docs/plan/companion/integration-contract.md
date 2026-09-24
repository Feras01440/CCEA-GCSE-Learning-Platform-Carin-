# Rowan: integration contract

What the companion session ships, and exactly what the peer session wires. Version 1.0, 19 September 2026.
Written against `src/lib/companion/` and `src/components/companion/`; the specification is
`docs/plan/companion/2026-09-19-companion-spec.md`.

This contract is executable. `src/lib/companion/contract.test.ts` parses the slot table below and fails if
it drifts from `SLOTS` in `src/lib/companion/select.ts` or from the components' exports.

## Ownership

| Owner | Files |
|---|---|
| This session | `src/lib/companion/*`, `src/components/companion/*`, `data/companion/*`, `docs/plan/companion/*`, and the `version(4)` block in `src/lib/db/db.ts` |
| The peer session | Today, FirstRun, the topic hero, the close card, Settings, the Map, `src/lib/db/export.ts` |

Since 22 September 2026 the platform programme's companion agent also owns `src/components/gift/FirstRun.tsx`,
`src/components/ux/CloseCard.tsx`, `e2e/companion.spec.ts` and, by the lead's ruling of 23 September, the "How Rowan
speaks" block of `src/components/settings/SettingsPanel.tsx` (now `<CompanionVoiceSettings />`; every other line of
that file belongs to whoever owns Settings). Today (`TodayTiles.tsx`) belongs to the surfaces agent and the topic
hero (`TopicHero.tsx`) to the topic-page agent: a change the companion needs there is sent to them as exact text.

Nothing outside `src/components/companion` imports a file inside `src/lib/companion` directly: import from
`@/lib/companion`, which is the whole public surface.

## Slot table

| Slot | Component | Props | Reads | Silent when | Acceptance test |
|---|---|---|---|---|---|
| `today-open` | `CompanionLine` | `{ moment, context, onShown? }` | tonight's due cards in the review inbox's own order, hypercorrection cards, her cairn note and her "when next" note, the next paper from `exam-plan`, the next step, the clock only for `isLate` (the slot tries `evening` first) | silenced; first run is not done; her brother's note is on the screen; any answer field is up; the first Letter is owed and today is the day it was first offered; every line for the moment is inside its cooldown (one calendar day for tonight's facts, a fortnight for everything with a voice) | `select.test.ts` "fresh install: on the Letter's first day it goes first", "the same facts speak the same after a week and a half as after one day", and "tries the evening lines before the arrival lines" |
| `first-letter` | `CompanionLetter` | `{ moment, context, onRename?, onRead?, sealed?, preview?, children? }` | `companionState.letterSeen` and `letterOfferedOn`, `settings.firstRunDone`, `upcomingPapers`, Today's next step | `letterSeen` is true; first run is not done (it is offered on the first Today after it, never inside it); silenced; her brother's note is on the screen; an answer field is up. From the day after it was first offered it is sealed to one line until she opens it | `select.test.ts` "fresh install: the first Today offers the Letter, in plain words" and "existing install: the upgrade Letter reads the paper dates from the plan" |
| `topic-open` | `CompanionLine` | `{ moment, context, onShown? }` | the topic's first-visit flag, the section she stopped at, the reviser path, the examiners' flag on the topic, and optionally `shortTitle` (the spine's short form of the title; without it the catalogue title is shortened by `spokenTitle`, and a line that says the title mid-sentence is withheld when even the short form runs past six words) | no topic passed; the topic is neither new, resumable nor flagged; silenced; first run is not done; the Letter's first day while it is unread; every line for the moment is inside its cooldown (never on a first visit: its fallback has none). Rendered only in the topic hero, above the lesson and before the first answer field in document order; a signed line is never a descendant of a section, card or form that contains an answer field (the Playwright rule is containment, not page-wide presence, because the teach-first page holds every question in the DOM at once) | `select.test.ts` "fresh install: once she has read the Letter, every wired slot speaks that same evening" |
| `session-close` | `CompanionLine` | `{ moment, context, onShown? }` | stones placed since `sessionStartedAt`, whether anything is still due, the topics returning on the next return day, the topic's own sessions and returns | silenced; first run is not done; the Letter's first day while it is unread; every line for the moment is inside the fourteen-day cooldown (one of "Done for tonight" and "You can stop here" is true at every close) | `select.test.ts` "places a stone on the close card only when one was placed", and "names only the topics that come back on the day it names" |
| `support` | `CompanionLine` | `{ moment, context, onShown? }` | whether the answer carries a unit, whether the part's scheme has a method mark, the examiners' evidence on the item; nothing about her | silenced; first run is not done; her brother's note is on the screen. Never held back for the Letter: it is unsigned prose inside the work | `select.test.ts` "renders the second-miss support unsigned: no mark, no signature, no attribute" |
| `mock-entered` | `CompanionLine` | `{ moment, context, onShown? }` | the mock's unit and subject, that unit's topics from the taxonomy, and that unit's cards due now or inside the coming week. Never the mark, the UMS or the grade | no mock passed; a question is up; silenced; first run is not done; the Letter's first day while it is unread | `select.test.ts` "names what a mock sends back, and never the mark", and "says a filed paper leaves tonight as it was" |
| `settings-memory` | `CompanionMemory` | `{ notes?, onDelete?, onForget?, className? }` | `companionNotes`, and the `companionNotesInExport` setting | never: the list is always reachable, and says so when it is empty | `memory.test.ts` "forgets everything she gave it, and keeps her settings" |
| `map-place` | `RowanMark` | `{ size?, className? }` | only what she sees of Rowan (`useCompanionPresence`, the state row's `silenced` and `figure`): it is the hare's head and ears in the ink of its line, and reads no other table (since 23 September; the three-stone mark's `stones` and `settle` went with it) | always, in words: the place Rowan keeps on the Map is a mark, never a line; and not drawn at all in Words only or Quiet (since 24 September) | `contract.test.ts` "the Map place carries no line" and "draws nothing during a question or against her choice" |

### Reading the table

- **Component** is a named export of the file in `SLOTS[slot].file`; there are no default exports.
- **Props** is the exact prop object the peer passes. `context` comes from `useCompanionContext(overrides)`
  (`@/lib/companion`), which returns `undefined` while it loads; every component renders `null` for that,
  so nothing flashes on first paint.
- **Silent when** is enforced in `select.ts`, not in the component, and silence is always an allowed answer.
  A line that fails the constitution at render time is dropped and the moment goes quiet; there is no
  fallback line.
- **Nothing before first run.** Until `settings.firstRunDone` is true every moment is silent
  (`SilenceReason` `"first-run"`): Today renders for a moment on a new device before it sends her to
  `/welcome/`, and a line said there was being spent on a screen she never read (found on the dev server,
  22 September).
- **It introduces itself first, for one day.** While the first Letter is owed and today is the day it was
  first offered (`companionState.letterOfferedOn`, written the first time the Letter renders), every signed
  moment except `first-letter` is silent (`"letter-first"`, `flags.letterGoesFirst`), so the Tonight tile
  carries the Letter and nothing competes with it. From the next day the signed lines speak whether or not
  she has opened it, and the Letter waits under Start, sealed to one line, until she reads it (opening it
  counts). Unsigned prose inside the work is never held back. Until 23 September this rule had no end: on
  an install past first run, every surface stayed silent until she tapped Close.
- **Today's slot says it is late first.** `CompanionLine` selects with `selectAt`, which expands
  `today-open` into the slot's moments (`evening`, then `today-open`); the attribute names the moment that
  spoke.
- `onShown` defaults to recording the line against the fourteen-day cooldown. Pass it only to override.

### Slots declared but not wired in this slice

`evening` rides inside the `today-open` slot (it is the first moment that slot tries, and its lines are
gated on `isLate`). `vocab`, `correct`, `confident-wrong`, `three-misses`, `answer-given` and `recap` have
lines and pass the lint, but no surface: they are M4 in the specification's build plan (whoever wires
`confident-wrong` or `answer-given` must fill `returnWhen` from that item's own card, not the next return of
any card). `weekly-letter` renders through `CompanionLetter` with `sealed` and is M5.

## The moments, and which are unsigned

`UNSIGNED_MOMENTS` = `vocab`, `correct`, `support`, `confident-wrong`, `three-misses`, `answer-given`,
`recap`. These render as prose in the note's own register: no three-stone mark, no name, and **no
`data-companion` attribute**, so the Playwright assertion "no `[data-companion]` while an answer field or
grading buttons are visible" holds even at the second miss, where the field is still on screen for the
retry after a hint.

`LETTER_MOMENTS` = `first-letter`, `weekly-letter`. These render as a Letter, with the letter figure slot.

Everything else is signed: a `data-companion="<moment>"` attribute, the product's ink, the serif voice
(`var(--font-companion, ui-serif, Georgia, 'Times New Roman', serif)`), full width, inline, never sticky,
never a corner bubble, and the name as screen-reader text. Today's arrival line and the topic hero's line
carry the hare beside the words, the Letter carries it beside the note, and the close card carries it in the
scene above its title (decision 8; see "The figure slots" below). No `aria-live` anywhere: an arrival line
is part of the page, not an announcement over it. The figure and `RowanMark` are `aria-hidden`; the Letter's
signature is the visible name.

## The Dexie stores

Added in `src/lib/db/db.ts` as `version(4)`, the only edit this session makes outside its own folders.
Version 3 is the peer's `flow` table and is untouched.

```ts
this.version(4).stores({
  companionNotes: "++id, at, kind, topicId, source",
  companionState: "id",
});
```

```ts
interface CompanionNote {                 // free text, hers or Rowan's
  id?: number;
  at: Date;
  kind: "cairn-note" | "felt" | "when-next" | "taught" | "paper-recall";
  text: string;
  topicId?: string;
  source: "her" | "rowan";                // only "her" may ever be quoted back
}

interface CompanionState {                // exactly one row, id "state"
  id: "state";
  plainModeUntil: string | null;          // ISO date; plain mode is on while today is on or before it
  letterSeen: boolean;                    // the first Letter has been read
  letterOfferedOn: string | null;         // ISO date the first Letter first reached her; it goes first only that day
  name: string | null;                    // what she renamed it to
  silenced: boolean;                      // the voice off, at no cost
  recent: Array<{ id: string; at: string }>;  // lines used, for the fourteen-day cooldown
  updatedAt: Date;
}
```

Only `at` and `updatedAt` are `Date`, so `src/lib/db/export.ts` revives them untouched; every other stored
time is an ISO string for the same reason. Nothing about absence is stored: no hour opened, no days since,
no missed slot, no miss counts as counts, no comparison with other learners.

## The export exclusion

`companionNotes` is free text she typed, and a backup restored on a family laptop would carry it. The peer's
one-line change in `src/lib/db/export.ts`:

```ts
import { companionExportExclusions, EXPORT_NOTES_SETTING } from "@/lib/companion";
// inside exportAll, before the loop:
const skip = new Set(companionExportExclusions(await getSetting(EXPORT_NOTES_SETTING, false)));
for (const t of db.tables) { if (skip.has(t.name)) continue; tables[t.name] = await t.toArray(); }
```

`importAll` needs no change: a file without the table simply leaves the table alone. The toggle is rendered
by `CompanionMemory` and writes the `companionNotesInExport` setting; absent means false.

## The plain-mode switch

`companionState.plainModeUntil` is seeded to fourteen days after the state row is first written, so **plain
mode is on for the first fortnight** and the place language is something she turns on rather than off.
`isPlainMode(state, now)` is pure. In plain mode a line that carries the hills (`place`) or the dialect
(`dialect`) is used only if it has a `plainTemplate`, and otherwise is skipped; `lint.test.ts` proves every
moment still has at least one thing it can say. `setPlainMode(false)` ends it for good.

Plain mode never silences Rowan (decision 3): every line that carries the hills or the dialect has a plain
wording, so the same fact is said from day one. Since 23 September this is proved rather than trusted:
`PLACE_WORDS`, `PLACE_PHRASES`, `DIALECT_WORDS` and `DIALECT_PHRASES` in `lint.ts` name the language plain mode
leaves out; a `plainTemplate` containing any of it fails the lint (`plain-leak`), a template containing it must
declare `place` or `dialect`, and a rendered line that would still carry it in plain mode is dropped (values
she or the packs supplied are taken out first, so a topic called "Critical path analysis" keeps its name).
The Letter's eyebrow follows the same rule: "Left at the cairn" becomes "A note to start with".

**In Settings** (`CompanionVoiceSettings`, copy in `voice.ts`, 23 September) the switch is explained in her
words from where it stands (`plainWords(state, now)`):

| State | What Settings says | The choices |
|---|---|---|
| the first fortnight | "Plain words until Tuesday 6 October. From Wednesday 7 October, Rowan talks in its own voice, unless you keep plain words." | Keep plain words (for good); Use Rowan's own voice now |
| plain for good | "Plain words, for good. It stays this way unless you change it here." | Use Rowan's own voice |
| the own voice | "Rowan's own voice, since Wednesday 7 October." (or "as you chose") | Go back to plain words |

Under the status it says what plain words leaves out ("the hills, paths and cairns, and local words such as
'wee' and 'grand'. The facts are the same either way.") and shows one pair taken from the lines themselves:
"one stone on M4" and "one stone on the M4 cairn". The dates are the real ones for her install.

## Binding conditions

Verbatim from the peer session's review. Each is enforced in code and in a test.

1. The second-miss support slot renders unsigned prose with no mark and no data attribute.
2. The evening state is copy only, no opacity change.
3. Lines never hard-code dates or answers, they draw from exam-plan and the item.
4. The first Letter is an upgrade moment for an existing install (she is past first run).
5. A "What Rowan remembers" list with per-row delete and "Forget everything".
6. `companionNotes` excluded from export by default.
7. Plain mode on for the first fortnight.
8. A mock-entered slot.
9. Add the five dry lines from the spec.
10. Never speaks during a question.
11. Never mentions the gap, the hour, a missed plan, a streak.
12. No exclamation marks.
13. Never praises the person, only the line.
14. Ends sessions and never asks her to stay.

| # | Enforced by | Proved by |
|---|---|---|
| 1 | `UNSIGNED_MOMENTS` in `lines.ts`; the unsigned branch of `CompanionLine` | `select.test.ts` "renders the second-miss support unsigned" |
| 2 | no opacity or token in `CompanionLine`; the `evening` moment is copy only | `select.test.ts` "only ever says it is late while she is here to read it" |
| 3 | `lint.ts` rules `digit`, `hard-coded-date`, `number-word`; `context.ts` fills every value | `lint.test.ts` "never hard-codes a date, an hour or an answer" |
| 4 | `flags.firstLetterDue` = `firstRunDone && !letterSeen`; offered on the first Today after first run, never inside it; first in line for one day (`flags.letterGoesFirst`), then sealed under Start | `select.test.ts` "offers the first Letter only while it is owed", "existing install: the upgrade Letter reads the paper dates from the plan", "existing install: the Letter goes first only on its first day"; `components.test.ts` "from the next day, unread: sealed in one line under Start" |
| 5 | `CompanionMemory` | `memory.test.ts` "deletes one row"; "forgets everything she gave it" |
| 6 | `companionExportExclusions` | `memory.test.ts` "leaves her notes out by default" |
| 7 | `freshState` seeds `plainModeUntil`; `isPlainMode`; the `plain-leak` lint and the rendered plain-mode check | `memory.test.ts` "plain mode on for the first fortnight" and "plain words, as Settings explains them"; `select.test.ts` "plain mode", "every plain wording in every fixture is free of the hills and the dialect", "day fifteen: plain mode has run out"; `voice.test.ts` |
| 8 | the `mock-entered` slot and moment | `select.test.ts` "names what a mock sends back, and never the mark" |
| 9 | `dry.not-me`, `dry.booklet-b`, `dry.sly`, `dry.specific`, `dry.arrangement` | `contract.test.ts` "carries the five dry lines" |
| 10 | `selectDetailed` returns `during-a-question` for every signed moment; `CompanionFigure` renders nothing while a question is up | `select.test.ts` "says nothing at all during a question"; `components.test.ts` "renders nothing signed, and no figure, while a question is up"; `e2e/companion.spec.ts` containment |
| 11 | `context.ts` computes nothing from absence; `BANNED_PHRASES` | `select.test.ts` "never mentions the gap" |
| 12 | `lint.ts` rule `exclamation` | `lint.test.ts` "refuses an exclamation mark" |
| 13 | `BANNED_WORDS` praise list; principle P2 on every feedback line | `lint.test.ts` "refuses every banned word" |
| 14 | `close.done`, `evening.*`; "keep going", "one more", "five more" are banned phrases | `lint.test.ts` "refuses the gap, the hour and asking her to stay" |

## Where the specification was not followed, and why

- **Line 2** hard-coded "M4 on the 14th at 9.15" and **line 26** "15.4 cm cubed": both are slots now
  (`papersLine`, `answerText`), filled from `exam-plan.ts` and the item.
- **Line 23** counted her misses out loud ("That is three"); miss counts are not stored, so it reads
  "That is enough asking."
- **Line 31** ended "which is about what it takes", a comparison with other candidates, which §5 forbids.
  It now names the schedule instead.
- **Line 36** (the reappraisal line about her heart) is gated on `askedAboutNerves`, so it is an answer to
  her question and never an unsolicited remark about her body.
- **Lines 33 and 34** are kept behind an `isLate` flag that exists only while she is present. No hour is
  ever named, and lateness is never inferred from absence.
- **Line 38** was three sentences; the cap is two.
- The specification's "at least five templates per slot" is not met in this slice (two to eight per moment).
  Reaching 120+ lines is M6 in the build plan; `lint.test.ts` holds the floor at two per moment, and at one
  per moment in plain mode.
- **Line 1** promised "the notes left at each cairn"; nothing in the app lets her leave a note yet, so it says
  what Rowan keeps today: the dates of her papers and what comes back when (23 September).
- **Card 3 of first run** is gone from first run: the first Letter is offered on the first Today after it
  (decision 3). On the first-run screen it sat above "Two things before you start" with a second name field,
  and "Begin" marked it read unread.
- **Lines 11 and 17**: "nothing here is a test" became "nothing in it is scored" (the page's practice is
  marked); "That one catches most candidates. The method mark lives in the line you skipped" now needs the
  examiners' evidence on the item and a method mark in its scheme, after it was seen on a labelling question
  with neither (22 September).
- **Lines 33 and 34** are said on arrival (Today's slot tries `evening` first), so the plain wording of 33 keeps
  its meaning ("One short one to finish on is plenty", not "Finish the one you are on") and 34 names what can
  wait ("Whatever is due can be tomorrow's").
- **The close** says "Done for tonight. There is nothing else to do." only when nothing is due; otherwise "You
  can stop here. Whatever is still due will keep until tomorrow." "Thursday brings back…" names only the topics
  that come back that day.
- **The mock lines** said the returning items came "from it" (the paper makes no review cards): they now count
  that unit's own cards, and say so when none is due back in the coming week.

## Kill criteria

From §10 and §11 of the specification, and honest about what can actually be measured.

1. **The twenty-minute test.** After two weeks, four questions: does it know me, does it get in the way, is
   it embarrassing, would you miss it. Ask the same four this week, before Rowan lands, so there is a
   baseline. **Her reaction overrides this document.**
2. **Embarrassing** removes any figure, not the voice. Since 23 September there is a figure, the hare; removing it
   leaves every line as it is (`LINE_FIGURE` in `CompanionLine`, the Letter's slot and `CompanionScene` are the
   only places it is drawn).
3. **In the way** halves the frequency: the fourteen-day cooldown doubles and the arrival line goes to the
   close card only.
4. **Zero sessions opened on nights with nothing due, over six weeks**, reduces Rowan rather than amplifying
   it. This metric cannot be computed by the companion, because §5 refuses to store per-night opens.
   `sessions.startedAt` (database version 1) already exists at product level; the metric is computed once by
   a script at the sit-down, and Rowan never reads it.
5. **The owner never sees her cairn notes.** She chooses what to show. Any read-aloud session renders
   `FIXTURES` in `src/lib/companion/fixtures.ts`, never her database.
6. If any line ever has to be defended with "it is only trying to help", it is cut.

## What the peer must not do

- Do not add an `aria-live` region around a line, and do not animate one on arrival beyond the existing
  `rise-in`.
- Do not render a companion line on the same screen as her brother's note; pass `giftNoteOnScreen: true` and
  Rowan yields.
- Do not pass a value into a slot that the learner did not type or the packs did not author. The `source`
  field and `quotedSlots` exist to make that impossible by accident.
- Do not change the evening state into an opacity, a colour or a theme. It is which sentence is true.
- Do not put a mark, a figure, a name or a `data-companion` attribute on the second-miss card.
- Do not place a signed line, a Letter or a figure inside a section, card or form that holds an answer field.

## Present from the first session (23 September 2026)

The owner asked, after reviewing the export, what had happened to the companion. Decision 3 of the platform
programme (22 September) answers it: plain mode keeps the place and dialect language off for a fortnight but
must not keep Rowan silent; the first Letter is offered on the first Today after first run, and on an install
already past first run as the upgrade moment; the plain lines run from day one; every slot renders where the
table says and is silent only for the reasons it gives.

**What she saw before (verified on the dev server, 22–23 September).** On a fresh install, Today spoke once on
its way to `/welcome/` and spent the line there; first run showed the Letter above her own name card with a
second name field and marked it read on "Begin"; the seeded lesson's second miss said "That one catches most
candidates. The method mark lives in the line you skipped" on a labelling question; the second new topic of the
evening was silent. On an install already past first run, which is hers, the Letter sat under Start and, until
she tapped Close, "letter-first" silenced the topic hero, the close card, the support line and the paper line:
the likeliest reason the owner saw no companion. The evening lines were never tried, and two arrival lines could
never be said (a count that opened a sentence failed its own lint once capitalised).

**What she sees now.**

| When | Today | Topic hero | Close card | Second miss | Settings |
|---|---|---|---|---|---|
| Before first run | nothing (no line is spent) | nothing | nothing | nothing | the section, plain words "until" a fortnight from the first open |
| Fresh install, first Today | the Letter under Start, in plain words, with the rename | waits for the Letter that day | waits for the Letter that day | unsigned prose, true of the item | "How Rowan speaks", explained |
| Same evening, Letter read | an arrival line from her next visit on (one per visit) | a first-visit line, plainly | "Done for tonight…" or what returns that day | as above | as above |
| An install past first run, first day | the upgrade Letter | waits for the Letter that day | waits for the Letter that day | unsigned prose | as above |
| The day after, Letter unread | the arrival line, and the Letter sealed to one line under Start | speaks | speaks | unsigned prose | as above |
| Day fifteen | the same facts in Rowan's own voice ("new ground", "the M4 cairn") | as today | as today | as today | "Rowan's own voice, since …" |

**Rules added** (select.ts, context.ts, CompanionLetter): `"first-run"` silence; `"letter-first"` for one day and
for signed moments only; the Letter sealed from its second day and read on opening; `selectAt` for Today's slot;
`renderTemplate` capitalises a value only where it opens a sentence of the template, and never inside a quotation
of her words; `lintRendered` takes out a capitalised value as well; "brings back" names only that day's topics;
tonight's first item is the review inbox's first (live.ts orders with the inbox's own `pickQueue`); every topic is
named by its catalogue title; a filed paper counts its own unit's cards.

**Today speaks every evening, and no first visit is silent** (the platform audit's must-fix 2, 23 September). The
audit found Today silent from the second open: `TodayTiles` froze the context before the next step had loaded, so
only a dry line with no facts could be said, and it spent its fortnight on night one. Three changes: the context
is held only once the plan and her mastery rows have loaded; the three arrival lines that state tonight's facts
(`today.back-tonight`, `today.first-up`, `today.nothing-back`) wait one calendar day rather than fourteen, because
their facts change nightly; and a first visit to a topic always has a line (four voiced first-visit lines on the
fortnight's cooldown, then `topic.first-kept`, ranked below them and with no cooldown). Cooldowns are counted in
calendar days. Topic names are said whole unless a colon, a semicolon, "including" or "using" leaves the whole name
(never cut at a comma or "and": "Index laws with zero and negative powers" is not "Index laws with zero"); on the
topic page Rowan says the hero's own display title (`shortTitle: displayTitle`) unless it carries mathematics.

**Applied, and owed** (exact text in the companion agent's report of 23 September):
- `TodayTiles.tsx`: applied by the companion agent at 13:58 under the lead's ruling (the context held once the next
  step has loaded; the arrival line always rendered, the Letter below it while owed). The surfaces agent carries
  the block verbatim into pass 2d, with the Letter as its own object after the Tonight section.
- `TopicHero.tsx`: `shortTitle: displayTitle` applied by the topic-page agent at 14:04. The line stays in the
  `<header>`, after Start and the Slides / Read switch (`data-way`, which the containment check does not count as
  an answer field), before the figure, outside any container that holds an answer field.
- `QuestionRunner.tsx` (unassigned; owed to the lead): pass `methodMark` (the part's scheme has an M, MA or MW line)
  with the item, and render the support line on a recognised second miss too (under the card, only when the
  examiner's hint is on it), not only inside the re-teach panel.

## The figure slots (23 September 2026)

Decision 8 (the owner's second directive) gave Rowan a face. The owner chose the hare, direction A of the design
canvas, and then ruled that it appears at Duolingo's scale, a posed figure composed into its places rather than an
icon in a corner (`docs/design/2026-09-23-art-direction-v2.md` §7, "Presence at Duolingo's scale"). This section was
first written that morning as three empty slots at 40, 28 and 24 px with the three-stone mark as the fallback; the
character agent's revision of the same evening (the trial on `fm1/algebraic-fractions-simplify`) replaces those
sizes with the canvas's and draws the hare into them. The sizes below are `FIGURE_SLOTS` in
`src/lib/companion/figure.ts`: `contract.test.ts` parses this table and compares the two, phone and desktop.

| Figure slot | Where it stands | Size (phone / desktop) | States | Drawn by | Never |
|---|---|---|---|---|---|
| `arrival` | Today's Tonight tile: the arrival line on the left, the posed hare on the right standing on the tile's floor above Start (`today-open`, `evening`) | 140 px / 200 px | `arrival`, `evening` | `CompanionLine` | on the same screen as her brother's note (the line yields, and the figure with it) |
| `letter` | the Letter (first and Sunday), the hare holding it beside the note; the signature row is the name alone. Sealed, the one line carries `RowanMark` at 24 px instead | 100 px / 110 px | `letter` | `CompanionLetter` | while an answer field is up; the Letter is never placed inside the work |
| `topic` | the topic hero, left of the `topic-open` line: after the two ways in, before the hero's own figure, above every answer field | 72 px / 80 px | `listening` | `CompanionLine` | inside any section, card or form that holds an answer field |
| `close` | the close card's scene at the top of the card, above its title: the hare on the hill by the cairn, under the evening sky (`session-close`) | 156 px / 250 px | `arrival` (the wave), `stone-placed` | `CompanionScene` | on a close card that sits under a live question (`companion={false}`) |

**The steps between the sizes.** `arrival` grows to 200 px by a container query on the line's own block
(`@min-[32rem]`, 512 px), not by the viewport, so the line always keeps room beside the hare: from 512 px the line
keeps at least 284 px, the 34ch it is set at. At 1280 Today's Tonight tile is 720 px wide (content 672), so the hare
is 200 px, as on the canvas's 640 px tile; on the phone's 358 px tile it is 140. `letter` steps at `lg` (1024 px) and
`topic` at `md` (768 px). `close` is in the scene's own units: the phone's scene is the canvas's 342 by 200 view in a
box of 342:230 at the width of its column (the hare renders at 0.52 of that width: 179 px at 342, 163 in a 310 px
card, 277 in the desktop close card's 528 px); the desktop's "tall" scene is 400 by 640 filling a full-height panel
(325 px in the Slides close's 520 by 800).

**The drawing.** `RowanFigure` (the hare), `RowanMark` (its 24 px mark), `CairnArt` (`CairnGroup`, `CairnFigure`,
`CairnMark`) and `RowanScene` (the hill scene) are ports of the canvas generator (`scratchpad/mockups-v2/rowan.mjs`,
`cairn.mjs`, `art.mjs`), element for element and in paint order, with the canvas's arithmetic: 35 drawings (six
states by three expressions, the silhouettes, both marks, the cairn with and without the heather stone, both scenes
in both close states and the day sky) were compared with the generator's own output and are identical. A change to
the hare is a change to the canvas first. States come from the moment that spoke (`figureStateFor`): `today-open`
arrives, `evening` sits low under the moon, `first-letter` holds the Letter, `topic-open` listens, `session-close`
waves or, when a stone was placed in the sitting, holds the heather stone up (the cairn then keeps its four stones,
so the scene never shows two heather stones). The face comes from the line (`figureExpressionFor`): the five dry
lines take the dry face; a stone placed is pleased; everything else is attentive.

**Colour.** The hare and the hills keep their own palette in all four themes (the art direction §2.4: the hare is
the same hare at night): `rowan-palette.ts` holds the canvas's hex for each LCH value, and `rowan-figure.test.ts`
recomputes every hex and checks each against the token of the same name in `app/globals.css`. The pupils and mouth
use the fixed ink, never `var(--ink)`, which turns light in dark mode. Only `RowanMark` is `currentColor`. This
supersedes the morning's "currentColor and opacity steps".

**Marks.** `RowanMark` is Rowan's mark, the hare's head and ears (it was the three-stone mark before Rowan had a
face): only where a line has no room for the figure (the sealed Letter, a list row, the Map's place, 24 px beside
"Your journey"), and the fallback of every slot. The cairn's own mark, `CairnMark`, is the product's (the rail's
wordmark, a finished row), not Rowan's.

**Motion.** One movement on arrival, then stillness: 240 ms, `ease-out`, opacity 0 to 1 and a 4 px rise (the art
direction §5, "arrival", Rowan's line), played with the Web Animations API from a layout effect on a bare group
around the drawing (`arrival.ts`). The server and a render without scripts draw the final pose; nothing is created
under `prefers-reduced-motion`, so `document.getAnimations().length === 0` on every screen the hare is on; no idle
motion, no blink, no breathing. The evening state is a drawing, never a dimming of the words beside it.

**What every host keeps.** The box at the slot's full size so the words beside it never move; `aria-hidden` with
no text of its own; `data-companion-figure="<slot>"` and `data-figure-state="<state>"` on the slot's root; nothing
while `context.questionVisible`; nothing while `context.figure` is false (Words only or Quiet in Settings; see the
next section); silence whenever the line it stands beside is silent (`CompanionScene` selects the same line as
`CompanionLine` from the same held context); never inside a section, card or form that holds an answer field, and
never after the first answer field in document order.

Proved by: `components.test.ts` (each slot's sizes, state and attributes; none on the unsigned line; nothing while a
question is up; the close scene silent when the line is; the Letter open and sealed), `rowan-figure.test.ts` (the
palette, every state and expression, the silhouette, the identity test at 7 am and 11 pm on day one and day
thirty), `contract.test.ts` "the figure slots (decision 8) are the contract's, and the code's", and
`e2e/companion.spec.ts`: the hare measured in its places on the Pixel 7 and at 1280 (the Letter 100 / 110, Today
140 or 200 by the 512 px rule, beside the words and above Start, the sealed Letter's 24 px mark, the hero 72 / 80,
the close scene at 160 px or more above the card's title), the evening pose late at night, the containment rule
over `[data-companion-figure]` as well as `[data-companion]`, and no animation under reduced motion.

## Full, Words only, Quiet (24 September 2026)

Rule 2 of the emotional-design rules, as the art direction v2 rewrote it (its appendix), promises that Rowan "can be
reduced to its voice or silenced at no cost", and kill criterion 2 above says that "embarrassing removes any figure,
not the voice". Until 24 September the only switch was Quiet (`silenced`). Settings now carries one control with
three states, in "How Rowan speaks", and every surface reads it from the one state row:

| She chooses | The row | `context.figure` | What she sees |
|---|---|---|---|
| **Full** (the default) | `silenced: false, figure: true` | true | the hare and its lines, everywhere the slot table says |
| **Words only** | `silenced: false, figure: false` | false | every line exactly as it is, with its attribute and its name; nothing drawn anywhere: no hare on Today, the Letter, the topic hero or either close scene, no 24 px mark on the sealed Letter or beside "Your journey" on the Map. The words take the room the hare had (the arrival and hero lines fall back to the words-alone layout, the Letter's note loses its column), so nothing stands beside an empty box |
| **Quiet** | `silenced: true` (`figure` keeps her last choice) | false | nothing said and nothing drawn. The plan rows, the paper dates and what comes back are the product's own and stay on Today; the first Letter is not offered while Quiet, and `letterSeen` is untouched, so it is offered the day she turns Rowan back on |

`presenceOf(state)` derives the state and `setPresence` writes it (`src/lib/companion/memory.ts`); the copy is
`describePresence` in `voice.ts`, linted like every line. A state row written before `figure` existed reads as
`true`, so no install changes under her. The switch is implemented once, in the context (`figure = state.figure &&
!silenced`), and obeyed by `CompanionFigure` (nothing when it is false, whichever slot and whether figure or mark),
`CompanionScene`, the layouts of `CompanionLine` and `CompanionLetter`, and the Map's mark (`useCompanionPresence`).
Nothing else changes with it: not the lines chosen, the cooldowns, the Letter's day, plain words or her notes. The
Nav's cairn mark is the product's, not Rowan's, and stays in every state.

Proved by: `memory.test.ts` "what she sees of it: Full, Words only or Quiet", `select.test.ts` "one switch for the
figure" (Words only selects the same line as Full at every moment in every fixture), `components.test.ts` "Words only
and Quiet: one switch, obeyed by every surface", `voice.test.ts` "what she sees of it, in Settings", `contract.test.ts`
"draws nothing during a question or against her choice", and `e2e/companion.spec.ts` "Words only keeps every line and
draws nothing; Quiet says nothing and draws nothing; Full brings the hare back" (Today, the trial topic's hero and the
Map, through the Settings control itself).
