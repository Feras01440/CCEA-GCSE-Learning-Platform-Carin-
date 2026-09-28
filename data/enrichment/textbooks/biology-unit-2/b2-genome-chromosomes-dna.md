# b2-genome-chromosomes-dna: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Biology Unit 2 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** `packs/science/content/b2/b2-genome-chromosomes-dna/note.blocks.json` and `bundle.json`, read in full on 27 Sep 2026.
**Spec.** B2 2.4.1, 2.4.2, 2.4.3, 2.4.4 (Foundation; the base triplet bullet of 2.4.4 is Higher).
**Verdict.** Our note is **thinner** than the book on the Higher half. Ours is excellent on the four sizes of genetic material and the base-percentage calculation, but it teaches the triplet idea only as "divide the bases by three". The book teaches reading a sequence with a code table, what a single-base change or a lost triplet does to the protein, and **why** A pairs with T and C with G. CCEA has examined all three at Higher (2022 and 2023).

---

## 1. Book chapter and pages

Section 2.4 (genome and genetics): learning outcomes pp. 34–35 (with "Mathematical content": probabilities from crosses; comparing risks of screening tests); "Genome, chromosomes, genes and alleles" pp. 35–36; "Bacterial DNA" p. 36; "DNA Structure" pp. 36–38 (text p. 36, helix picture and ladder diagram p. 37, Test Yourself 2.4.1 p. 38); "DNA and Proteins" pp. 38–40 (mutation examples p. 38, worked example p. 39, code table and Test Yourself 2.4.2 p. 40). Answers p. 101.

## 2. The book's teaching sequence

1. The nucleus controls the cell because it holds chromosomes, which carry the codes for the cell's proteins (p. 35).
2. Chromosomes come in pairs; the number differs between species; humans have 46 per body cell and 23 per gamete (p. 35).
3. Chromosomes are long threads, seen only in stained cells that are getting ready to divide (p. 35).
4. Chromosomes are made of DNA; short lengths of DNA are genes, which code for proteins that control characteristics; alternative forms of a gene are alleles (p. 35).
5. A functional pair drawn in a nucleus, one from each parent, carrying the same genes at the same places, possibly with different alleles (p. 36).
6. Bacteria differ: one looped chromosome, not in a nucleus, plus small extra rings (plasmids) that are used in genetic engineering (p. 36).
7. DNA's structure: two backbones of alternating sugar and phosphate, a base on each sugar, bases held across the middle by hydrogen bonds; A with T, C with G; each pair joins one large base to one small base, which keeps the two backbones evenly spaced (pp. 36–37).
8. (Higher) A gene's base sequence sets a protein's amino acid sequence, three bases per amino acid; about twenty amino acids exist; everyone's DNA is unique because the sequences differ (p. 38).
9. (Higher) Mutations: a single changed base may put a different amino acid into the protein and spoil its shape and job; some changes alter nothing (p. 38).
10. (Higher) Decoding a strand with a table; the effect of a substitution and of a lost triplet (pp. 39–40).

## 3. Explanations and analogies the book uses that our note lacks

- **Why the pairs are fixed: big with small** (p. 36). A and G are large bases, T and C small; every rung joins one large and one small, so the two backbones stay the same distance apart all the way along. CCEA 2022 Higher Q7(b)(ii) gave two marks for exactly this reasoning, crediting *a large base bonded with a small base* and the matching numbers of bonds between partners (`docs/sources/papers/science/2022-Summer/B2-H-Biology-MS-21579.txt`). Our note states the pairing rules but never says why.
- **Hydrogen bonds hold the rungs** (p. 36). Our note says the bases "interlink" (the specification's word) without naming the bond.
- **What a mutation does to a protein** (p. 38, Higher). One changed base can swap one amino acid; the protein's shape can change and it may stop working; some swaps change nothing because two triplets can code for the same amino acid. Our note never mentions mutation in this topic (it appears only as a definition in `b2-variation`). CCEA 2023 Higher Q10(b)(ii)–(iii) asked for the new amino acid after a base change and for the result (a different protein, or none: `docs/sources/papers/science/2023-Summer/B2-H-Biology-MS-29143.txt`).
- **Reading with a code table** (pp. 39–40, Higher). Split the strand into threes, look each up. CCEA 2023 Higher Q10(b)(i) set exactly this for two marks. Our note only counts amino acids.
- **Unique DNA means a unique sequence** (p. 38). Our bundle has this as an item; the note never teaches it.
- **Chromosomes are seen only in dividing, stained cells** (p. 35). A useful line our note lacks (it explains why a karyotype photograph is of a dividing cell).

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Our equivalent | Recreation note |
|---|---|---|---|---|
| Functional pair in a nucleus (p. 36) | A round nucleus with its membrane; two upright chromosomes side by side, each with a solid band and a hatched band at matching heights; four labels: the nuclear membrane, one chromosome, and two genes each carried in two versions. | Gene as a place; alleles as versions at that place. | Yes (our B/b pair figure). | Keep ours. |
| Double helix picture (p. 37) | A black twisted ribbon with rungs. | Shape word only. | Yes (the small helix beside our ladder). | Keep ours. |
| Detailed ladder (p. 37) | Two backbones of alternating shapes labelled S and P, with rungs A–T, C–G, G–C, T–A, A–T, C–G; one S, P and base boxed as "one nucleotide"; one backbone boxed. **The drawing joins each base to a P**, and draws S as a circle and P as a pentagon. | Structure naming. | Yes: our ladder, which correctly joins each base to a sugar pentagon. | **Do not copy the book's ladder.** Its own text (p. 36) says the base is attached to the sugar; the drawing attaches it to the phosphate. Keep ours; optionally draw large bases wider than small ones, and add a dashed box for one nucleotide (CCEA 2021 Higher Q11(a)(ii) asked for a box round the sugar and phosphate backbone only). |
| Decoding ladder (p. 39) | One strand of twelve bases in fours of three, two triplets already labelled with amino acids, two left for her. | Table lookup. | **No.** | Build our own strand and table (see section 7 on the code). |
| Beads diagram (p. 40) | Eight triplets above eight circles naming amino acids, one triplet and one amino acid blank. | Fill the missing triplet and amino acid; then a substitution and a deletion. | **No.** | Our own version with a new sequence. |

## 5. Worked examples, calculations and data tasks

- **Test Yourself 2.4.1** (p. 38): shape word; the two backbone chemicals; the two base pairs.
- **Decoding worked example** (pp. 39–40, Higher): read the next two amino acids off a table. Shape: twelve bases, four triplets, a ten-row table, two answers.
- **Test Yourself 2.4.2** (p. 40, Higher): (a) supply the missing triplet from the amino acid and the missing amino acid from the triplet; (b) the first base of the sequence changes: which amino acid replaces the first, and what that may do to the protein's shape and function; (c) one triplet is lost: the protein is one amino acid shorter, which may change its shape and stop it working.
- No base-percentage task in the book; ours (with its three-mark working) is a strength, and CCEA set it in 2025.

## 6. Practice question types

- **Name** the shape; **name** the backbone substances; **name** the pairs (1 each).
- **Explain** why A always pairs with T (2: large with small; matching bonds) — CCEA 2022 Higher.
- **Use the table** to name the amino acids a strand codes for (2) — CCEA 2023 Higher.
- **State** the new amino acid after a named base change (1) and **state the result** for the protein (1) — CCEA 2023 Higher.
- **Draw a box** round the backbone on a ladder diagram (1) — CCEA 2021 Higher.

## 7. Definitions, and two places where the book disagrees with CCEA or with itself

- **Genome** (spec) and the book agree with ours: all of an organism's genetic material.
- **Gene** (p. 35): a short length of DNA coding for a protein that controls a characteristic. Ours: a short length of DNA that controls one characteristic. Add "codes for a protein" at Higher, since the triplet section depends on it.
- **The book's ladder contradicts its own text** (see section 4): bases hang from sugars, not phosphates.
- **The book's code table is not the real genetic code and uses a different convention from CCEA's papers.** On p. 40 the book's DNA triplets behave like the *template* strand (for example TAC for methionine), and three entries are wrong even on that reading (ACC is given as cysteine; GTT and GTC as glutamate, where the real assignments would be tryptophan and glutamine). CCEA's own 2023 Higher table (Q10(b)) reads the DNA triplet directly as the code with T in place of U (CCA proline, TGG tryptophan, AAT asparagine, ATT isoleucine, TGT cysteine), which is the true code. Exam tables are always supplied, so no candidate is harmed, but **our authors must not reuse the book's table**. Either follow CCEA's 2023 convention with true assignments, or label a table plainly as made up for the question.

## 8. Higher-tier-only content in the book

Printed in bold, pp. 38–40: the link from base sequence to amino acid sequence, the base triplet hypothesis, mutations and their effects, the decoding worked example, the code table and Test Yourself 2.4.2. Our note covers only the triplet count at Higher.

## 9. Pitfalls and "remember" notes in the book

- Every rung pairs a **large** base with a **small** one (p. 36).
- Bacterial DNA is **not** in a nucleus (p. 36, underlined in the book).
- Some base changes alter the protein and some do not; say "may" (p. 38).

## 10. GAPS in our note, ranked

1. **No decoding with a table, and no mutation consequences (Higher).** Add a `variant` section: See it reading a twelve-base strand with a supplied table (CCEA's 2023 convention), then a single substitution worked to its new amino acid and "a different protein, which may not work", then a lost triplet worked to "one amino acid fewer"; Your turn on a new strand. CCEA 2023 Higher Q10(b) is the model.
2. **No reason for the pairing rules.** Add a `why` callout and a figure with large bases drawn wider than small ones: every rung is one wide plus one narrow, so the rungs are all the same length and the backbones stay parallel; then a Your turn "explain why A cannot pair with G" (CCEA 2022 Higher, 2 marks).
3. **Bacterial DNA is only a clause.** Add a small figure contrasting a nucleus with chromosome pairs and a bacterium with one loop and plasmids, as the bridge to genetic engineering.
4. **Unique DNA.** One line: no two people (except identical twins) share a base sequence; ask it as a Your turn.
5. **Backbone box and nucleotide.** A label task: box the backbone on our ladder (CCEA 2021 Higher); optionally name the repeating unit.

## 11. Anything in our note the book suggests is wrong or misleading

Nothing in our note is wrong. The book's own ladder and code table are the faulty items (section 7).
