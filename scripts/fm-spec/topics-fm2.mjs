// Teachable topics for Unit 2: Mechanics. Evidence from the Chief Examiner's Reports 2019, 2022, 2023, 2024, 2025.

export const topicsFM2 = [
  {
    slug: "displacement-time-graphs", title: "Displacement/time graphs", unit: "FM2", area: "Kinematics", strand: "Kinematics",
    statementIds: ["FM2-KIN-01"],
    prerequisites: ["maths:distance-time-graphs", "maths:speed-distance-time"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2024", note: "Q1: candidates 'seemed thrown by a displacement time graph'; weaker candidates could not draw it, carried it down to the axis, added extra parts or went to 80 on the vertical axis." }
    ],
    mustMemorise: ["Gradient of an s/t graph = velocity; horizontal section = at rest", "Negative displacement is allowed (position on the other side of the origin)", "Return to the start line means displacement 0, not distance 0"],
    onFormulaSheet: [],
    keywords: ["displacement", "position", "gradient", "velocity", "graph"]
  },
  {
    slug: "average-speed-and-velocity", title: "Average speed and average velocity", unit: "FM2", area: "Kinematics", strand: "Kinematics",
    statementIds: ["FM2-KIN-01"],
    prerequisites: ["displacement-time-graphs"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(ii): finding the velocity was fine but only stronger candidates found the speed; many tried speed = distance/time with wrong magnitudes." },
      { series: "Summer 2024", note: "Q1(ii): 'surprisingly poorly answered' despite being a GCSE Mathematics average-speed question; only stronger candidates used total distance ÷ total time." }
    ],
    mustMemorise: ["Average speed = total distance ÷ total time", "Average velocity = total displacement ÷ total time (can be zero or negative)", "Speed is the magnitude of velocity"],
    onFormulaSheet: [],
    keywords: ["average speed", "average velocity", "total distance", "total time"]
  },
  {
    slug: "velocity-time-graphs", title: "Velocity/time graphs (including two-journey problems)", unit: "FM2", area: "Kinematics", strand: "Kinematics",
    statementIds: ["FM2-KIN-01"],
    prerequisites: ["displacement-time-graphs", "maths:area-of-trapezium"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q4(ii)–(iii): marks for area under each segment; only stronger candidates could find the time for the last stage and add on the 18 s." },
      { series: "Summer 2023", note: "Q6: only stronger candidates; a false origin of 10 s caused later errors; (ii) 'very poorly done' – reaching t = 52.5 then not handling the 10-second head start; two distance expressions in terms of T was the productive route; (iii) trapezium area." }
    ],
    mustMemorise: ["Area under a v/t graph = displacement; gradient = acceleration", "Split the area into triangles, rectangles and trapezia", "For a catch-up problem, equate the two distance expressions in the same time variable and allow for any head start"],
    onFormulaSheet: [],
    keywords: ["velocity-time", "area under graph", "acceleration", "overtaking", "meeting", "trapezium"]
  },
  {
    slug: "constant-acceleration-formulae", title: "Constant acceleration formulae (horizontal motion)", unit: "FM2", area: "Kinematics", strand: "Kinematics",
    statementIds: ["FM2-KIN-02"],
    prerequisites: ["maths:rearranging-formulae", "maths:quadratic-formula"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(i): wrong equation or correct equation used incorrectly; not squaring t in s = ut + ½at²; poor bracket expansion." },
      { series: "Summer 2022", note: "Q3: starting from the given acceleration in a 'show that' question gains no marks." },
      { series: "Summer 2024", note: "Q4(i): 'show that' answered by substituting the acceleration rather than forming the equation; (ii) deceleration as negative acceleration well understood." },
      { series: "Summer 2025", note: "Q3: U + 30 became 30U; assumed B was the midpoint (s = 100 m); wrong equations written despite the formula sheet." }
    ],
    mustMemorise: ["List s, u, v, a, t; choose the equation that omits the unknown you do not need", "Deceleration ⇒ a negative", "Do not assume a point is the midpoint unless told"],
    onFormulaSheet: ["v = u + at", "v² = u² + 2as", "s = ut + ½at²", "s = ½(u + v)t", "Quadratic formula (Unit 2 formula sheet)"],
    keywords: ["suvat", "uniform acceleration", "equations of motion", "deceleration"]
  },
  {
    slug: "vertical-motion-under-gravity", title: "Vertical motion under gravity", unit: "FM2", area: "Kinematics", strand: "Kinematics",
    statementIds: ["FM2-KIN-02"],
    prerequisites: ["constant-acceleration-formulae"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q5(vi): many used the acceleration from part (ii) or +10 for a free-falling particle instead of −10 (or +10 with a consistent sign convention)." },
      { series: "Summer 2023", note: "Q2(i): a minority used a = +10 for a ball thrown upwards; (ii) many wrongly used s = 25; successful method was to find the maximum height then a new s." }
    ],
    mustMemorise: ["Take g = 10 m/s² (mark schemes); choose a positive direction and keep signs consistent", "At the greatest height v = 0", "Displacement, not distance, goes into the formulae"],
    onFormulaSheet: ["v = u + at", "v² = u² + 2as", "s = ut + ½at²", "s = ½(u + v)t (Unit 2 formula sheet)"],
    keywords: ["gravity", "g = 10", "maximum height", "thrown upwards", "free fall"]
  },
  {
    slug: "vector-and-scalar-quantities", title: "Vector and scalar quantities: definitions and examples", unit: "FM2", area: "Vectors", strand: "Vectors",
    statementIds: ["FM2-VEC-01"],
    prerequisites: [],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q1: a surprisingly large number did not know or mixed up the definitions; specific examples (distance moved in a direction) not accepted as a general definition; 'quantity' accepted for magnitude." },
      { series: "Summer 2022", note: "Q1: under half gained full marks classifying four measures." },
      { series: "Summer 2023", note: "Q1: some found magnitudes or angles instead of stating the vector, suggesting they did not understand the terminology." },
      { series: "Summer 2025", note: "Q1: fewer than 50% full marks; weight commonly misclassified as a scalar." }
    ],
    mustMemorise: ["Vector: magnitude and direction (displacement, velocity, acceleration, force, weight)", "Scalar: magnitude only (distance, speed, time, mass, energy)"],
    onFormulaSheet: [],
    keywords: ["vector", "scalar", "magnitude", "direction", "weight", "mass"]
  },
  {
    slug: "vector-magnitude-and-direction", title: "Magnitude and direction of a vector", unit: "FM2", area: "Vectors", strand: "Vectors",
    statementIds: ["FM2-VEC-02"],
    prerequisites: ["maths:pythagoras", "maths:trigonometry-sohcahtoa", "maths:vectors"],
    difficulty: 2,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q2(iii): some found tan⁻¹(x/y) even though the correct formula is on the formula sheet." },
      { series: "Summer 2022", note: "Q2(ii): majority found the magnitude correctly." },
      { series: "Summer 2025", note: "Q2(iii): most common error was the reciprocal of what was needed for the angle." }
    ],
    mustMemorise: ["|xi + yj| = √(x² + y²)", "Angle with i is tan⁻¹(y/x); with j is tan⁻¹(x/y) – draw the triangle"],
    onFormulaSheet: ["Magnitude of xi + yj is √(x² + y²)", "Angle between xi + yj and i is tan⁻¹(y/x) (Unit 2 formula sheet)"],
    keywords: ["magnitude", "modulus", "direction", "angle with i", "bearing"]
  },
  {
    slug: "ij-vector-calculations", title: "Calculations with i and j vectors", unit: "FM2", area: "Vectors", strand: "Vectors",
    statementIds: ["FM2-VEC-03"],
    prerequisites: ["vector-magnitude-and-direction", "maths:simultaneous-equations-linear"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2022", note: "Q2(i): some subtracted or multiplied the vectors instead of adding." },
      { series: "Summer 2023", note: "Q1(ii)–(iii): displacement vector not handled as a vector; sign errors combining components." },
      { series: "Summer 2024", note: "Q2(i): 'so few candidates gained more than one out of the five marks' – could substitute but not equate i and j coefficients to form simultaneous equations; i and j left in the equations; sign errors expanding brackets." },
      { series: "Summer 2025", note: "Q2(i): still struggling – could not multiply −3 by −3x; sign errors; the majority used i/j rather than column vectors." }
    ],
    mustMemorise: ["Add/subtract component-wise; scalar multiply each component", "Equal vectors ⇒ equate i coefficients and j coefficients separately (two scalar equations)", "Resultant velocity/displacement = vector sum"],
    onFormulaSheet: ["Magnitude of xi + yj is √(x² + y²) (Unit 2 formula sheet)"],
    keywords: ["i and j", "components", "equate coefficients", "column vector", "resultant"]
  },
  {
    slug: "force-diagrams", title: "Force diagrams: identifying and labelling all forces on a body", unit: "FM2", area: "Forces", strand: "Forces",
    statementIds: ["FM2-FOR-01", "FM2-FOR-02"],
    prerequisites: ["vector-and-scalar-quantities"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q3(i): friction added wrongly, forces unlabelled, no arrows; Q4(i): tensions given the same letter, forces omitted, reactions added, weight of rod not at its centre." },
      { series: "Summer 2022", note: "Q3(b)(i): R omitted, friction given as 4 N instead of 4 N per kg × mass, missing arrows and labels; Q5(i): tension arrows missing or reversed, g left out of weights; Q6(i): extra R at B." },
      { series: "Summer 2023", note: "Q4(i): 'Year on year, it is still surprising how many candidates lose marks with missing forces or arrows'; normal reaction omitted; different labels for the two tensions; Q5(i): weight of rod omitted, mass instead of weight, extra reactions." },
      { series: "Summer 2024", note: "Q4(iii): weight not vertical; extra force down the slope; Q5(i): weight of rod omitted, same label on two strings." },
      { series: "Summer 2025", note: "Unit overview: 'a surprising number of candidates lost marks due to errors in force diagrams'; Q4(i) only ~50% full marks (tension direction, friction missing/wrong way, R omitted on 8 kg, extra R on 12 kg, weights not multiplied by g); Q5(i) reactions wrongly added at A and B." }
    ],
    mustMemorise: ["Weight = mg acting vertically down from the centre (uniform rod: at the midpoint)", "Normal reaction R perpendicular to the surface; tension T along the string (same T both sides of a light string over a smooth pulley); friction opposes motion along the surface", "Every force needs an arrow and a label; no extra forces"],
    onFormulaSheet: [],
    keywords: ["free body diagram", "weight", "normal reaction", "tension", "friction", "label", "arrow"]
  },
  {
    slug: "resolving-forces", title: "Resolving forces into components", unit: "FM2", area: "Forces", strand: "Forces",
    statementIds: ["FM2-FOR-03"],
    prerequisites: ["force-diagrams", "maths:trigonometry-sohcahtoa"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q3(ii), Q6: sine and cosine interchanged; g omitted, mass used as weight." },
      { series: "Summer 2022", note: "Q3(b)(ii): the usual errors in resolving with sin and cos mixed up." },
      { series: "Summer 2024", note: "Q3: usual sin/cos mix-up; some did not resolve the 25 N and 30 N forces; magnitude and angle of a force confused when resolving." },
      { series: "Summer 2025", note: "Q6(ii): sin/cos confusion occurred less frequently than in previous years." }
    ],
    mustMemorise: ["Component along a direction = F cos(angle between F and that direction); perpendicular component uses sin", "On a slope of angle α: weight components mg sin α down the slope and mg cos α into the slope"],
    onFormulaSheet: [],
    keywords: ["resolve", "components", "cos", "sin", "inclined", "perpendicular"]
  },
  {
    slug: "resultant-of-forces", title: "Resultant of a set of forces", unit: "FM2", area: "Forces", strand: "Forces",
    statementIds: ["FM2-FOR-04"],
    prerequisites: ["resolving-forces", "vector-magnitude-and-direction"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2024", note: "Q3: answered well by average-to-stronger candidates; a mark for any one correct resolved component, further marks needed an equation." }
    ],
    mustMemorise: ["Sum the horizontal components and the vertical components separately", "Magnitude by Pythagoras, direction by tan⁻¹ from the components", "Up to four forces are examined"],
    onFormulaSheet: ["Magnitude of xi + yj is √(x² + y²)", "Angle between xi + yj and i is tan⁻¹(y/x) (Unit 2 formula sheet)"],
    keywords: ["resultant", "net force", "sum of components", "magnitude", "direction"]
  },
  {
    slug: "equilibrium-of-forces", title: "Equilibrium of a particle (including inclined planes)", unit: "FM2", area: "Forces", strand: "Forces",
    statementIds: ["FM2-FOR-05"],
    prerequisites: ["resolving-forces"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q3(ii): many failed to recognise vertical equilibrium and did not set up an equation; equations with only two terms (R = 17 sin 33°) common." },
      { series: "Summer 2023", note: "Q3(i): reaction given as 50 without resolving, or R = 30 sin 37°; (ii) did not realise acceleration was zero and tried to find one." },
      { series: "Summer 2024", note: "Q3: good differentiator; an equation (not just a component) was needed for further marks." }
    ],
    mustMemorise: ["In equilibrium the resultant is zero: sum of components in each of two perpendicular directions = 0", "Include every force (up to four) in each equation", "Equilibrium ⇒ a = 0, so F = ma reduces to a balance of forces"],
    onFormulaSheet: [],
    keywords: ["equilibrium", "balance", "resolve horizontally", "resolve vertically", "at rest", "constant velocity"]
  },
  {
    slug: "newtons-second-law-linear", title: "F = ma for a body in horizontal or vertical motion", unit: "FM2", area: "Newton's laws of motion", strand: "Newton's laws of motion",
    statementIds: ["FM2-NEW-01"],
    prerequisites: ["force-diagrams", "constant-acceleration-formulae"],
    difficulty: 3,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q3(iii): most used F = ma with 5.8a; some multiplied a by the weight instead of the mass; Q5(i): forces on the car alone vs the whole system confused." },
      { series: "Summer 2022", note: "Q3(b)(i): weaker candidates could not cope with friction given as 4 N per kg; (ii) mass not changed from 6 kg to 8 kg." },
      { series: "Summer 2024", note: "Q6(i): resistive force found, then F = ma with 900 × 1.5; substituting the later value of M gained zero; verifying M by substitution capped at two marks; (iii)(a) some used the motion of the car for the trailer." },
      { series: "Summer 2025", note: "Q6(iii): most identified friction as 33.6 N and equated to 7a." }
    ],
    mustMemorise: ["Resultant force in the direction of motion = mass × acceleration", "Friction is given as a value or per kg of mass (multiply by the mass); F = μR is not examined", "Use mass in F = ma, weight (mg) on the diagram"],
    onFormulaSheet: ["F = ma (Unit 2 formula sheet)", "v = u + at, v² = u² + 2as, s = ut + ½at², s = ½(u + v)t"],
    keywords: ["Newton's second law", "resultant force", "friction per kg", "resistance", "lift", "tow"]
  },
  {
    slug: "newtons-second-law-inclined-plane", title: "F = ma on an inclined plane", unit: "FM2", area: "Newton's laws of motion", strand: "Newton's laws of motion",
    statementIds: ["FM2-NEW-01"],
    prerequisites: ["newtons-second-law-linear", "resolving-forces", "equilibrium-of-forces"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q6: compare accelerations up and down a slope – resultant must be taken in the direction of travel for each option; 70 sin 27° = 7a and 64.4 − 18.7 = 7a were the key steps; sin/cos swapped; g omitted." },
      { series: "Summer 2022", note: "Q3(b)(ii): only stronger candidates full marks; some wrongly took the system to be in equilibrium." },
      { series: "Summer 2024", note: "Q4: 'adequately assessed forces on an inclined plane'; (i) 'show that' by forming the equation; (iii) all three forces needed, weight vertical." },
      { series: "Summer 2025", note: "Q6: friction direction wrong, R omitted; resolving with sin/cos confusion; most reached = 7a." }
    ],
    mustMemorise: ["Resolve along and perpendicular to the plane: R = mg cos α; along the plane mg sin α ± friction ± applied force = ma", "Applied forces act parallel to the plane; friction opposes the direction of motion", "Two positive accelerations for motion up and motion down – take the resultant in the direction of travel"],
    onFormulaSheet: ["F = ma (Unit 2 formula sheet)"],
    keywords: ["slope", "incline", "mg sin", "mg cos", "up the plane", "down the plane"]
  },
  {
    slug: "connected-particles-and-pulleys", title: "Connected particles (tow-bars and pulleys) and the force on a pulley", unit: "FM2", area: "Newton's laws of motion", strand: "Newton's laws of motion",
    statementIds: ["FM2-NEW-01"],
    prerequisites: ["newtons-second-law-linear", "maths:simultaneous-equations-linear"],
    difficulty: 5,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q5: car-and-trailer; poor arithmetic in TF − 1020 − 647.5 = 850 × 0.9; (iv) new acceleration after the tow-bar breaks only by the more able." },
      { series: "Summer 2022", note: "Q5: good differentiator; poor equations of motion for each block; weak algebra solving simultaneously; (iv) 'a large number of candidates didn't know that the force on the pulley was double the calculated tension'." },
      { series: "Summer 2023", note: "Q4(iii)–(iv): T − 90 = Ma and 51.6 − T = Ma seen often; (ii) some tried F = ma where it was not needed." },
      { series: "Summer 2024", note: "Q6: tension of a tow-bar; substituting the later M into part (i) scored zero." },
      { series: "Summer 2025", note: "Q4(ii): treating the masses separately was more successful than the whole system; T − 30 − 80 = 8a a frequent wrong equation; mass and force confused; (iv) 'the least well-answered question on the paper' – force on the pulley wrongly taken as 2T when the strings were not both vertical (Teacher Guidance p.10)." }
    ],
    mustMemorise: ["Write F = ma for each body separately (same a, same T for a light inextensible string over a smooth pulley); add the equations to eliminate T", "Resultant force on a pulley = vector sum of the two tensions: 2T when the strings are parallel, 2T cos(θ/2) when they make angle θ (or T√2 for a right angle)", "After a string breaks/tow-bar snaps, recalculate the acceleration of each body separately"],
    onFormulaSheet: ["F = ma (Unit 2 formula sheet)"],
    keywords: ["connected particles", "pulley", "tension", "tow-bar", "force on pulley", "system"]
  },
  {
    slug: "moments-uniform-rod", title: "Moments and equilibrium of a horizontal uniform rod", unit: "FM2", area: "Moments", strand: "Moments",
    statementIds: ["FM2-MOM-01"],
    prerequisites: ["force-diagrams", "equilibrium-of-forces"],
    difficulty: 4,
    examinerEvidence: [
      { series: "Summer 2019", note: "Q4: very good discriminator; (ii) only the more able – one mark for a moments equation with two correct moments and one for equating vertically." },
      { series: "Summer 2022", note: "Q6: only stronger candidates; could not deal with R and 3R; (iii) used moments instead of equating forces vertically; g omitted; (iv) failed to recalculate R when the load moved; plank weight omitted." },
      { series: "Summer 2023", note: "Q5: moments taken about A, B, C and the centre all seen; only the more able full marks." },
      { series: "Summer 2024", note: "Q5: good differentiator; most gained a mark for any correctly calculated moment." },
      { series: "Summer 2025", note: "Q5(iii): tested understanding – weakest resorted to trial and error rather than using the variable d." }
    ],
    mustMemorise: ["Moment = force × perpendicular distance from the pivot", "Equilibrium: clockwise moments = anticlockwise moments AND upward forces = downward forces", "Weight of a uniform rod acts at its midpoint; take moments about a point where an unknown force acts to eliminate it", "On the point of tilting about one support, the reaction at the other support is zero"],
    onFormulaSheet: [],
    keywords: ["moments", "pivot", "reaction", "uniform rod", "tilting", "two supports", "clockwise"]
  }
];
