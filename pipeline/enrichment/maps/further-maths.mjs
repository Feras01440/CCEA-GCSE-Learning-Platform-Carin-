/**
 * Further Mathematics crosswalk map — CCEA GCSE Further Mathematics (2017) FM1, FM2 and FM3
 * against the three nearest comparison qualifications.
 *
 * FM4 (Discrete and Decision) is deliberately absent: the platform does not author it, and
 * build-crosswalk.mjs treats an FM4 row as an error.
 *
 * Row shape:
 *   slug | aqaRefs (8365) | ocrRefs (6993) | edexcelRefs (4PM1) | levelOnOtherQualifications
 *        | status | confidence | beyondCcea | cceaOnly | note
 *
 * THE THREE COMPARISON QUALIFICATIONS SIT AT THREE DIFFERENT LEVELS, so the level matters
 * more here than the reference code does. Read levelOnOtherQualifications before judging
 * whether a resource is pitched correctly.
 *   AQA 8365   Level 2 Certificate in Further Mathematics. Closest in level and intent.
 *              Sections 1 Number, 2 Algebra, 3 Coordinate Geometry, 4 Calculus,
 *              5 Matrix Transformations, 6 Geometry. Referenced as "2.12", "4.3".
 *              CARRIES NO LOGARITHMS, NO INTEGRATION AND NO STATISTICS AT ALL, and its
 *              matrices are transformation matrices only (multiplication, identity,
 *              combinations) with no determinant, inverse or matrix equations.
 *   OCR 6993   FSMQ Additional Mathematics, LEVEL 3, so its treatment is pitched a year
 *              above CCEA and must be cut down rather than imported. Seven sections:
 *              Algebra, Enumeration, Coordinate Geometry, Pythagoras and Trigonometry,
 *              Calculus, Numerical Methods, Exponentials and Logarithms. Referenced here by
 *              SECTION NAME, not statement code: the specification's content tables are
 *              images that neither pdftotext nor pdfjs can linearise, so statement-level
 *              codes could not be read. Confidence is 'medium' wherever that matters.
 *              Carries no matrices and no statistics beyond Enumeration (binomial,
 *              permutations and combinations); its mechanics is kinematics via calculus only.
 *   4PM1       Edexcel International GCSE Further Pure Mathematics, Level 2 but wider and
 *              deeper than CCEA. Sections 1 Logarithmic functions and indices, 2 The
 *              quadratic function, 3 Identities and inequalities, 4 Graphs, 5 Series,
 *              6 The binomial series, 7 Scalar and vector quantities, 8 Rectangular
 *              Cartesian coordinates, 9 Calculus, 10 Trigonometry. Referenced as section
 *              number + letter, e.g. "1B", "9D". The specification states in terms that
 *              "knowledge of statistics and matrices will not be required", so every FM3
 *              row and every FM1 matrix row is unmatched against it.
 *
 * FM2 IS MECHANICS, which no Level 2 qualification carries. Those rows are referenced
 * against the DfE A level mathematics subject content, whose mechanics sections are
 *   P Quantities and units in mechanics · Q Kinematics · R Forces and Newton's laws · S Moments
 * (section H in that document is Integration, not mechanics). Material found under P-S is
 * A level and assumes calculus, vectors in two dimensions and variable acceleration; CCEA
 * FM2 uses constant acceleration, i and j vectors and a horizontal uniform rod only. Cut it
 * down; never import it whole. OCR 6993's Calculus (Application) section reaches kinematics
 * at Level 3 and is the only comparison qualification with any mechanics at all.
 */
export const FURTHER_MATHS = [
// ================================ FM1 (29) ================================
// --- Algebraic fractions ---
["algebraic-fractions-simplify","2.8;2.9","Algebra","2A","AQA L2 · OCR L3 · Edexcel L2-IGCSE (partial)","matched","high",
 "AQA 2.11 adds the factor theorem and cubic numerators, which CCEA does not require","",
 "AQA 2.9 'Manipulation of rational expressions' is the exact match. 4PM1 has no dedicated rational-expression point; its section 2A (manipulation of quadratic expressions) is the nearest."],
["algebraic-fractions-multiply-divide","2.9","Algebra","2A","AQA L2 · OCR L3","matched","high","","",
 "Same AQA statement as the other two algebraic-fraction topics; CCEA splits one statement (FM1-ALF-01) into three teaching topics."],
["algebraic-fractions-add-subtract","2.9","Algebra","2A","AQA L2 · OCR L3","matched","high",
 "AQA's examples include three-term denominators beyond CCEA's linear and quadratic restriction","",""],
// --- Algebraic manipulation ---
["expand-three-brackets","2.6;2.7","Algebra","2A;6A","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "AQA 2.7 generalises to (a + b)^n for positive integer n, and 4PM1 section 6 is the full binomial series; CCEA stops at three linear brackets","",""],
// --- Completing the square ---
["completing-the-square","2.12","Algebra","2B","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "AQA and 4PM1 both allow a leading coefficient other than 1; CCEA restricts the coefficient of x-squared to 1","",
 "The coefficient restriction is the single most important scope note on this topic: almost every borrowed worked example will have a non-unit coefficient."],
["completing-square-minimum-point","2.12;2.13","Calculus","2B;4A","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","","",
 "AQA reaches the turning point through completing the square (2.12) and through calculus (4.7); CCEA examines both routes in FM1 too."],
["completing-square-solve-surd","2.12;2.14","Algebra","2B;1C","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","","",
 "Surd-form answers connect to AQA 1.3 and 4PM1 1C (manipulation of surds)."],
// --- Simultaneous equations ---
["solve-three-simultaneous-equations","2.16","Algebra","3A","AQA L2 · OCR L3","matched","high","","",
 "AQA 2.16 'Algebraic solution of linear equations in three unknowns' is an exact match and its worked example is the same shape as CCEA's."],
["form-three-simultaneous-equations","2.16","Algebra","3A","AQA L2 · OCR L3","partial","medium","",
 "Forming the three equations from a worded context, and interpreting the solution in that context, is a CCEA emphasis; AQA 2.16 examines the solving only",""],
// --- Quadratic inequalities ---
["quadratic-inequalities","2.17","Algebra","3B","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "AQA and 4PM1 both set inequalities that do not factorise; CCEA restricts to quadratics that factorise","",""],
// --- Trigonometric equations ---
["trig-graphs-sin-cos-tan","6.6;6.7","Pythagoras and Trigonometry","10B","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "Radian measure (4PM1 10A), the addition formulae (10G) and transformations of trigonometric graphs","",
 "AQA 6.6 covers the same three graphs over the same kind of range."],
["trig-equations","6.10","Pythagoras and Trigonometry","10B;10E","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "AQA 6.9 and 4PM1 10E/10F add the identities sin^2 + cos^2 = 1 and tan = sin/cos as solving tools; CCEA restricts to simple equations with at most two solutions","",""],
// --- Differentiation ---
["differentiation-integer-powers","4.1;4.2;4.3","Calculus","9A","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "4PM1 9A adds sin ax, cos ax and e^ax; 4PM1 9B adds the product, quotient and chain rules. CCEA restricts to integer powers of x","",
 "AQA 4.3 'Differentiation of kx^n where n is an integer' is the exact match."],
["gradient-at-a-point","4.1;4.2","Calculus","9A","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","","",""],
["tangents-and-normals","4.4","Calculus","9F","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","","",
 "AQA 4.4 and 4PM1 9F are both 'the equation of a tangent and normal at any point', an exact match."],
["stationary-points-and-nature","4.5;4.6;4.7","Calculus","9D;9E","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","",
 "CCEA allows the second derivative to determine nature; AQA 4.7 determines it either by increasing/decreasing functions or by the second derivative, so its material covers both routes",""],
["curve-sketching-quadratic-cubic","4.9;2.13","Calculus","4A","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","","",
 "AQA 4.9 'Sketch/interpret a curve with known maxima and minima' is the match; AQA 2.13 covers drawing and sketching functions generally."],
["optimisation","4.8","Calculus","9E","AQA L2 · OCR L3 · Edexcel L2-IGCSE","matched","high","","",
 "AQA 4.8 'Using calculus to find maxima and minima in practical problems' is an exact match, and OCR's Calculus (Application) section is the richest source of contexts."],
// --- Integration ---
["integration-as-inverse","","Calculus","9A","OCR L3 · Edexcel L2-IGCSE","partial","high",
 "OCR and 4PM1 both integrate sin ax, cos ax and e^ax; CCEA restricts to integer powers of x with x not equal to -1",
 "AQA 8365 carries NO integration at all: its calculus section (4.1-4.9) is differentiation only. Zero hits for 'integrat' in the specification",
 "So the closest Level 2 comparison has nothing here; OCR 6993 (Level 3) and 4PM1 are the only sources, and both are pitched above CCEA."],
["definite-integrals","","Calculus","9A;9C","OCR L3 · Edexcel L2-IGCSE","partial","high",
 "4PM1 9C extends to volumes of revolution, which is well beyond CCEA",
 "Not in AQA 8365 (no integration)",""],
["area-under-curve","","Calculus","9C","OCR L3 · Edexcel L2-IGCSE","partial","high",
 "4PM1 9C covers areas AND volumes of revolution; volumes are beyond CCEA",
 "Not in AQA 8365 (no integration)",
 "OCR 6993's Calculus section carries area under a curve at Level 3 and is the best source of worked contexts; 4PM1 9C is the closest Level 2 statement."],
// --- Logarithms ---
["logarithms-from-indices","","Exponentials and Logarithms","1A;1B","OCR L3 · Edexcel L2-IGCSE","partial","high",
 "4PM1 1A also requires the shape of the graphs of a^x and log_b x","AQA 8365 carries NO logarithms at all: zero hits in the specification",
 "The two available sources are both richer than CCEA: OCR 6993 is Level 3 and 4PM1 adds change of base."],
["laws-of-logarithms","","Exponentials and Logarithms","1B","OCR L3 · Edexcel L2-IGCSE","partial","high",
 "Change of base (4PM1 1B lists log_a x = log_b x / log_b a and log_a b = 1 / log_b a) is beyond CCEA",
 "Not in AQA 8365",
 "4PM1 1B lists the three laws CCEA needs plus change of base; take the three, mark change of base notonspec."],
["log-log-graphs","","","","none","ccea-only","high","",
 "Log/log graphs used to find k and n in y = kx^n appear in no AQA 8365, OCR 6993 or 4PM1 statement. The technique is A level (linearising a power law) and is a CCEA-specific application of the log laws",
 "Expect no ready-made resource at this level. The transferable material is the A level 'reduction to linear form' treatment, which must be cut down to CCEA's two cases."],
["indicial-equations","","Exponentials and Logarithms","1B","OCR L3 · Edexcel L2-IGCSE","matched","high","",
 "Not in AQA 8365",
 "4PM1 1B names 'the solution of equations of the form a^x = b' explicitly, and OCR 6993's own worked example in its command-word section is exactly this kind of equation."],
// --- Matrices ---
["matrix-arithmetic","5.1;5.2","","","AQA L2 (partial)","partial","high",
 "AQA 5.3 and 5.4 are transformations of the unit square and combinations of transformations, which CCEA does not examine in FM1",
 "Matrix ADDITION and SUBTRACTION are not in AQA 8365: its 5.1 is multiplication only, restricted to 2x2 and 2x1. Neither OCR 6993 nor 4PM1 carries matrices at all (4PM1 states that 'knowledge of statistics and matrices will not be required')",
 "So only half of this topic has any comparison statement anywhere."],
["matrix-inverse-2x2","","","","none","ccea-only","high","",
 "The determinant and inverse of a 2x2 matrix appear in no AQA 8365, OCR 6993 or 4PM1 statement. AQA's matrix section stops at multiplication, the identity and transformations",
 "The transferable material is A level Further Mathematics, which is pitched well above CCEA; prefer building our own."],
["matrix-equations","","","","none","ccea-only","high","",
 "Solving matrix equations of the form A +/- X = B and AX = B appears in no comparison specification",""],
["matrix-simultaneous-equations","","","","none","ccea-only","high","",
 "Using matrices to solve 2x2 simultaneous equations appears in no comparison specification",
 "4PM1 3A solves simultaneous equations algebraically, but never by matrix methods."],
// ================================ FM2 (16) ================================
// Mechanics: referenced against DfE A level mathematics content sections P, Q, R, S.
["displacement-time-graphs","","Calculus","9C","DfE A level Q (Kinematics) · OCR L3","partial","high",
 "A level treatment uses calculus for variable acceleration; CCEA FM2 uses graphs and constant acceleration only",
 "No Level 2 qualification carries mechanics",
 "Referenced against DfE A level mathematics subject content section Q Kinematics. Note that section H in that document is Integration, not mechanics."],
["average-speed-and-velocity","","Calculus","","DfE A level Q (Kinematics) · OCR L3","partial","high","",
 "No Level 2 qualification carries mechanics",
 "DfE A level section Q. The distinction between average speed and average velocity is a CCEA emphasis that A level assumes."],
["velocity-time-graphs","","Calculus","9C","DfE A level Q (Kinematics) · OCR L3","partial","high",
 "Area under a velocity/time graph by integration for variable acceleration",
 "No Level 2 qualification carries mechanics",
 "DfE A level section Q. CCEA's two-journey problems are a CCEA question shape."],
["constant-acceleration-formulae","","Calculus","","DfE A level Q (Kinematics) · OCR L3","matched","high",
 "Motion in two dimensions with vectors; variable acceleration via calculus",
 "No Level 2 qualification carries mechanics",
 "DfE A level section Q lists the constant-acceleration formulae CCEA uses; OCR 6993's Calculus (Application) reaches kinematics at Level 3."],
["vertical-motion-under-gravity","","Calculus","","DfE A level Q (Kinematics) · OCR L3","matched","high",
 "Projectiles in two dimensions",
 "No Level 2 qualification carries mechanics",
 "DfE A level section Q. CCEA restricts to vertical motion; every A level resource moves quickly to projectiles."],
["vector-and-scalar-quantities","","","7A","Edexcel L2-IGCSE · DfE A level P","matched","high","",
 "",
 "4PM1 section 7 'Scalar and vector quantities' is a genuine Level 2 match; DfE A level section P covers quantities and units in mechanics."],
["vector-magnitude-and-direction","","","7A;7B","Edexcel L2-IGCSE · DfE A level P","matched","high","","",
 "4PM1 section 7 is the only Level 2 comparison statement for vectors in this cluster."],
["ij-vector-calculations","","","7A;7B","Edexcel L2-IGCSE · DfE A level P","matched","high",
 "Vector geometry proofs and position vectors in 4PM1 section 7 go beyond CCEA's i and j calculations","",""],
["force-diagrams","","","","DfE A level R (Forces and Newton's laws)","partial","high",
 "A level adds friction, coefficient of friction and forces in two dimensions throughout",
 "No Level 2 qualification carries forces",
 "DfE A level section R. CCEA FM2 examines identifying and labelling all forces on a body; the A level treatment assumes that skill rather than teaching it."],
["resolving-forces","","","7B","DfE A level R · Edexcel L2-IGCSE (vectors only)","partial","high",
 "A level resolves in any direction and combines with friction",
 "No Level 2 qualification carries forces; 4PM1 7B gives only the vector-resolution mathematics without the mechanics context",
 "DfE A level section R."],
["resultant-of-forces","","","7B","DfE A level R · Edexcel L2-IGCSE (vectors only)","partial","high","",
 "No Level 2 qualification carries forces",
 "DfE A level section R. The vector arithmetic is 4PM1 7B; the mechanics framing is A level."],
["equilibrium-of-forces","","","","DfE A level R (Forces and Newton's laws)","partial","high",
 "A level adds friction on an inclined plane and limiting equilibrium",
 "No Level 2 qualification carries forces",
 "DfE A level section R. CCEA includes inclined planes but without friction."],
["newtons-second-law-linear","","","","DfE A level R (Forces and Newton's laws)","partial","high",
 "Variable force and momentum/impulse",
 "No Level 2 qualification carries Newton's laws as mechanics",
 "DfE A level section R."],
["newtons-second-law-inclined-plane","","","","DfE A level R (Forces and Newton's laws)","partial","high",
 "Friction on the plane, which CCEA excludes",
 "No Level 2 qualification carries this",
 "DfE A level section R. Nearly every A level worked example includes friction, so examples must be re-chosen, not adapted."],
["connected-particles-and-pulleys","","","","DfE A level R (Forces and Newton's laws)","partial","high",
 "Friction, and systems of more than two particles",
 "The force on the pulley (the resultant of the two tensions) is a CCEA emphasis that A level treats only in passing",
 "DfE A level section R."],
["moments-uniform-rod","","","","DfE A level S (Moments)","partial","high",
 "A level covers non-uniform rods, several supports and moments about any point in two dimensions",
 "No Level 2 qualification carries moments",
 "DfE A level section S. CCEA restricts to a horizontal uniform rod."],
// ================================ FM3 (16) ================================
// Statistics: absent from AQA 8365 and from 4PM1 (which states that statistics will not be
// required). OCR 6993 carries only Enumeration (binomial, permutations, combinations).
["mean-and-standard-deviation","","","","none at Level 2; DfE A level L (Data presentation and interpretation)","ccea-only","high","",
 "Standard deviation appears in no AQA 8365, OCR 6993 or 4PM1 statement. The nearest published treatment is GCSE Statistics (a separate qualification) and A level section L",
 "GCSE Statistics (AQA 8382 / Edexcel 1ST0) is the resource-rich comparison for the whole of FM3, not the further-maths qualifications."],
["mean-sd-grouped-data","","","","none at Level 2","ccea-only","high","",
 "As above; estimating from grouped data is GCSE Statistics and A level content",""],
["combined-sets-mean-sd","","","","none at Level 2","ccea-only","high","",
 "Pooled mean and standard deviation appear in no comparison specification and are not in GCSE Statistics either; this is a genuine CCEA speciality",""],
["adjusted-data-mean-sd","","","","none at Level 2","ccea-only","high","",
 "Recalculating mean and standard deviation when items are added or removed appears in no comparison specification",""],
["linear-transformation-mean-sd","","","","none at Level 2; DfE A level L","ccea-only","high","",
 "The effect of a linear transformation on mean and standard deviation is A level content and appears in no Level 2 further-maths qualification",""],
["addition-rule-probability","","","","none at Level 2; DfE A level M (Probability)","ccea-only","medium","",
 "Probability appears in no AQA 8365 or 4PM1 statement; OCR 6993's Enumeration section is combinatorics, not probability laws",
 "GCSE Mathematics P4 covers mutually exclusive events; the non-mutually-exclusive addition rule is beyond GCSE and is the CCEA step up."],
["venn-diagrams-probability","","","","none at Level 2; DfE A level M","ccea-only","medium","",
 "Venn diagrams with unknowns are beyond GCSE Mathematics P6 and appear in no further-maths comparison specification",""],
["tree-diagrams-probability","","","","none at Level 2; DfE A level M","ccea-only","medium","",
 "GCSE Mathematics P8 covers tree diagrams with and without replacement; no further-maths comparison qualification carries them",
 "For this topic the right comparison is GCSE Mathematics (our own maths crosswalk rows for tree diagrams), not a further-maths qualification."],
["conditional-probability","","","","none at Level 2; DfE A level M","ccea-only","medium","",
 "GCSE Mathematics P9 covers conditional probability at Higher tier; no further-maths comparison qualification carries it",""],
["pascals-triangle-binomial-expansion","2.7","Enumeration","6A;6B","AQA L2 (8365 2.7) · OCR L3 · Edexcel L2-IGCSE","matched","high",
 "4PM1 section 6 is the full binomial series including fractional and negative indices; OCR Enumeration adds permutations and combinations. CCEA restricts to Pascal's triangle for n up to 8",
 "",
 "This is the one FM3 topic with a good comparison: OCR 6993's Enumeration section and 4PM1 section 6 are both rich, and AQA 8365 2.7 (expand (a + b)^n) is a Level 2 partial match."],
["binomial-probabilities","8382:E10b","Enumeration","","AQA GCSE Statistics L2 (interpretation only) · OCR L3","partial","high",
 "OCR's Enumeration section reaches the binomial distribution at Level 3, with permutations and combinations CCEA does not require",
 "Not in AQA 8365 or 4PM1. AQA GCSE Statistics 8382 E10b (Higher) carries the binomial distribution but only to 'know and interpret the characteristics', with n no greater than 5, no X ~ B(n, p) notation and NO probability calculations. CCEA demands the full derivation from Pascal's triangle up to n = 8 and real numerical answers, so CCEA is substantially the more demanding of the two",
 "AQA GCSE Statistics 8382 is the closest Level 2 comparison for the whole of FM3 and is resource-rich, but on this topic it stops short of calculation."],
["normal-distribution-bell-curve","8382:E11a;8382:E11b","","","AQA GCSE Statistics L2 (Higher) · DfE A level N","matched","high","",
 "Not in AQA 8365, OCR 6993 or 4PM1",
 "AQA GCSE Statistics 8382 E11a ('know and interpret the characteristics of a Normal distribution', notes: the symmetric bell-shape nature) and E11b (68% within one standard deviation, 95% within two, more than three very unusual) together match CCEA FM3-NOR-01 almost exactly, including the percentages in CCEA's mustMemorise. Both are Higher tier on 8382. This row was previously recorded as ccea-only and is corrected."],
["normal-distribution-z-probabilities","8382:E11d","","","AQA GCSE Statistics L2 (standardising only) · DfE A level N","partial","high",
 "A level section N adds the inverse normal, P(a < Z < b), and hypothesis testing; CCEA examines single tails only and never a z-value from a probability",
 "Reading a probability from a normal table appears in NO Level 2 qualification. AQA GCSE Statistics 8382 E11d standardises data with given means and standard deviations to compare two samples, and its notes say the formulae will be given in the question, where CCEA requires z = (x - mu)/sigma to be memorised; 8382 states in terms that 'other than the results in E11b, no calculations for values or normal probabilities are expected'",
 "So 8382 supplies the standardising idea and nothing else; the table-reading half is CCEA-only at Level 2."],
["conditional-probability-with-distributions","","","","none at Level 2","ccea-only","high","",
 "Combining conditional probability with the binomial and normal distributions is a CCEA synoptic demand with no comparison statement anywhere",""],
["spearmans-rank-correlation","","","","none at Level 2","ccea-only","high","",
 "Spearman's rank correlation coefficient appears in no AQA 8365, OCR 6993 or 4PM1 statement",
 "GCSE Statistics (AQA 8382) does carry Spearman's rank and is the one resource-rich comparison for this topic."],
["line-of-best-fit","","","","none at Level 2; GCSE Mathematics S6","partial","high",
 "Least-squares regression is A level; CCEA draws the line by eye through the mean point",
 "Drawing the line through (x-bar, y-bar) and then calculating its equation is a CCEA method that GCSE Mathematics S6 does not require",
 "GCSE Mathematics S6 (scatter graphs and lines of best fit) is the nearest match and is in our own maths crosswalk."],
];
