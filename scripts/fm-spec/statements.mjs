// Learning-outcome statements for CCEA GCSE Further Mathematics (2017), Specification V2 (17 Sept 2019), Section 3.
// `text` is verbatim from the specification PDF (docs/sources/further-maths/GCSE-Further-Mathematics-2017-specification-v2.pdf),
// including the trailing list connectors ("; and", ".") exactly as printed. Mathematical glyphs that the PDF text layer drops
// (Cambria Math x, ≤, ≠, superscripts) were restored from the font-aware extraction (scripts/extract-spec-pdf.mjs).
// `teacherGuidance` is the "Elaboration" column of the CCEA GCSE Further Mathematics Teacher Guidance (December 2024),
// docs/sources/further-maths/GCSE-Further-Mathematics-Teacher-Guidance-2024.pdf, lightly re-linearised.

export const statements = [
  // ───────────────────────── Unit 1: Pure Mathematics ─────────────────────────
  {
    id: "FM1-ALF-01", unit: "FM1", area: "Algebraic fractions", strand: "Algebra", specPage: 7,
    text: "add, subtract, multiply and divide rational algebraic fractions with linear and quadratic numerators and/or denominators;",
    teacherGuidance: "For example, simplify (x² − 3x)/3 × 9/(x² − x − 6)."
  },
  {
    id: "FM1-ALM-01", unit: "FM1", area: "Algebraic manipulation", strand: "Algebra", specPage: 7,
    text: "manipulate algebraic expressions, including the expansion of three linear brackets;",
    teacherGuidance: "For example, expand (2x + 1)(x − 3)(1 − 3x). Algebraic manipulation and formation can be assessed in a variety of ways."
  },
  {
    id: "FM1-CSQ-01", unit: "FM1", area: "Completing the square", strand: "Algebra", specPage: 7,
    text: "complete the square where the coefficient of x² will always be 1;",
    teacherGuidance: "(i) Rewrite f(x) = x² + 5x + 1 in the form (x + a)² + b."
  },
  {
    id: "FM1-CSQ-02", unit: "FM1", area: "Completing the square", strand: "Algebra", specPage: 7,
    text: "apply completing the square to solving quadratic equations and identifying minimum turning points;",
    teacherGuidance: "(ii) Use the completed-square form to find the minimum of f(x) and the value of x for which it occurs. (iii) Solve x² = −5x − 1 by completing the square, giving the answer in surd form, i.e., x = a ± √b or x = a ± c√b."
  },
  {
    id: "FM1-SIM-01", unit: "FM1", area: "Simultaneous equations", strand: "Algebra", specPage: 7,
    text: "form and solve three equations in three unknowns;",
    teacherGuidance: "The equations will be linear. Equations will be given or students may be asked to form the equations and interpret the results. Students should show the full development of their answer. Sole use of a calculator will not gain any marks."
  },
  {
    id: "FM1-QIN-01", unit: "FM1", area: "Quadratic inequalities", strand: "Algebra", specPage: 7,
    text: "solve quadratic inequalities, which are restricted to quadratic expressions that factorise;",
    teacherGuidance: "Graphical method of solution is recommended. Formation of inequality may be required from a given context."
  },
  {
    id: "FM1-TRG-01", unit: "FM1", area: "Trigonometric equations", strand: "Trigonometry", specPage: 7,
    text: "sketch the graphs of sin x, cos x and tan x, where the range of x is a subset of −360° ≤ x ≤ 360°; and",
    teacherGuidance: "Only graphs of sin x, cos x and tan x are required. Transformations of these graphs, e.g., sin 2x, cos(x − 30°) will not be asked."
  },
  {
    id: "FM1-TRG-02", unit: "FM1", area: "Trigonometric equations", strand: "Trigonometry", specPage: 7,
    text: "solve simple trigonometric equations that lead to a maximum of two solutions in a given range.",
    teacherGuidance: "Example of equation: Solve cos(½x − 30°) = −0.7 in the range −360° ≤ x ≤ 360°. A variety of ranges will be used. Sine rule and cosine rule will not be asked."
  },
  {
    id: "FM1-DIF-01", unit: "FM1", area: "Differentiation", strand: "Calculus", specPage: 8,
    text: "differentiate expressions that are restricted to integer powers of x;",
    teacherGuidance: "First and second derivatives may be asked. Note – fractional indices are excluded, all powers will be positive or negative integers."
  },
  {
    id: "FM1-DIF-02", unit: "FM1", area: "Differentiation", strand: "Calculus", specPage: 8,
    text: "apply differentiation to: gradients; finding equations of tangents and normals at points on a curve; simple optimisation problems; and elementary curve sketching of a quadratic or cubic function;",
    subItems: [
      "gradients;",
      "finding equations of tangents and normals at points on a curve;",
      "simple optimisation problems; and",
      "elementary curve sketching of a quadratic or cubic function;"
    ],
    teacherGuidance: "Three-dimensional optimisation problems and problems involving pi will not be asked. Cubic functions for sketching could have x as a common factor or be the product of 3 linear factors. Examples: y = x³ + 2x² − 5x or y = (x − 1)(x + 2)(2x − 3)."
  },
  {
    id: "FM1-INT-01", unit: "FM1", area: "Integration", strand: "Calculus", specPage: 8,
    text: "demonstrate knowledge that integration is the inverse process to differentiation;",
    teacherGuidance: "Students will be asked to integrate the area between a curve, x-axis, and two ordinates x = a and x = b."
  },
  {
    id: "FM1-INT-02", unit: "FM1", area: "Integration", strand: "Calculus", specPage: 8,
    text: "integrate expressions that are restricted to integer powers of x, (x ≠ −1);",
    note: "The specification (and the Teacher Guidance) literally print the condition as (x ≠ −1); in context it means the power n ≠ −1, i.e. 1/x is not integrated.",
    teacherGuidance: "Powers are positive or negative integers only (see Differentiation); the integral of x⁻¹ is not required."
  },
  {
    id: "FM1-INT-03", unit: "FM1", area: "Integration", strand: "Calculus", specPage: 8,
    text: "form and evaluate definite integrals;",
    teacherGuidance: "Definite integrals are between two ordinates x = a and x = b."
  },
  {
    id: "FM1-INT-04", unit: "FM1", area: "Integration", strand: "Calculus", specPage: 8,
    text: "apply integration to finding the area under a curve;",
    teacherGuidance: "Students will be asked to integrate the area between a curve, x-axis, and two ordinates x = a and x = b. Excluding combinations of positive and negative areas."
  },
  {
    id: "FM1-LOG-01", unit: "FM1", area: "Logarithms", strand: "Logarithms", specPage: 8,
    text: "demonstrate understanding of logarithms as a natural evolution from indices;",
    teacherGuidance: "Understand that 8 = 2³ ⇔ log₂ 8 = 3. Excluding change of base rule."
  },
  {
    id: "FM1-LOG-02", unit: "FM1", area: "Logarithms", strand: "Logarithms", specPage: 8,
    text: "solve problems using: the laws of logarithms; and log/log graphs in context;",
    subItems: ["the laws of logarithms; and", "log/log graphs in context;"],
    teacherGuidance: "Excluding change of base rule. Students will be required to draw log/log graphs from a table of data. The resulting graph will be a straight line."
  },
  {
    id: "FM1-LOG-03", unit: "FM1", area: "Logarithms", strand: "Logarithms", specPage: 8,
    text: "solve indicial equations using logarithms;",
    teacherGuidance: "Example of indicial equation: Solve 3^(2x − 1) = 5^(1 + x). The powers in indicial equations will either be a constant or a linear expression in x."
  },
  {
    id: "FM1-MAT-01", unit: "FM1", area: "Matrices", strand: "Matrices", specPage: 8,
    text: "add, subtract and multiply matrices;",
    teacherGuidance: "Non square matrices may be used for addition or subtraction. Example: [2 3 4] + [5 −2 −7]. For multiplication, matrix dimensions will not exceed 3 rows or 3 columns, but 3 × 3 matrices will not be included."
  },
  {
    id: "FM1-MAT-02", unit: "FM1", area: "Matrices", strand: "Matrices", specPage: 8,
    text: "find the inverse of 2 × 2 matrices;",
    teacherGuidance: "Inverse of 2 × 2 matrices only (3 × 3 matrices are not included)."
  },
  {
    id: "FM1-MAT-03", unit: "FM1", area: "Matrices", strand: "Matrices", specPage: 8,
    text: "solve matrix equations; and",
    teacherGuidance: "Matrix equations could be of the form: A ± X = B or AX = B or a combination of these. Equations of the form XA = B are excluded."
  },
  {
    id: "FM1-MAT-04", unit: "FM1", area: "Matrices", strand: "Matrices", specPage: 8,
    text: "use matrices to solve 2 × 2 simultaneous equations.",
    teacherGuidance: "Write the pair of linear equations as AX = B and solve with X = A⁻¹B (equations of the form XA = B are excluded)."
  },

  // ───────────────────────── Unit 2: Mechanics ─────────────────────────
  {
    id: "FM2-KIN-01", unit: "FM2", area: "Kinematics", strand: "Kinematics", specPage: 9,
    text: "draw, interpret and use displacement/time graphs and velocity/time graphs;",
    teacherGuidance: "Including graphs showing two journeys, for example one vehicle meeting/overtaking another. Displacement/time graphs may include negative displacements while velocity/time graphs will only have positive velocity. Average speed and average velocity can be asked."
  },
  {
    id: "FM2-KIN-02", unit: "FM2", area: "Kinematics", strand: "Kinematics", specPage: 9,
    text: "use constant acceleration formulae;",
    teacherGuidance: "Including vertical and horizontal motion."
  },
  {
    id: "FM2-VEC-01", unit: "FM2", area: "Vectors", strand: "Vectors", specPage: 9,
    text: "demonstrate understanding of the definition of vector and scalar quantities;",
    teacherGuidance: "A general definition (magnitude and direction vs magnitude only) with examples is expected; examiners accept 'quantity' for 'magnitude'."
  },
  {
    id: "FM2-VEC-02", unit: "FM2", area: "Vectors", strand: "Vectors", specPage: 9,
    text: "calculate the magnitude and direction of a vector;",
    teacherGuidance: "Including angle between xi + yj and either i or j."
  },
  {
    id: "FM2-VEC-03", unit: "FM2", area: "Vectors", strand: "Vectors", specPage: 9,
    text: "use i and j vectors in calculations;",
    teacherGuidance: "Including angle between xi + yj and either i or j."
  },
  {
    id: "FM2-FOR-01", unit: "FM2", area: "Forces", strand: "Forces", specPage: 9,
    text: "demonstrate understanding that force is a vector;",
    teacherGuidance: "Resolving problems and equilibrium problems involve a maximum of four separate forces."
  },
  {
    id: "FM2-FOR-02", unit: "FM2", area: "Forces", strand: "Forces", specPage: 9,
    text: "identify all forces acting on a body;",
    teacherGuidance: "Resolving problems and equilibrium problems involve a maximum of four separate forces."
  },
  {
    id: "FM2-FOR-03", unit: "FM2", area: "Forces", strand: "Forces", specPage: 9,
    text: "resolve forces into components;",
    teacherGuidance: "Resolving problems and equilibrium problems involve a maximum of four separate forces."
  },
  {
    id: "FM2-FOR-04", unit: "FM2", area: "Forces", strand: "Forces", specPage: 9,
    text: "find the resultant of a set of forces;",
    teacherGuidance: "Resolving problems and equilibrium problems involve a maximum of four separate forces."
  },
  {
    id: "FM2-FOR-05", unit: "FM2", area: "Forces", strand: "Forces", specPage: 9,
    text: "demonstrate understanding of and apply the concept of equilibrium;",
    teacherGuidance: "Resolving problems and equilibrium problems involve a maximum of four separate forces."
  },
  {
    id: "FM2-NEW-01", unit: "FM2", area: "Newton's laws of motion", strand: "Newton's laws of motion", specPage: 9,
    text: "apply F = ma to the following scenarios: a body in horizontal or vertical motion; a body on an inclined plane; and two connected bodies in rectilinear motion; (F = μR will not be tested – if included, friction will be given as a value or as a value per unit mass, where appropriate.)",
    subItems: [
      "a body in horizontal or vertical motion;",
      "a body on an inclined plane; and",
      "two connected bodies in rectilinear motion;"
    ],
    teacherGuidance: "Straight line motion only. Including motion of a body on an inclined plane. Any externally applied forces acting on a body on an inclined plane will act parallel to that plane. Questions may involve calculating the magnitude of the resultant force exerted by a string on a pulley. With connected particles, either: both bodies move horizontally, or both bodies move vertically, or one body moves horizontally and the other moves vertically."
  },
  {
    id: "FM2-MOM-01", unit: "FM2", area: "Moments", strand: "Moments", specPage: 9,
    text: "demonstrate understanding of the Principle of Moments and equilibrium of a rigid body (restricted to a horizontal uniform rod supported by one or two pivots).",
    teacherGuidance: "Problems will involve uniform rods only, no hinge or ladder questions."
  },

  // ───────────────────────── Unit 3: Statistics ─────────────────────────
  {
    id: "FM3-CTD-01", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion", specPage: 10,
    text: "calculate the mean and standard deviation from data or estimates of these from grouped data;",
    teacherGuidance: "Calculation of median or interquartile range will not be asked."
  },
  {
    id: "FM3-CTD-02", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion", specPage: 10,
    text: "calculate the mean and standard deviation for combined sets of data;",
    teacherGuidance: "For example, a test given to a class of 6 boys and 4 girls resulted in an overall mean of 16.8. If the 6 boys achieved a mean mark of 16.0, find the mean mark achieved by the 4 girls."
  },
  {
    id: "FM3-CTD-03", unit: "FM3", area: "Central tendency and dispersion", strand: "Central tendency and dispersion", specPage: 10,
    text: "demonstrate knowledge of the effect on the mean and standard deviation of a linear transformation on a set of data;",
    teacherGuidance: "Know that if a data set is transformed such that Y = aX + b then ȳ = a x̄ + b and σ_Y = a σ_X. For example, given the mean and standard deviation for a data set, calculate the new mean and standard deviation if there is a change to the original data set, i.e., items removed or added."
  },
  {
    id: "FM3-PRB-01", unit: "FM3", area: "Probability", strand: "Probability", specPage: 10,
    text: "calculate combined probabilities using the addition rule, to include events that may not be mutually exclusive;",
    teacherGuidance: "Understand and use P(A ∪ B), P(A ∩ B) and P(A | B)."
  },
  {
    id: "FM3-PRB-02", unit: "FM3", area: "Probability", strand: "Probability", specPage: 10,
    text: "calculate and interpret conditional probabilities using expected frequencies, two-way tables, tree diagrams and Venn diagrams;",
    teacherGuidance: "Understand and use P(A ∪ B), P(A ∩ B) and P(A | B). Conditional probabilities can also be tested through the binomial and/or normal distributions."
  },
  {
    id: "FM3-PRB-03", unit: "FM3", area: "Probability", strand: "Probability", specPage: 10,
    text: "use the most appropriate method to solve complex problems, including the construction and use of Venn diagrams and tree diagrams;",
    teacherGuidance: "Conditional probabilities can also be tested through the binomial and/or normal distributions."
  },
  {
    id: "FM3-BIN-01", unit: "FM3", area: "Binomial distribution", strand: "Binomial distribution", specPage: 10,
    text: "use Pascal's triangle to expand (p + q)ⁿ where n ≤ 8;",
    teacherGuidance: "Example: A coin is tossed 7 times. The probability of obtaining a head on any one toss is 0.4. What is the probability that: i) a total of 1 or 2 heads is obtained [Prob (one head) + Prob (two heads)]; ii) at least 2 heads are obtained? [1 − Prob (no heads) − Prob (one head)]."
  },
  {
    id: "FM3-BIN-02", unit: "FM3", area: "Binomial distribution", strand: "Binomial distribution", specPage: 10,
    text: "understand and use the binomial expansion to calculate probabilities in real-life contexts;",
    teacherGuidance: "The full derivation of binomial probabilities is required (coefficients from Pascal's triangle, powers of p and q shown)."
  },
  {
    id: "FM3-NOR-01", unit: "FM3", area: "Normal distribution", strand: "Normal distribution", specPage: 10,
    text: "recognise that the distribution of many real-world variables takes the shape of a bell curve; and",
    teacherGuidance: "Students are encouraged to use a good diagram in the development of their answer."
  },
  {
    id: "FM3-NOR-02", unit: "FM3", area: "Normal distribution", strand: "Normal distribution", specPage: 10,
    text: "calculate a single probability from the normal distribution using tables and z = (x − μ)/σ where the mean and standard deviation are given.",
    teacherGuidance: "Probability will be of the form P(z > 1), P(z < −0.5) but not P(1 < z < 2). Students will only be required to find a probability from a z-value, not a z-value from a probability. Students are encouraged to use a good diagram in the development of their answer."
  },
  {
    id: "FM3-BIV-01", unit: "FM3", area: "Bivariate analysis", strand: "Bivariate analysis", specPage: 11,
    text: "calculate and interpret Spearman's Rank Correlation Coefficient;",
    teacherGuidance: "When interpreting Spearman's Rank Correlation Coefficient, r, know that −1 ≤ r ≤ 1 and that, for this specification, values −0.4 ≤ r ≤ 0.4 will be taken as weak or no correlation."
  },
  {
    id: "FM3-BIV-02", unit: "FM3", area: "Bivariate analysis", strand: "Bivariate analysis", specPage: 11,
    text: "draw the line of best fit by eye passing through (x̄, ȳ); and",
    teacherGuidance: "The plotting of original data will be given. Where possible, the line of best fit must always go through both means."
  },
  {
    id: "FM3-BIV-03", unit: "FM3", area: "Bivariate analysis", strand: "Bivariate analysis", specPage: 11,
    text: "calculate and use the equation of the line of best fit.",
    teacherGuidance: "Where possible, the line of best fit must always go through both means; use (x̄, ȳ) and a second point on the line to find the gradient."
  },

  // ───────────────────────── Unit 4: Discrete and Decision Mathematics ─────────────────────────
  {
    id: "FM4-CNT-01", unit: "FM4", area: "Counting", strand: "Counting", specPage: 12,
    text: "demonstrate understanding of and use the addition and multiplication principles to count events in series and parallel respectively;",
    teacherGuidance: "Calculators may be used to calculate nCr and nPr."
  },
  {
    id: "FM4-CNT-02", unit: "FM4", area: "Counting", strand: "Counting", specPage: 12,
    text: "calculate the number of ways of arranging r objects from n objects;",
    teacherGuidance: "Calculators may be used to calculate nCr and nPr."
  },
  {
    id: "FM4-CNT-03", unit: "FM4", area: "Counting", strand: "Counting", specPage: 12,
    text: "calculate the number of ways of choosing r objects from n objects;",
    teacherGuidance: "Calculators may be used to calculate nCr and nPr."
  },
  {
    id: "FM4-LGC-01", unit: "FM4", area: "Logic", strand: "Logic", specPage: 12,
    text: "demonstrate understanding of the concept of Boolean variables, including forming compound expressions using logical operators AND, OR and NOT;",
    teacherGuidance: "No further elaboration given in the Teacher Guidance."
  },
  {
    id: "FM4-LGC-02", unit: "FM4", area: "Logic", strand: "Logic", specPage: 12,
    text: "use truth tables to prove the equivalence of propositional statements (involving no more than three variables);",
    teacherGuidance: "No further elaboration given in the Teacher Guidance."
  },
  {
    id: "FM4-LPR-01", unit: "FM4", area: "Linear programming", strand: "Linear programming", specPage: 12,
    text: "model real-life scenarios as linear programming problems;",
    teacherGuidance: "No further elaboration given in the Teacher Guidance."
  },
  {
    id: "FM4-LPR-02", unit: "FM4", area: "Linear programming", strand: "Linear programming", specPage: 12,
    text: "use graphical methods to maximise or minimise an expression involving up to five inequalities in one or two variables (solutions may be real numbers or restricted to integers);",
    teacherGuidance: "No further elaboration given in the Teacher Guidance."
  },
  {
    id: "FM4-TSR-01", unit: "FM4", area: "Time series", strand: "Time series", specPage: 12,
    text: "demonstrate understanding of why we smooth data;",
    teacherGuidance: "The correct trend line will always be a straight line."
  },
  {
    id: "FM4-TSR-02", unit: "FM4", area: "Time series", strand: "Time series", specPage: 12,
    text: "calculate appropriate moving averages (using three, four or five points); and",
    teacherGuidance: "The correct trend line will always be a straight line."
  },
  {
    id: "FM4-TSR-03", unit: "FM4", area: "Time series", strand: "Time series", specPage: 12,
    text: "draw a trend line and use it to make predictions (the plotting of original data will be given).",
    teacherGuidance: "The correct trend line will always be a straight line."
  },
  {
    id: "FM4-CPA-01", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis", specPage: 13,
    text: "demonstrate understanding of how an activity network represents a project (using activities on an arc);",
    teacherGuidance: "Scheduling will be able to be performed by inspection."
  },
  {
    id: "FM4-CPA-02", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis", specPage: 13,
    text: "construct an activity network from a precedence table;",
    teacherGuidance: "Activity-on-arc networks."
  },
  {
    id: "FM4-CPA-03", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis", specPage: 13,
    text: "identify the critical path by finding the earliest and latest event times;",
    teacherGuidance: "Forward pass for earliest event times, backward pass for latest event times."
  },
  {
    id: "FM4-CPA-04", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis", specPage: 13,
    text: "calculate float times; and",
    teacherGuidance: "Float = latest finish − earliest start − duration; critical activities have zero float."
  },
  {
    id: "FM4-CPA-05", unit: "FM4", area: "Critical path analysis", strand: "Critical path analysis", specPage: 13,
    text: "perform basic scheduling using Gantt charts.",
    teacherGuidance: "Scheduling will be able to be performed by inspection."
  }
];
