// Teachable topics for Unit 4: Discrete and Decision Mathematics. Uptake is tiny (see units[].lowUptakeEvidence);
// the only examiner commentary is the Summer 2023 report (four candidates).

export const topicsFM4 = [
  {
    slug: "counting-principles", title: "Addition and multiplication principles for counting", unit: "FM4", area: "Counting", strand: "Counting",
    statementIds: ["FM4-CNT-01"],
    prerequisites: ["maths:probability-basics"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q1(iii) and Q5: occasional difficulty knowing whether to multiply or add two terms." }
    ],
    mustMemorise: ["Events in series (one then another): multiply", "Events in parallel (one or another, mutually exclusive): add"],
    onFormulaSheet: [],
    keywords: ["multiplication principle", "addition principle", "series", "parallel", "count outcomes"]
  },
  {
    slug: "permutations", title: "Arrangements: nPr", unit: "FM4", area: "Counting", strand: "Counting",
    statementIds: ["FM4-CNT-02"],
    prerequisites: ["counting-principles"],
    difficulty: 2,
    examinerEvidence: [],
    mustMemorise: ["nPr = n!/(n − r)!; n! arrangements of n distinct objects", "Order matters for arrangements; calculators may be used for nPr"],
    onFormulaSheet: [],
    keywords: ["permutation", "arrangement", "factorial", "nPr", "order matters"]
  },
  {
    slug: "combinations", title: "Selections: nCr", unit: "FM4", area: "Counting", strand: "Counting",
    statementIds: ["FM4-CNT-03"],
    prerequisites: ["permutations"],
    difficulty: 2,
    examinerEvidence: [],
    mustMemorise: ["nCr = n!/(r!(n − r)!); order does not matter", "nCr = nPr/r!; nCr = nC(n−r)"],
    onFormulaSheet: [],
    keywords: ["combination", "choose", "selection", "nCr", "order irrelevant"]
  },
  {
    slug: "boolean-expressions", title: "Boolean variables and compound expressions (AND, OR, NOT)", unit: "FM4", area: "Logic", strand: "Logic",
    statementIds: ["FM4-LGC-01"],
    prerequisites: [],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q4(iv): expressing a Boolean result in English phrases caused problems; some gave complicated expressions in p and q instead." }
    ],
    mustMemorise: ["Boolean variables take the values true/false (1/0)", "AND (∧) true only when both true; OR (∨) true when at least one true; NOT (¬) flips the value", "Translate between English statements and symbolic form in both directions"],
    onFormulaSheet: [],
    keywords: ["Boolean", "AND", "OR", "NOT", "proposition", "logical operator"]
  },
  {
    slug: "truth-tables-equivalence", title: "Truth tables and proving equivalence of statements", unit: "FM4", area: "Logic", strand: "Logic",
    statementIds: ["FM4-LGC-02"],
    prerequisites: ["boolean-expressions"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q4(i)–(iii): answered excellently." }
    ],
    mustMemorise: ["A table for n variables has 2ⁿ rows (up to 8 rows for three variables)", "Two statements are equivalent when their final columns agree in every row", "De Morgan: NOT(A AND B) ≡ (NOT A) OR (NOT B); NOT(A OR B) ≡ (NOT A) AND (NOT B)"],
    onFormulaSheet: [],
    keywords: ["truth table", "equivalent", "De Morgan", "three variables", "tautology"]
  },
  {
    slug: "linear-programming-formulation", title: "Modelling a scenario as a linear programming problem", unit: "FM4", area: "Linear programming", strand: "Linear programming",
    statementIds: ["FM4-LPR-01"],
    prerequisites: ["maths:linear-inequalities", "maths:forming-equations"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q2(iv): start from the given information and show it leads to the required inequality, not the other way round." }
    ],
    mustMemorise: ["Define the decision variables with units", "Write each constraint as an inequality (including x ≥ 0, y ≥ 0 and any integer restriction)", "Write the objective function to be maximised or minimised"],
    onFormulaSheet: [],
    keywords: ["constraints", "objective function", "decision variables", "inequalities", "model"]
  },
  {
    slug: "linear-programming-graphical", title: "Graphical solution of linear programming problems", unit: "FM4", area: "Linear programming", strand: "Linear programming",
    statementIds: ["FM4-LPR-02"],
    prerequisites: ["linear-programming-formulation", "maths:inequalities-graphical-regions"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q2(vii): some chose the wrong vertex for the maximum profit." }
    ],
    mustMemorise: ["Draw each boundary line, shade out the unwanted side, identify the feasible region", "The optimum is at a vertex of the feasible region: evaluate the objective at every vertex (or slide the objective line)", "If solutions must be integers, test the integer points nearest the optimal vertex inside the region"],
    onFormulaSheet: [],
    keywords: ["feasible region", "vertex", "objective line", "maximise", "minimise", "integer solutions"]
  },
  {
    slug: "moving-averages", title: "Smoothing data with moving averages", unit: "FM4", area: "Time series", strand: "Time series",
    statementIds: ["FM4-TSR-01", "FM4-TSR-02"],
    prerequisites: ["maths:averages"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q3: excellent answers (the topic was on the legacy specification); all used 3-point moving averages correctly; moving averages should be given to the stated significant figures." }
    ],
    mustMemorise: ["Moving averages smooth out seasonal/periodic variation to reveal the trend", "Use n equal to the length of the cycle (3, 4 or 5 points); plot each average at the middle of its interval (between points for even n)"],
    onFormulaSheet: [],
    keywords: ["moving average", "smoothing", "seasonal variation", "trend", "3-point", "4-point"]
  },
  {
    slug: "trend-lines-and-predictions", title: "Trend lines and predictions from a time series", unit: "FM4", area: "Time series", strand: "Time series",
    statementIds: ["FM4-TSR-03"],
    prerequisites: ["moving-averages", "maths:straight-line-graphs"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q3(iii): almost all took the reading at the correct point on the trend line." }
    ],
    mustMemorise: ["Draw a straight trend line through the plotted moving averages", "Predict by extending the trend line and reading at the required time; adjust for the seasonal effect if asked"],
    onFormulaSheet: [],
    keywords: ["trend line", "extrapolate", "prediction", "time series"]
  },
  {
    slug: "activity-networks", title: "Activity networks from precedence tables (activity on arc)", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis",
    statementIds: ["FM4-CPA-01", "FM4-CPA-02"],
    prerequisites: [],
    difficulty: 3,
    examinerEvidence: [],
    mustMemorise: ["Activities are arcs, events (nodes) mark the start/finish of activities", "Every activity starts only after all its immediate predecessors finish; use a dummy activity when needed to preserve precedence or uniqueness", "Single start node and single finish node"],
    onFormulaSheet: [],
    keywords: ["activity on arc", "precedence table", "dummy", "event", "network"]
  },
  {
    slug: "critical-path-and-float", title: "Earliest/latest event times, critical path and float", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis",
    statementIds: ["FM4-CPA-03", "FM4-CPA-04"],
    prerequisites: ["activity-networks"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q6(i): occasional errors in a couple of the late event times; (ii) all found the critical activities and the length of the critical path." }
    ],
    mustMemorise: ["Forward pass: earliest event time = max over incoming arcs of (earliest start + duration)", "Backward pass: latest event time = min over outgoing arcs of (latest finish − duration)", "Critical activities have zero float; float = latest finish − earliest start − duration"],
    onFormulaSheet: [],
    keywords: ["earliest event time", "latest event time", "critical path", "float", "forward pass", "backward pass"]
  },
  {
    slug: "gantt-chart-scheduling", title: "Basic scheduling with Gantt charts", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis",
    statementIds: ["FM4-CPA-05"],
    prerequisites: ["critical-path-and-float"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2023", note: "Q6(iii): a little more difficult – one problem was starting an activity before all its required predecessors had been completed." }
    ],
    mustMemorise: ["Draw critical activities first on the time axis, then non-critical activities within their float windows", "Never start an activity before all its predecessors finish; scheduling by inspection to minimise workers or finish time"],
    onFormulaSheet: [],
    keywords: ["Gantt chart", "cascade chart", "schedule", "workers", "float window"]
  }
];
