// Teachable topics for Unit 3: Statistics. Evidence from the Chief Examiner's Reports 2019, 2022, 2023, 2024, 2025.

export const topicsFM3 = [
  {
    slug: "mean-and-standard-deviation", title: "Mean and standard deviation from raw data", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion",
    statementIds: ["FM3-CTD-01"],
    prerequisites: ["maths:averages"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q6(i): 65% found the SD of five marks; about 30% gained only the mark for the mean." },
      { series: "Summer 2025", note: "Q2: some treated a categorical (day-of-week) table as grouped data, assigning midpoints or 1–5; Σx²/n confused with (Σx)²/n; some scored zero; Q5(ii): many squared x̄ instead of finding Σx²." }
    ],
    mustMemorise: ["SD = √(Σx²/n − x̄²): square each value first, then sum", "Answers to 2 decimal places; do not round the mean to a whole number"],
    onFormulaSheet: ["Mean = Σfx/Σf", "Standard deviation = √(Σfx²/Σf − x̄²) (Unit 3 formula sheet)"],
    keywords: ["mean", "standard deviation", "variance", "Σx²", "spread"]
  },
  {
    slug: "mean-sd-grouped-data", title: "Estimating mean and standard deviation from grouped data", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion",
    statementIds: ["FM3-CTD-01"],
    prerequisites: ["mean-and-standard-deviation", "maths:mean-from-grouped-frequency-table"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q1: 85% full marks for the mean; 70% for the SD but 'a considerable number of errors in working out fx²' – some squared the fx column." },
      { series: "Summer 2022", note: "Q3: most knew why the mean is only an estimate; errors again in fx² (squaring the sum of the fx column)." },
      { series: "Summer 2024", note: "Q1: 'a surprisingly large number squared the fx column instead of calculating f × x²'." }
    ],
    mustMemorise: ["Use class midpoints; fx² means f × x² (not (fx)²)", "Mean = Σfx/Σf; SD = √(Σfx²/Σf − x̄²)", "It is an estimate because the exact values within each class are unknown"],
    onFormulaSheet: ["Mean = Σfx/Σf", "Standard deviation = √(Σfx²/Σf − x̄²) (Unit 3 formula sheet)"],
    keywords: ["grouped frequency", "midpoint", "fx²", "estimate", "class interval"]
  },
  {
    slug: "combined-sets-mean-sd", title: "Mean and standard deviation of combined (pooled) sets", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion",
    statementIds: ["FM3-CTD-02"],
    prerequisites: ["mean-and-standard-deviation"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q3: 'good discriminators, namely the evaluation of standard deviation, including pooled samples'; (i) some averaged the two means (83.75%); (ii) half correct, 30% scored zero – added scores without squaring or squared their sum." },
      { series: "Summer 2022", note: "Q5(ii): about half found the pooled SD – 'either done well or badly'; (i) some just averaged 69 and 83." },
      { series: "Summer 2023", note: "Q2(ii): half could do this 'challenging' pooled-SD question; could reach Σx² = 14 560 for all vehicles but not 10 187 for the cars or forgot to divide by 10." },
      { series: "Summer 2025", note: "Q5(i): 108.4 × 14 instead of × 15; adjustments applied with only one of the two values." }
    ],
    mustMemorise: ["Recover totals: Σx = n x̄ and Σx² = n(σ² + x̄²) for each group", "Combined mean = (Σx₁ + Σx₂)/(n₁ + n₂); combined SD from the combined Σx² and Σx", "Never average two means unless the groups are the same size"],
    onFormulaSheet: ["Standard deviation = √(Σfx²/Σf − x̄²) (Unit 3 formula sheet)"],
    keywords: ["pooled", "combined groups", "Σx²", "total", "weighted mean"]
  },
  {
    slug: "adjusted-data-mean-sd", title: "Recalculating mean and SD when items are added or removed", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion",
    statementIds: ["FM3-CTD-02", "FM3-CTD-03"],
    prerequisites: ["combined-sets-mean-sd"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2025", note: "Q5(ii): 'one of the most challenging questions on the paper' – many gained one mark for Σx² of the original data but could not adjust; several tried adding 182; some could not calculate the mean." }
    ],
    mustMemorise: ["Work with Σx and Σx²: add or subtract the item's value and its square, adjust n, then recompute", "Set the work out as a table of n, Σx, Σx² before and after"],
    onFormulaSheet: ["Standard deviation = √(Σfx²/Σf − x̄²) (Unit 3 formula sheet)"],
    keywords: ["item removed", "item added", "corrected data", "Σx", "Σx²"]
  },
  {
    slug: "linear-transformation-mean-sd", title: "Effect of a linear transformation on mean and SD", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion",
    statementIds: ["FM3-CTD-03"],
    prerequisites: ["mean-and-standard-deviation"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q6(ii): just over half full marks on scaling data; 'many strange equations involving m and n were seen' – a good discriminator." },
      { series: "Summer 2024", note: "Q1(iii): common mistakes were adding 3 to the mean but also adding/subtracting 3 to the SD." }
    ],
    mustMemorise: ["If y = ax + b then ȳ = a x̄ + b and σ_y = |a| σ_x", "Adding a constant shifts the mean only; multiplying scales both mean and SD"],
    onFormulaSheet: [],
    keywords: ["scaling", "coding", "y = ax + b", "shift", "stretch"]
  },
  {
    slug: "addition-rule-probability", title: "Addition rule and non-mutually-exclusive events", unit: "FM3", area: "Probability", strand: "Probability",
    statementIds: ["FM3-PRB-01"],
    prerequisites: ["maths:probability-basics", "maths:venn-diagrams"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q1: many added 3/11 and 7/12 instead of multiplying for a straightforward AND question." },
      { series: "Summer 2024", note: "Q3(i): misread as an AND question; 5/44 given instead of 5/11." }
    ],
    mustMemorise: ["P(A ∪ B) = P(A) + P(B) − P(A ∩ B)", "Mutually exclusive ⇒ P(A ∩ B) = 0", "OR ⇒ add (subtract the overlap); AND for independent events ⇒ multiply"],
    onFormulaSheet: ["P(A ∪ B) = P(A) + P(B) − P(A ∩ B) (Unit 3 formula sheet)"],
    keywords: ["addition rule", "union", "intersection", "mutually exclusive", "or"]
  },
  {
    slug: "venn-diagrams-probability", title: "Venn diagrams with unknowns and probabilities from them", unit: "FM3", area: "Probability", strand: "Probability",
    statementIds: ["FM3-PRB-02", "FM3-PRB-03"],
    prerequisites: ["addition-rule-probability"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q7(i): fewer than a quarter full marks – 17, 12, 30 placed correctly but forgot to add 25 to 10 before dividing by 120; answers greater than 1 seen." },
      { series: "Summer 2023", note: "Q3: 70% filled the diagram (x misplaced by some); half found x – many left out the 2 in the equation; 54/78 instead of 54/80." },
      { series: "Summer 2024", note: "Q6: well answered, but many did not check the total of 120 houses, leaving 26 unaccounted for." },
      { series: "Summer 2025", note: "Q3(i): 'only' misinterpreted; x − 18 written instead of x; the 9 outside the circles omitted." }
    ],
    mustMemorise: ["Fill from the centre outwards; 'only A' excludes the intersection", "Regions sum to the total (check the outside region)", "Probability = favourable region ÷ total, so answers must be ≤ 1"],
    onFormulaSheet: [],
    keywords: ["Venn", "intersection", "only", "outside", "unknown x", "three sets"]
  },
  {
    slug: "tree-diagrams-probability", title: "Tree diagrams (with and without replacement)", unit: "FM3", area: "Probability", strand: "Probability",
    statementIds: ["FM3-PRB-02", "FM3-PRB-03"],
    prerequisites: ["maths:tree-diagrams", "maths:probability-basics"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(i)–(ii): sum of pair products and triple products well understood; a few multiplied P(BB) and P(GG) instead of adding; leave exact answers as fractions." },
      { series: "Summer 2022", note: "Q6(iii): most gave 0.014, ignoring the two orders (Orange then Cola, Cola then Orange)." },
      { series: "Summer 2024", note: "Q3(ii): considerable arithmetic errors; a minority worked with replacement throughout; 1 − P(previous) was simpler than adding six probabilities." },
      { series: "Summer 2025", note: "Q7(i): only a very small number did not get a correct tree diagram." }
    ],
    mustMemorise: ["Multiply along branches, add between branches", "Without replacement: reduce the denominator (and numerator) on the second pick", "Count every order that satisfies the event; 'at least one' = 1 − P(none)"],
    onFormulaSheet: [],
    keywords: ["tree diagram", "without replacement", "branches", "at least one", "complement"]
  },
  {
    slug: "conditional-probability", title: "Conditional probability from tables, Venn and tree diagrams", unit: "FM3", area: "Probability", strand: "Probability",
    statementIds: ["FM3-PRB-02"],
    prerequisites: ["venn-diagrams-probability", "tree-diagrams-probability", "maths:two-way-tables"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(iii): fewer than a third full marks – did not see that P(3 same AND 2 same) = P(3 same); Q7(ii) a challenging conditional question that 60% got right." },
      { series: "Summer 2022", note: "Q6(ii): only the best correct – 28% or 28/100 given instead of 28/88." },
      { series: "Summer 2023", note: "Q3(iv): only 25% correct – answers given over 80 showed 'a total misunderstanding of conditional probability'; a good discriminator." },
      { series: "Summer 2024", note: "Q3(iii), Q6(iii): 'Once again, the conditional probability part proved to be very challenging' – numerator right, denominator wrong." },
      { series: "Summer 2025", note: "Q3(iv): only the strongest; Q7(iii): 0.3 × 0.4 on the numerator or 0.68 on the denominator identified, but only the very best combined them." }
    ],
    mustMemorise: ["P(A | B) = P(A ∩ B)/P(B): the denominator is the probability (or count) of the given condition, not the whole population", "From a tree: numerator = the branch(es) where both happen, denominator = all branches where the condition happens", "If A is a subset of B then P(A ∩ B) = P(A)"],
    onFormulaSheet: ["P(A | B) = P(A ∩ B)/P(B) (Unit 3 formula sheet)"],
    keywords: ["given that", "conditional", "denominator", "restricted sample space", "two-way table", "expected frequencies"]
  },
  {
    slug: "conditional-probability-with-distributions", title: "Conditional probability through the binomial and normal distributions", unit: "FM3", area: "Probability", strand: "Probability",
    statementIds: ["FM3-PRB-02", "FM3-PRB-03", "FM3-NOR-02", "FM3-BIN-02"],
    prerequisites: ["conditional-probability", "binomial-probabilities", "normal-distribution-z-probabilities"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q7(iii): only the strongest – majority did not realise 'less than 34' is included in 'less than 60' and multiplied two probabilities on the numerator." },
      { series: "Summer 2023", note: "Q5(iii): only the top 40% – the same subset error gave 0.1151." },
      { series: "Summer 2024", note: "Q6(iii): conditional part very challenging." }
    ],
    mustMemorise: ["P(X < a | X < b) = P(X < a)/P(X < b) when a < b (the smaller event is inside the larger one)", "Sketch the normal curve and shade both regions before dividing"],
    onFormulaSheet: ["P(A | B) = P(A ∩ B)/P(B) (Unit 3 formula sheet)", "Normal Probability Table"],
    keywords: ["conditional", "normal", "binomial", "subset", "given that"]
  },
  {
    slug: "pascals-triangle-binomial-expansion", title: "Pascal's triangle and expanding (p + q)ⁿ", unit: "FM3", area: "Binomial distribution", strand: "Binomial distribution",
    statementIds: ["FM3-BIN-01"],
    prerequisites: ["maths:expanding-double-brackets", "maths:laws-of-indices"],
    difficulty: 1,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q4(a): three-quarters expanded correctly; not writing out Pascal's triangle cost a mark; power 5 used instead of 6; plus signs omitted." },
      { series: "Summer 2022", note: "Q4(i)–(ii): almost everyone completed Pascal's triangle; expansion very well done." },
      { series: "Summer 2023", note: "Q4(ii): a few left out the coefficients or erred with powers." },
      { series: "Summer 2025", note: "Q4(i)–(ii): almost all completed the triangle and used it effectively." }
    ],
    mustMemorise: ["Rows of Pascal's triangle to n = 8 (1; 1 1; 1 2 1; 1 3 3 1; 1 4 6 4 1; 1 5 10 10 5 1; 1 6 15 20 15 6 1; 1 7 21 35 35 21 7 1; 1 8 28 56 70 56 28 8 1)", "(p + q)ⁿ terms: coefficient × pⁿ⁻ʳ qʳ, powers summing to n, joined with + signs"],
    onFormulaSheet: [],
    keywords: ["Pascal", "binomial expansion", "coefficients", "powers", "(p + q)^n"]
  },
  {
    slug: "binomial-probabilities", title: "Binomial probabilities in context (exactly r, at least r)", unit: "FM3", area: "Binomial distribution", strand: "Binomial distribution",
    statementIds: ["FM3-BIN-02"],
    prerequisites: ["pascals-triangle-binomial-expansion", "tree-diagrams-probability"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q4(b): p and q mixed up (0.2 vs 0.8); 'at least 2' – fewer than half full marks; 1 − {P(0) + P(1)} preferred; early rounding lost the final mark." },
      { series: "Summer 2022", note: "Q4(iii)–(iv): 0.3 and 0.7 mixed up; coefficient 4 omitted; 'at least' ignored." },
      { series: "Summer 2023", note: "Q4(iv): omission of brackets in 1 − (P(0) + P(1)) caused many problems; coefficients left out." },
      { series: "Summer 2024", note: "Q4(iii)–(v): wrong terms selected; 'at least' misunderstood; simple p³ over-complicated; 0.03 truncated." },
      { series: "Summer 2025", note: "Q4(iv): summing many probabilities instead of 1 − P(0) − P(1); calculator statistical functions must be backed by working." }
    ],
    mustMemorise: ["Identify p (success) and q = 1 − p, and which term matches 'exactly r successes'", "'At least r' = 1 − (sum of the terms below r), with brackets", "Show the full derivation (coefficient × powers); keep full accuracy until the final rounding"],
    onFormulaSheet: [],
    keywords: ["binomial", "exactly", "at least", "at most", "success", "trials", "complement"]
  },
  {
    slug: "normal-distribution-bell-curve", title: "The normal distribution as a model for real-world variables", unit: "FM3", area: "Normal distribution", strand: "Normal distribution",
    statementIds: ["FM3-NOR-01"],
    prerequisites: ["mean-and-standard-deviation"],
    difficulty: 1,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q5: nearly a fifth of candidates left the (new) normal question blank or used the SD formula, suggesting the topic had not been taught." }
    ],
    mustMemorise: ["Bell-shaped, symmetric about the mean; total area 1; mean = median = mode", "Roughly 68% within 1 SD, 95% within 2 SD", "Examples: heights, masses, measurement errors"],
    onFormulaSheet: [],
    keywords: ["bell curve", "symmetric", "continuous", "mean", "standard deviation"]
  },
  {
    slug: "normal-distribution-z-probabilities", title: "Probabilities from the normal table using z = (x − μ)/σ", unit: "FM3", area: "Normal distribution", strand: "Normal distribution",
    statementIds: ["FM3-NOR-02"],
    prerequisites: ["normal-distribution-bell-curve"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q5: 70% very well done; some found z then forgot to subtract from 1; a good diagram with x and z values below the axis 'definitely improved the chances of gaining full marks'." },
      { series: "Summer 2022", note: "Q7(i)–(ii): a few did not know the z formula; half marks for not handling a negative z." },
      { series: "Summer 2023", note: "Q5(ii): negative z of −1.2 – forgot to subtract from 1 and left 0.8849." },
      { series: "Summer 2024", note: "Q5: wrong area chosen (0.0062 given)." },
      { series: "Summer 2025", note: "Q6: very well done; some unsure when to subtract from 1 (0.0808 given); calculator normal functions need supporting working." }
    ],
    mustMemorise: ["z = (x − μ)/σ (not on the formula sheet – memorise it)", "The table gives Φ(z) = P(Z < z) for z ≥ 0; P(Z > z) = 1 − Φ(z); P(Z < −z) = 1 − Φ(z)", "Sketch the curve, mark μ and x below the axis, shade the required tail; only single tails (not P(a < z < b)) are examined"],
    onFormulaSheet: ["Normal Probability Table (Unit 3 booklet page 3)"],
    keywords: ["z-score", "standardise", "normal table", "tail", "1 minus", "Φ(z)"]
  },
  {
    slug: "spearmans-rank-correlation", title: "Spearman's rank correlation coefficient and its interpretation", unit: "FM3", area: "Bivariate analysis", strand: "Bivariate analysis",
    statementIds: ["FM3-BIV-01"],
    prerequisites: ["maths:scatter-graphs"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q6(i)–(iii): tied ranks caused mistakes; the 6 omitted from the formula; 9 × 81 instead of 9 × 80; the word 'correlation' must appear in the interpretation." },
      { series: "Summer 2022", note: "Q2: (Σd)² used instead of Σd²." },
      { series: "Summer 2024", note: "Q2: negative values for d² seen; 'perfect positive correlation' claimed wrongly; impossible values outside [−1, 1]." },
      { series: "Summer 2025", note: "Q1: three-way tie in IQ mishandled; forgetting '1 −' or putting it in the numerator; any small positive r called positive correlation, though the Teacher Guidance treats −0.4 ≤ r ≤ 0.4 as weak or none." }
    ],
    mustMemorise: ["Rank both variables the same way; tied values share the mean of the ranks they occupy", "r = 1 − 6Σd²/(n(n² − 1)); d² is squared for each pair, then summed", "−1 ≤ r ≤ 1; −0.4 ≤ r ≤ 0.4 is weak/no correlation; state 'positive/negative correlation' and what it means in context"],
    onFormulaSheet: ["Spearman's coefficient of rank correlation r = 1 − 6Σd²/(n(n² − 1)) (Unit 3 formula sheet)"],
    keywords: ["Spearman", "rank", "tied ranks", "d²", "correlation", "interpret"]
  },
  {
    slug: "line-of-best-fit", title: "Line of best fit through (x̄, ȳ): drawing, equation and use", unit: "FM3", area: "Bivariate analysis", strand: "Bivariate analysis",
    statementIds: ["FM3-BIV-02", "FM3-BIV-03"],
    prerequisites: ["maths:scatter-graphs", "maths:equation-of-a-line", "mean-and-standard-deviation"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q6(iv)–(vi): means lost a mark for rounding; 80% drew the line well but not always through the means; gradient found from table points not on the line; rise/run forgot the negative sign; use the mean as one point for m and c." },
      { series: "Summer 2022", note: "Q2(v)–(vi): same pattern – points from the table used instead of points on the line." },
      { series: "Summer 2023", note: "Q1(v): many drew the line through the origin, which was outside the acceptable range; (vi) c found by dividing instead of subtracting in y = mx + c." },
      { series: "Summer 2024", note: "Q2: only the more able found the equation – gradient inverted, intercept read off a graph whose axes did not start at zero." }
    ],
    mustMemorise: ["Calculate x̄ and ȳ (to 2 d.p.), plot the mean point and draw the line through it", "Gradient from two points ON the line (one being (x̄, ȳ)) using (y₂ − y₁)/(x₂ − x₁)", "Find c by substituting (x̄, ȳ) into y = mx + c; use the equation to predict, noting extrapolation limits"],
    onFormulaSheet: [],
    keywords: ["line of best fit", "mean point", "gradient", "intercept", "y = mx + c", "predict"]
  }
];
