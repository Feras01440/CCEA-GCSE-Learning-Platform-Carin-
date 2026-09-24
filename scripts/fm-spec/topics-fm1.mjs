// Teachable topics for Unit 1: Pure Mathematics. Evidence quotes/paraphrases come from the Chief Examiner's Reports
// (docs/sources/further-maths/GCSE-Further-Mathematics-Chief-Examiner-Report-Summer20{18,19,22,23,24,25}.txt).
// Prerequisite slugs prefixed "maths:" refer to CCEA GCSE Mathematics (Higher Tier, M4/M8) topics.

export const topicsFM1 = [
  {
    slug: "algebraic-fractions-simplify", title: "Simplifying algebraic fractions", unit: "FM1", area: "Algebraic fractions", strand: "Algebra",
    statementIds: ["FM1-ALF-01"],
    prerequisites: ["maths:factorising-quadratics", "maths:algebraic-fractions"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q8: first step must be to factorise all quadratics; many failed and 'tied themselves up in knots with cubic numerators and denominators'; incorrect cancelling evident." },
      { series: "Summer 2024", note: "Q8(a): most factorised and cancelled but a high number did not simplify fully, missing the factor of 2." },
      { series: "Summer 2023", note: "Q9: several failed to fully simplify, leaving 3x(x − 2)/x as the final answer." }
    ],
    mustMemorise: ["Factorise every numerator and denominator before cancelling", "Only common factors (not terms) cancel", "Difference of two squares a² − b² = (a + b)(a − b)"],
    onFormulaSheet: [],
    keywords: ["simplify", "cancel", "factorise", "rational expression", "common factor"]
  },
  {
    slug: "algebraic-fractions-multiply-divide", title: "Multiplying and dividing algebraic fractions", unit: "FM1", area: "Algebraic fractions", strand: "Algebra",
    statementIds: ["FM1-ALF-01"],
    prerequisites: ["algebraic-fractions-simplify"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q9(b): majority knew to invert the right-hand fraction and factorise, but 4x² − 1 was commonly left unfactorised; weaker candidates expanded everything." },
      { series: "Summer 2023", note: "Q9: most replaced division by multiplication by the inverted fraction; cancellation of terms then caused problems." },
      { series: "Summer 2024", note: "Q8(a): incorrect cancelling of terms and incomplete simplification." }
    ],
    mustMemorise: ["To divide, invert the second fraction and multiply", "Factorise first, then cancel across the product"],
    onFormulaSheet: [],
    keywords: ["invert and multiply", "quotient", "product", "factorise"]
  },
  {
    slug: "algebraic-fractions-add-subtract", title: "Adding and subtracting algebraic fractions", unit: "FM1", area: "Algebraic fractions", strand: "Algebra",
    statementIds: ["FM1-ALF-01"],
    prerequisites: ["algebraic-fractions-simplify", "algebraic-fractions-multiply-divide"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q8: weak algebra most evident here; incorrect cancelling when adding the two fractions; more practice required." },
      { series: "Summer 2019", note: "Q12: errors gathering terms in the numerator; those who divided by 3 before factorising got x(x + 2) wrongly; 'candidates generally need more practice with algebraic expressions'." },
      { series: "Summer 2022", note: "Q9(a): many lost the final mark by failing to subtract all terms of the quadratic from the cubic; some divided the correct answer by 2." },
      { series: "Summer 2023", note: "Q9: took a common denominator but failed to recognise the numerator as a difference of two squares." },
      { series: "Summer 2024", note: "Q8(b): did not use (x + 3)(x − 3) as the lowest common denominator for x² − 9, producing cubics they could not handle; cancelling before adding." },
      { series: "Summer 2025", note: "Q7: very few full marks; x(x + 3) − (x − 3)(x + 4) mis-expanded to x² + 3x − x² + x + 12 (sign not applied across the bracket); dropped brackets; premature cancelling; stopping short of the final value 2." }
    ],
    mustMemorise: ["Lowest common denominator uses each factor once (factorise x² − 9 first)", "Put brackets round a subtracted numerator and change every sign", "Simplify the final numerator and cancel"],
    onFormulaSheet: [],
    keywords: ["common denominator", "LCD", "subtract", "brackets", "sign error"]
  },
  {
    slug: "expand-three-brackets", title: "Expanding three linear brackets", unit: "FM1", area: "Algebraic manipulation", strand: "Algebra",
    statementIds: ["FM1-ALM-01"],
    prerequisites: ["maths:expanding-double-brackets"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q12(i): well done, most expanded the brackets successfully." },
      { series: "Summer 2022", note: "Q9(a): most correctly expanded the cubic and quadratic expressions." },
      { series: "Summer 2023", note: "Q12(iii): answered well even by weaker candidates, though a few made mistakes by not using brackets around terms." }
    ],
    mustMemorise: ["Expand two brackets first, then multiply the quadratic by the third bracket term by term", "Collect like terms in descending powers"],
    onFormulaSheet: [],
    keywords: ["expand", "cubic", "triple brackets", "collect like terms"]
  },
  {
    slug: "completing-the-square", title: "Completing the square (coefficient of x² = 1)", unit: "FM1", area: "Completing the square", strand: "Algebra",
    statementIds: ["FM1-CSQ-01"],
    prerequisites: ["maths:completing-the-square", "maths:expanding-double-brackets"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(i): straightforward but more candidates than expected were unfamiliar with completing the square." },
      { series: "Summer 2024", note: "Q2: very well answered; notable errors were adding 49 instead of subtracting and writing 7 instead of −7." },
      { series: "Summer 2025", note: "Q3(i): most completed the square; common error writing (x + 3/2)² with the wrong constant term through poor arithmetic." }
    ],
    mustMemorise: ["x² + bx + c = (x + b/2)² − (b/2)² + c"],
    onFormulaSheet: [],
    keywords: ["completed square form", "(x + a)² + b", "half the coefficient"]
  },
  {
    slug: "completing-square-minimum-point", title: "Minimum point from the completed square", unit: "FM1", area: "Completing the square", strand: "Algebra",
    statementIds: ["FM1-CSQ-02"],
    prerequisites: ["completing-the-square", "maths:quadratic-graphs"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(ii): some could not interpret the minimum value and the corresponding x; some differentiated instead." },
      { series: "Summer 2023", note: "Q4(ii): many lost both marks by differentiating instead of using the completed square as required; others substituted x = 4 back into the original equation rather than reading y from the completed square." },
      { series: "Summer 2025", note: "Q3(ii): 'hence' required the Part (i) result; those who used calculus scored zero even when mathematically correct." }
    ],
    mustMemorise: ["(x + a)² + b has minimum value b at x = −a", "When the question says 'hence', the completed-square method is compulsory"],
    onFormulaSheet: [],
    keywords: ["minimum value", "turning point", "vertex", "hence"]
  },
  {
    slug: "completing-square-solve-surd", title: "Solving quadratics by completing the square (surd answers)", unit: "FM1", area: "Completing the square", strand: "Algebra",
    statementIds: ["FM1-CSQ-02"],
    prerequisites: ["completing-the-square", "maths:surds"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q8: completing the square was very well done as the equation to solve was given." },
      { series: "Summer 2022", note: "Q6(ii): generally well done with the method clearly shown; a small number used the quadratic formula instead of the required method." }
    ],
    mustMemorise: ["Answer form x = a ± √b or x = a ± c√b", "Simplify surds, e.g. √20 = 2√5", "Do not switch to the quadratic formula when completing the square is specified"],
    onFormulaSheet: ["Quadratic formula x = (−b ± √(b² − 4ac)) / 2a (Unit 1 formula sheet)"],
    keywords: ["surd form", "exact solutions", "square root both sides"]
  },
  {
    slug: "solve-three-simultaneous-equations", title: "Solving three linear equations in three unknowns", unit: "FM1", area: "Simultaneous equations", strand: "Algebra",
    statementIds: ["FM1-SIM-01"],
    prerequisites: ["maths:simultaneous-equations-linear"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q7: nearly all knew to eliminate variables and back-substitute; arithmetic errors the main cause of wrong answers." },
      { series: "Summer 2022", note: "Q11(iv): a lot of candidates, even weaker ones, obtained full marks." },
      { series: "Summer 2024", note: "Q11(iv): solved with few errors, but many forgot to multiply back by 1000; values 'worked out on a calculator with no method' gained no marks." },
      { series: "Summer 2025", note: "Q12(iii): arithmetic errors; calculator-only answers gained no marks; fractional answers lost the final mark." }
    ],
    mustMemorise: ["Eliminate one unknown from two pairs of equations, solve the resulting 2 × 2 system, then back-substitute", "Show every elimination step – sole use of a calculator gains no marks"],
    onFormulaSheet: [],
    keywords: ["elimination", "back substitution", "three unknowns", "3x3 system"]
  },
  {
    slug: "form-three-simultaneous-equations", title: "Forming three equations from a context and interpreting solutions", unit: "FM1", area: "Simultaneous equations", strand: "Algebra",
    statementIds: ["FM1-SIM-01"],
    prerequisites: ["solve-three-simultaneous-equations", "maths:percentages", "maths:forming-equations"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q10: forming the second equation was poorly done (x + y − z = 55 common); 'show that' steps set out poorly; candidates did not check that very large or negative values were meaningless." },
      { series: "Summer 2022", note: "Q11(ii)–(iii): many could not translate '£8 dearer' or '50% greater' into algebra; parts often omitted." },
      { series: "Summer 2023", note: "Q11(i)–(iii): often poorly answered; percentage signs confused candidates; working backwards from the given equations gains no marks." },
      { series: "Summer 2024", note: "Q11(i)–(iii): multiplying rather than dividing to reach the given equation; thousands on the right-hand side caused problems." },
      { series: "Summer 2025", note: "Q12(iv): currency conversion with a 40% decrease was 'the most poorly answered part of the entire paper'." }
    ],
    mustMemorise: ["Define the three unknowns with units before writing equations", "'a is 50% greater than b' → a = 1.5b; 'a is £8 dearer than b' → a = b + 8", "Scale answers back (e.g. × 1000) and sanity-check them in context"],
    onFormulaSheet: [],
    keywords: ["form equations", "worded problem", "interpret", "show that", "context"]
  },
  {
    slug: "quadratic-inequalities", title: "Solving quadratic inequalities", unit: "FM1", area: "Quadratic inequalities", strand: "Algebra",
    statementIds: ["FM1-QIN-01"],
    prerequisites: ["maths:solving-quadratics-factorising", "maths:linear-inequalities", "maths:quadratic-graphs"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q4: too many failed to bring the 5 across to make one side zero (loss of all marks); inequality sign mishandled after finding critical values −3 and 1.5." },
      { series: "Summer 2019", note: "Q6: most solved the quadratic; not all drew a sketch, which would help identify the correct region." },
      { series: "Summer 2022", note: "Q7: negative x² coefficient caused confusion; wrong graph drawn; shading the solution region on the sketch recommended." },
      { series: "Summer 2023", note: "Q5: most derived and solved the inequality but lost the final mark by not excluding negative x in the context." },
      { series: "Summer 2024", note: "Q3: inequality sign lost and treated as an equation; no sketch led to the wrong region." },
      { series: "Summer 2025", note: "Q4: more successful than previous years; errors were failing to interpret the critical values as a region (e.g. −5/2 < x < 6 vs x > 6 and x < −5/2)." }
    ],
    mustMemorise: ["Rearrange to (quadratic) > 0 or < 0 with zero on one side", "Factorise to find critical values, sketch, then read the region", "'Between the roots' for < 0 when the x² coefficient is positive; two outer regions for > 0"],
    onFormulaSheet: [],
    keywords: ["critical values", "region", "sketch", "shade", "greater than", "less than"]
  },
  {
    slug: "trig-graphs-sin-cos-tan", title: "Sketching the graphs of sin x, cos x and tan x", unit: "FM1", area: "Trigonometric equations", strand: "Trigonometry",
    statementIds: ["FM1-TRG-01"],
    prerequisites: ["maths:trigonometry-sohcahtoa", "maths:trig-graphs"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q3(a): sine graph drawn with sides too straight; many gained the mark for points only." },
      { series: "Summer 2019", note: "Q4(a): cosine curve too straight between max and min; axes should show −90°, 0°, 90°, 180°, 270°, 360° and ±1." },
      { series: "Summer 2022", note: "Q4(a): quite a few omitted scales on the axes and some inverted the sine graph." },
      { series: "Summer 2023", note: "Q3(a): no indication of turning points at ±180°; sketch looked like a straight line heading below −1; no y-scale." },
      { series: "Summer 2025", note: "Q2(a): tan graph 'particularly problematic' – asymptotes omitted or placed at 180°, curves touching/crossing asymptotes, sine-like shapes." }
    ],
    mustMemorise: ["Shapes, periods (360° for sin/cos, 180° for tan) and key values", "sin: (0,0),(90,1),(180,0),(270,−1); cos: (0,1),(90,0),(180,−1),(270,0)", "tan has vertical asymptotes at ±90°, ±270° and passes through 0°, ±180°, ±360°", "Label both axes with a scale"],
    onFormulaSheet: [],
    keywords: ["sine graph", "cosine graph", "tangent graph", "asymptote", "period", "amplitude", "sketch"]
  },
  {
    slug: "trig-equations", title: "Solving simple trigonometric equations in a given range", unit: "FM1", area: "Trigonometric equations", strand: "Trigonometry",
    statementIds: ["FM1-TRG-02"],
    prerequisites: ["trig-graphs-sin-cos-tan"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q3(b): common wrong answers 60° and 300°; difficulties using CAST with a negative value; poor rearranging to make x the subject." },
      { series: "Summer 2019", note: "Q4(b): a few used 0.184 instead of −0.184; follow-through produced a second answer outside the range." },
      { series: "Summer 2022", note: "Q4(b)(i): majority scored only one mark – found 53.13° but could not select the angles in the range; the sketch from part (a) gives a visual check." },
      { series: "Summer 2023", note: "Q3(b): some used cos⁻¹(2/3) with the wrong sign; dividing by 2 instead of multiplying when isolating x." },
      { series: "Summer 2024", note: "Q4: well answered; a common error was to multiply by 2 then add 20 in the wrong order." },
      { series: "Summer 2025", note: "Q2(b)(i): tan⁻¹(6) = 80.54° given alone without the second solution; adding/subtracting from 90° gave answers outside the range." }
    ],
    mustMemorise: ["Find the base angle, then use the graph/CAST to find the second solution (sin: 180° − α; cos: −α or 360° − α; tan: α + 180°)", "Solve for the bracket first, then undo the transformation in reverse order", "Reject solutions outside the given range"],
    onFormulaSheet: [],
    keywords: ["CAST", "base angle", "second solution", "range", "inverse trig"]
  },
  {
    slug: "differentiation-integer-powers", title: "Differentiating integer powers of x (first and second derivatives)", unit: "FM1", area: "Differentiation", strand: "Calculus",
    statementIds: ["FM1-DIF-01"],
    prerequisites: ["maths:laws-of-indices", "maths:negative-indices"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q1: well done; fraction and negative power handled well by the majority." },
      { series: "Summer 2019", note: "Q3(i): few problems, though answers such as 8/6 x should be simplified; Q11: some could not differentiate −3x⁻¹ and read the gradient as −3 from y = mx + c." },
      { series: "Summer 2024", note: "Q1(i): moving the index term to the top line and then differentiating it caused a lot of problems." },
      { series: "Summer 2025", note: "Q8(i): errors with the power rule (x⁻² instead of x⁻⁴) and constants (+12 instead of −12)." }
    ],
    mustMemorise: ["Rewrite a/xⁿ as ax⁻ⁿ before differentiating", "d/dx(axⁿ) = naxⁿ⁻¹; derivative of a constant is 0", "Second derivative d²y/dx² = differentiate again"],
    onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet)"],
    keywords: ["derivative", "dy/dx", "power rule", "negative index", "second derivative"]
  },
  {
    slug: "gradient-at-a-point", title: "Gradient of a curve at a point", unit: "FM1", area: "Differentiation", strand: "Calculus",
    statementIds: ["FM1-DIF-02"],
    prerequisites: ["differentiation-integer-powers"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q8(ii): surprisingly few could take the first step of writing the gradient of the tangent as −8." },
      { series: "Summer 2025", note: "Q13(i): many set dy/dx = 0 'out of habit' instead of dy/dx = 5 to find where the gradient is 5; Q8(ii): substituting y into an equation involving dy/dx was poorly answered." }
    ],
    mustMemorise: ["Gradient at x = a is dy/dx evaluated at x = a", "To find where the gradient has a given value, set dy/dx equal to that value (not zero)"],
    onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet)"],
    keywords: ["gradient function", "evaluate derivative", "rate of change"]
  },
  {
    slug: "tangents-and-normals", title: "Equations of tangents and normals", unit: "FM1", area: "Differentiation", strand: "Calculus",
    statementIds: ["FM1-DIF-02"],
    prerequisites: ["gradient-at-a-point", "maths:equation-of-a-line", "maths:perpendicular-lines"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q11: good discriminator; 'candidates need more practice in determining the equation of a normal'; credit given for knowing the normal gradient is the negative reciprocal." },
      { series: "Summer 2022", note: "Q8(ii): only the stronger candidates scored well." },
      { series: "Summer 2023", note: "Q10: advance information said 'normal', so answers were noticeably better; slips in the gradient at x = −1 and in the constant." },
      { series: "Summer 2024", note: "Q9: only a minority full marks; many set the line equal to the curve instead of differentiating; used the given gradient of 3 wrongly, so the normal gradient was wrong." },
      { series: "Summer 2025", note: "Q13(ii): perpendicular gradient −1/5 usually found, but some stopped there or wrote a line equation instead of the required coordinates." }
    ],
    mustMemorise: ["Tangent gradient m = dy/dx at the point; normal gradient = −1/m", "y − y₁ = m(x − x₁)", "A line with given gradient meets the curve where dy/dx equals that gradient"],
    onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet)"],
    keywords: ["tangent", "normal", "perpendicular", "negative reciprocal", "equation of line"]
  },
  {
    slug: "stationary-points-and-nature", title: "Stationary points and their nature", unit: "FM1", area: "Differentiation", strand: "Calculus",
    statementIds: ["FM1-DIF-02"],
    prerequisites: ["differentiation-integer-powers", "maths:solving-quadratics-factorising"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q8(ii): arithmetic slips finding the y-value at x = −5/9; two maxima or two minima should have signalled an error." },
      { series: "Summer 2022", note: "Q10(i): some wrote down first and second derivatives but did not know what to do with them." },
      { series: "Summer 2023", note: "Q12(iv)–(v): differentiate, set to zero, second derivative for nature – many full marks with follow-through; Q14(ii): many did not use the second derivative to show the maximum at t = 3." },
      { series: "Summer 2025", note: "Q11(ii): a few lost marks for not writing the turning point as a coordinate." }
    ],
    mustMemorise: ["Set dy/dx = 0 and solve", "d²y/dx² > 0 minimum, < 0 maximum", "Give turning points as coordinates (x, y)"],
    onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet)"],
    keywords: ["turning point", "maximum", "minimum", "second derivative test", "stationary"]
  },
  {
    slug: "curve-sketching-quadratic-cubic", title: "Sketching quadratic and cubic curves", unit: "FM1", area: "Differentiation", strand: "Calculus",
    statementIds: ["FM1-DIF-02"],
    prerequisites: ["stationary-points-and-nature", "maths:quadratic-graphs", "expand-three-brackets"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q9(i): disappointing to see differentiation used when asked for the intercepts; sketches must extend to all relevant regions." },
      { series: "Summer 2019", note: "Q8: standard and well done; a few lost a mark for not marking axis crossings and turning-point coordinates." },
      { series: "Summer 2022", note: "Q10(ii): maximum below the x-axis confused some; sketches inconsistent with the computed turning points." },
      { series: "Summer 2023", note: "Q12(i)–(ii): surprising number could not find where the curve met the axes; (0, 0) added as an extra intercept; (vi) impossible shapes such as a maximum below a minimum." },
      { series: "Summer 2024", note: "Q10(i): differentiating instead of finding intercepts led to a wrong cubic shape in (iii)." },
      { series: "Summer 2025", note: "Q11(v): most drew a U-shape but some drew cubics; key points (y-intercept, turning point) unlabelled." }
    ],
    mustMemorise: ["Intercepts: set x = 0 for the y-intercept, y = 0 (factorise) for x-intercepts", "Turning points from dy/dx = 0 and their nature", "Cubic with positive x³ coefficient rises to the right; label intercepts and turning points on the sketch"],
    onFormulaSheet: [],
    keywords: ["sketch", "intercepts", "cubic", "quadratic", "shape", "label"]
  },
  {
    slug: "optimisation", title: "Optimisation problems", unit: "FM1", area: "Differentiation", strand: "Calculus",
    statementIds: ["FM1-DIF-02"],
    prerequisites: ["stationary-points-and-nature", "maths:area-and-perimeter", "maths:rearranging-formulae"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q12: found demanding because it was 'a bit different'; when asked to 'show', all steps must be presented; Q7: only the extremely able could manipulate the derivative equation to the required cubic." },
      { series: "Summer 2019", note: "Q14: many did not attempt the final part, not realising calculus was needed; answers not simplified caused slips; a few forgot to show the area was a maximum." },
      { series: "Summer 2022", note: "Q13: not attempted by many; derivative of L wrong (the x term not differentiated to 1); −900/x² = 0 treated as x² = 900; gave 30 mm instead of substituting back for 60 mm." },
      { series: "Summer 2024", note: "Q13: good discriminator; weaker candidates could not prove parts (i)–(ii) or apply them, but most could differentiate the given expression." },
      { series: "Summer 2025", note: "Q14(iii): mishandling the negative power when differentiating; difficulty solving; most who found dy/dx also used d²y/dx² for the nature." }
    ],
    mustMemorise: ["Form the quantity to optimise as a function of one variable using the constraint", "Differentiate, set to zero, solve, then substitute back for the required quantity", "Verify max/min with the second derivative"],
    onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet)"],
    keywords: ["maximise", "minimise", "constraint", "show that", "modelling", "area", "perimeter"]
  },
  {
    slug: "integration-as-inverse", title: "Integration as the reverse of differentiation (indefinite integrals, finding a curve from its gradient)", unit: "FM1", area: "Integration", strand: "Calculus",
    statementIds: ["FM1-INT-01", "FM1-INT-02"],
    prerequisites: ["differentiation-integer-powers"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q3(ii): sign of the second term and omission of the constant of integration." },
      { series: "Summer 2022", note: "Q2: errors in the second term; some omitted + c." },
      { series: "Summer 2023", note: "Q2: not as well answered as expected; constant omitted or not evaluated; some wrongly used limits 2 and 7; some found the second derivative instead." },
      { series: "Summer 2024", note: "Q1(ii): a significant number did not know integration was needed to find y; c missing or wrong." },
      { series: "Summer 2025", note: "Q6: poorly answered – the word 'gradient' led candidates to differentiate; many tried y = mx + c; some used definite limits inappropriately; c left separate from the equation." }
    ],
    mustMemorise: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c (n ≠ −1)", "Given dy/dx and a point on the curve: integrate, then substitute the point to find c", "Remove the integral sign once integrated"],
    onFormulaSheet: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1 (Unit 1 formula sheet)"],
    keywords: ["integrate", "antiderivative", "constant of integration", "equation of curve", "gradient function"]
  },
  {
    slug: "definite-integrals", title: "Forming and evaluating definite integrals", unit: "FM1", area: "Integration", strand: "Calculus",
    statementIds: ["FM1-INT-03"],
    prerequisites: ["integration-as-inverse"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q2: integration weaker than differentiation; simplify terms before substituting (3x³/3 kept); poor notation, no brackets separating substitutions." },
      { series: "Summer 2019", note: "Q13(i): the constant k was wrongly integrated to k²/2 – 'the most difficult question on the whole paper'." }
    ],
    mustMemorise: ["[F(x)] from a to b = F(b) − F(a), with brackets round each substitution", "Treat unknown constants (k) as constants when integrating"],
    onFormulaSheet: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1 (Unit 1 formula sheet)"],
    keywords: ["limits", "evaluate", "F(b) − F(a)", "definite integral"]
  },
  {
    slug: "area-under-curve", title: "Area under a curve between two ordinates", unit: "FM1", area: "Integration", strand: "Calculus",
    statementIds: ["FM1-INT-04"],
    prerequisites: ["definite-integrals", "curve-sketching-quadratic-cubic"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q13: correct limits often known; (ii) area of B misread as 9/5 times area of A." },
      { series: "Summer 2022", note: "Q10(iii): most integrated with the correct limits and dealt with the negative area correctly." },
      { series: "Summer 2025", note: "Q11(vi): incorrect limits, forgetting to integrate, or leaving a negative area lost the last mark." }
    ],
    mustMemorise: ["Area = ∫ from a to b of y dx between the curve, the x-axis and x = a, x = b", "An area below the axis gives a negative integral – state the positive area", "Mixed positive/negative regions are not examined"],
    onFormulaSheet: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1 (Unit 1 formula sheet)"],
    keywords: ["area", "ordinates", "region", "x-axis", "negative area"]
  },
  {
    slug: "logarithms-from-indices", title: "Logarithms as the inverse of indices", unit: "FM1", area: "Logarithms", strand: "Logarithms",
    statementIds: ["FM1-LOG-01"],
    prerequisites: ["maths:laws-of-indices"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q9(b)(i): hardly anyone simply used indices; most reached log 4 + x log 2 = y log 2 and stopped." }
    ],
    mustMemorise: ["aˣ = n ⇔ x = logₐ n (e.g. 8 = 2³ ⇔ log₂ 8 = 3)", "logₐ a = 1, logₐ 1 = 0", "Change of base is not required"],
    onFormulaSheet: ["If aˣ = n then x = logₐ n (Unit 1 formula sheet)"],
    keywords: ["log", "index form", "base", "evaluate logs"]
  },
  {
    slug: "laws-of-logarithms", title: "Laws of logarithms: simplifying and combining expressions", unit: "FM1", area: "Logarithms", strand: "Logarithms",
    statementIds: ["FM1-LOG-02"],
    prerequisites: ["logarithms-from-indices"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q9(a): not a standard question; most gave 3 log x / 2 log y; very few reached y = x^(3/2)." },
      { series: "Summer 2022", note: "Q5(a): 'one of the most challenging questions on the paper' – could not separate a product into a sum of logs." },
      { series: "Summer 2023", note: "Q7(a): good discriminator, only the best scored any marks; unsure how to get 10.5 from 2, 3 and 7." },
      { series: "Summer 2024", note: "Q6(a): most lost the final mark by forgetting to cube the 2 in (2x)³." },
      { series: "Summer 2025", note: "Q9(a): only a few reached the final answer – mishandled constants and roots, put c in the denominator instead of the numerator, misapplied the subtraction rule." }
    ],
    mustMemorise: ["log a + log b = log ab", "log a − log b = log(a/b)", "n log a = log aⁿ (apply the power to the whole term, e.g. (2x)³ = 8x³)", "Write a numerical constant as a log of the same base before combining (e.g. 1 = log 10)"],
    onFormulaSheet: [],
    keywords: ["log laws", "product rule", "quotient rule", "power rule", "single logarithm", "simplify"]
  },
  {
    slug: "log-log-graphs", title: "Log/log graphs: finding k and n in y = kxⁿ", unit: "FM1", area: "Logarithms", strand: "Logarithms",
    statementIds: ["FM1-LOG-02"],
    prerequisites: ["laws-of-logarithms", "maths:straight-line-graphs", "maths:gradient-of-a-line"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q11: inappropriate scales; k found from the gradient but many gave log A instead of A; log values wrongly substituted into the exponential equation." },
      { series: "Summer 2019", note: "Q10: log r put on the wrong axis; points should be circled; a found as log a; answers not checked against the data range." },
      { series: "Summer 2022", note: "Q12: marks lost for log values not to 3 d.p., wrong plotting, unlabelled axes, inverting the gradient, leaving log a." },
      { series: "Summer 2023", note: "Q13: same recurring slips; a result outside the given data range should signal an error." },
      { series: "Summer 2024", note: "Q12: well done; inverting the gradient; using the log equation to find k; rounding a context answer down instead of up." },
      { series: "Summer 2025", note: "Q10: strong across the board; rounding to 2 d.p. instead of 3; axes unlabelled; k and v swapped." }
    ],
    mustMemorise: ["y = kxⁿ ⇒ log y = n log x + log k: gradient n, intercept log k", "Table values to 3 decimal places; label axes log x and log y; circle plotted points", "k = 10^(intercept), not the intercept itself; check predictions lie within the data range"],
    onFormulaSheet: ["If aˣ = n then x = logₐ n (Unit 1 formula sheet)"],
    keywords: ["log-log graph", "straight line", "gradient", "intercept", "power law", "y = kx^n"]
  },
  {
    slug: "indicial-equations", title: "Solving indicial (exponential) equations with logarithms", unit: "FM1", area: "Logarithms", strand: "Logarithms",
    statementIds: ["FM1-LOG-03"],
    prerequisites: ["laws-of-logarithms"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q6: standard and mostly successful; brackets omitted (2x − 1 log 3); leaving calculator work to the last step was more reliable." },
      { series: "Summer 2022", note: "Q5(b): very well answered; errors moving all x terms to one side." },
      { series: "Summer 2023", note: "Q7(b): answered well; errors in rearranging." },
      { series: "Summer 2025", note: "Q9(b): very well answered with clear working." }
    ],
    mustMemorise: ["Take logs of both sides, bring powers down with brackets: (2x − 1) log 3 = (1 + x) log 5", "Expand, collect x terms on one side, factorise x, divide", "Keep the calculator until the final step; answer to 2 d.p."],
    onFormulaSheet: ["If aˣ = n then x = logₐ n (Unit 1 formula sheet)"],
    keywords: ["exponential equation", "take logs", "unknown in the power", "brackets"]
  },
  {
    slug: "matrix-arithmetic", title: "Adding, subtracting and multiplying matrices", unit: "FM1", area: "Matrices", strand: "Matrices",
    statementIds: ["FM1-MAT-01"],
    prerequisites: [],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q1: a number wrote A² as the square of each element." },
      { series: "Summer 2022", note: "Q3(a)(ii): multiplication of non-2×2 matrices – full marks given to all after a CCEA webinar had wrongly implied a 2 × 2 limit; the spec allows up to 3 rows or 3 columns (not 3 × 3)." },
      { series: "Summer 2023", note: "Q8: a surprising number did not get a 2 × 2 result; some squared each element for C²; some subtracted matrices of different sizes." },
      { series: "Summer 2024", note: "Q7(a)(ii): squaring each element instead of multiplying." },
      { series: "Summer 2025", note: "Q1: a few squared the matrix instead of scalar-multiplying; 2 × 2 by 2 × 3 product generally well done." }
    ],
    mustMemorise: ["Add/subtract element-wise (same dimensions only)", "Row × column rule; (m × n)(n × p) gives m × p", "A² = A × A, not element-wise squaring; AB ≠ BA in general"],
    onFormulaSheet: [],
    keywords: ["matrix", "dimensions", "product", "scalar multiple", "row by column"]
  },
  {
    slug: "matrix-inverse-2x2", title: "Determinant and inverse of a 2 × 2 matrix", unit: "FM1", area: "Matrices", strand: "Matrices",
    statementIds: ["FM1-MAT-02"],
    prerequisites: ["matrix-arithmetic"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q5: a few arithmetic slips calculating the determinant." },
      { series: "Summer 2023", note: "Q6(ii): most knew the equation could not be solved because det B = 0, but the wording was often unclear about which matrix had no inverse." },
      { series: "Summer 2025", note: "Q5(i): very well answered; a few wrote 1/26 instead of 1/(−26)." }
    ],
    mustMemorise: ["det [[a, b],[c, d]] = ad − bc", "Inverse = (1/(ad − bc)) [[d, −b],[−c, a]]", "det = 0 ⇒ singular, no inverse (the inverse formula is not on the formula sheet)"],
    onFormulaSheet: [],
    keywords: ["determinant", "inverse", "singular", "adjugate", "swap and negate"]
  },
  {
    slug: "matrix-equations", title: "Solving matrix equations (A ± X = B, AX = B)", unit: "FM1", area: "Matrices", strand: "Matrices",
    statementIds: ["FM1-MAT-03"],
    prerequisites: ["matrix-inverse-2x2"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2018", note: "Q5: really well done; the inverse was recognised as central; occasionally multiplied in the wrong order." },
      { series: "Summer 2019", note: "Q5: most found P⁻¹ and formed P⁻¹Q in the correct order." },
      { series: "Summer 2022", note: "Q3(b): very few multiplied L⁻¹ and M in the wrong order; slips in the determinant." },
      { series: "Summer 2024", note: "Q7(b): tricky for some who had never met a matrix question of this type; generous follow-through." }
    ],
    mustMemorise: ["AX = B ⇒ X = A⁻¹B (pre-multiply both sides by A⁻¹, keep the order)", "A + X = B ⇒ X = B − A", "XA = B is not examined"],
    onFormulaSheet: [],
    keywords: ["pre-multiply", "order of multiplication", "unknown matrix"]
  },
  {
    slug: "matrix-simultaneous-equations", title: "Solving 2 × 2 simultaneous equations with matrices", unit: "FM1", area: "Matrices", strand: "Matrices",
    statementIds: ["FM1-MAT-04"],
    prerequisites: ["matrix-inverse-2x2", "maths:simultaneous-equations-linear"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2025", note: "Q5(ii): despite 'use the matrix method', many used substitution/elimination and received no marks; even matrix attempts struggled with layout; the type had not appeared recently." }
    ],
    mustMemorise: ["Write the system as [[a, b],[c, d]] [x; y] = [e; f]", "Solve with [x; y] = A⁻¹ [e; f]; show the inverse and the product", "When told to use matrices, an algebraic solution scores zero"],
    onFormulaSheet: [],
    keywords: ["matrix method", "coefficient matrix", "column vector", "simultaneous"]
  }
];
