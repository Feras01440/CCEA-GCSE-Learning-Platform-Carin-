// Every learning-outcome statement of CCEA GCSE Mathematics (2017), Version 2, spec section 3,
// transcribed verbatim from docs/sources/maths/spec-2017-current_0.txt (pdftotext) and cross-checked
// against docs/research/01-ccea-gcse-mathematics-spec.md §5 and the parallel-version report §7.
// Order = spec order within each unit. `note` records any reconstruction of pdftotext garbling.
// `progressionOf` follows CCEA's "Progression of Subject Content" table (docs/sources/maths/
// Progression-of-Subject-Content.txt) where a row spans units; a few gateway->completion links that
// the table cannot show (it is split into M1-M4 and M5-M8 grids) are marked `progressionSource: "editorial"`.
// `teacherGuidance` is a short elaboration/exclusion from the CCEA Teacher Guidance (2019).

const S = (id, strand, text, extra = {}) => ({ id, unit: id.slice(0, 2), strand, text, progressionOf: null, ...extra });

export const STATEMENTS = [
  // ───────────────────────────── M1 ─────────────────────────────
  S('M1-NA-01', 'NA', 'use the 4 operations applied to positive and negative integers, including efficient written methods', {
    teacherGuidance: 'Write numbers in words and figures; consolidate number facts including multiplication to 10 × 10; e.g. how many 57-seat buses for 234 people and how many seats are unfilled.' }),
  S('M1-NA-02', 'NA', 'order positive and negative integers, decimals and fractions', {
    teacherGuidance: 'e.g. understand that 0.24 is greater than 0.235; order 0.8, 0.89, 0.9; order −6, −2, 0, 4.' }),
  S('M1-NA-03', 'NA', 'use symbols =, ≠, <, >, ≤ and ≥', {
    note: 'pdftotext drops the ≠, ≤ and ≥ glyphs ("use symbols =, , <, >, and"); reconstructed from the parallel report and the Progression table.' }),
  S('M1-NA-04', 'NA', 'use calculators effectively and efficiently', {
    teacherGuidance: 'Understand the use of brackets to distinguish between 9 + 46/80 and (9 + 46)/80.' }),
  S('M1-NA-05', 'NA', 'understand and use conventional notation for the priority of operations, including brackets, powers, roots and reciprocals', {
    teacherGuidance: 'Use BODMAS/BIDMAS to distinguish 3 + 2 × 5 from (3 + 2) × 5; solve problems requiring application of order of precedence.' }),
  S('M1-NA-06', 'NA', 'recognise and use relationships between operations, including inverse operations', {
    teacherGuidance: 'Multiplying by ½ is equivalent to dividing by 2; the inverse of square is square root; 457 − 95 = 457 − 100 + 5.' }),
  S('M1-NA-07', 'NA', 'use index notation for squares, cubes and powers of 10', {
    teacherGuidance: 'Work out 10², 6³.' }),
  S('M1-NA-08', 'NA', 'use the concepts and vocabulary of factor, multiple, common factor, common multiple and prime', {
    teacherGuidance: 'Find all primes between 0 and 100.' }),
  S('M1-NA-09', 'NA', 'use the terms square, positive and negative square root, cube and cube root', {
    teacherGuidance: 'The inverse of cube is cube root; if x² = 16 then x = ±4.' }),
  S('M1-NA-10', 'NA', 'understand place value and decimal places', {
    teacherGuidance: 'Know that 0.235 is 2 tenths, 3 hundredths and 5 thousandths, or 235 thousandths.' }),
  S('M1-NA-11', 'NA', 'read, write and compare decimals up to three decimal places'),
  S('M1-NA-12', 'NA', 'add, subtract, multiply and divide decimals up to 3 decimal places'),
  S('M1-NA-13', 'NA', 'round to a specified or appropriate degree of accuracy, number of decimal places or 1 significant figure, including a given power of 10', {
    teacherGuidance: 'Round 235 to the nearest hundred, 5620 to the nearest thousand, 0.356 to 1 d.p. "Appropriate degree of accuracy": if the values in the question are given to 2 d.p., the answer should be given to no more than 2 d.p.' }),
  S('M1-NA-14', 'NA', 'use correct decimal notation when working with money', {
    teacherGuidance: 'A calculator display of 26.3 should be written as £26.30.' }),
  S('M1-NA-15', 'NA', 'understand and use equivalent fractions', {
    teacherGuidance: 'Know that 4/8 = 2/4 = 1/2.' }),
  S('M1-NA-16', 'NA', 'write a simple fraction as a terminating decimal', {
    teacherGuidance: 'e.g. 3/5 = 0.6.' }),
  S('M1-NA-17', 'NA', 'add and subtract simple fractions and simple mixed numbers', {
    teacherGuidance: 'Work out 7/8 − 1/3; work out 1 3/5 + 2 1/5.' }),
  S('M1-NA-18', 'NA', 'calculate a fraction of a quantity', {
    teacherGuidance: 'Find 2/3 of £51.' }),
  S('M1-NA-19', 'NA', 'express one quantity as a fraction of another'),
  S('M1-NA-20', 'NA', 'understand that percentage means number of parts per 100', {
    teacherGuidance: '7 books out of 100 represents 7%.' }),
  S('M1-NA-21', 'NA', 'calculate a percentage of a quantity', {
    teacherGuidance: 'Find 20% of £3.00.' }),
  S('M1-NA-22', 'NA', 'express one quantity as a percentage of another', {
    teacherGuidance: 'Write 12 out of 40 as a percentage.' }),
  S('M1-NA-23', 'NA', 'calculate percentage increase/decrease', {
    teacherGuidance: 'A train ticket increases from £10 to £15: find the increase and the percentage increase; calculate percentage profit or loss.' }),
  S('M1-NA-24', 'NA', 'use equivalences between fractions, decimals and percentages in a variety of contexts', {
    teacherGuidance: '50% = 0.5 = 1/2; 60% = 0.6 = 3/5.' }),
  S('M1-NA-25', 'NA', 'calculate with money and solve simple problems in the context of finance, for example profit and loss, discount, wages and salaries, bank accounts, simple interest, budgeting, debt, annual percentage rate (APR) and annual equivalent rate (AER)', {
    teacherGuidance: '£1500 invested at 8% p.a. simple interest for 3 years; cost of a laptop at 15% discount; compare borrowing £200 for a year at 12% APR with £250 at 10% APR.' }),
  S('M1-NA-26', 'NA', 'distinguish the different roles that letter symbols play in algebra, using the correct notation', {
    teacherGuidance: '1a is written as a; b + b + b as 3b; a × b × 2 as 2ab; y × y as y²; a ÷ b as a/b.' }),
  S('M1-NA-27', 'NA', 'understand and use the concepts and vocabulary of expressions, equations, formulae, inequalities, terms and factors', {
    teacherGuidance: 'Letters represent definite unknowns in equations (5x + 1 = 16), defined quantities in formulae (V = IR), general numbers in expressions (3x + 2x = 5x for all x).' }),
  S('M1-NA-28', 'NA', 'interpret simple expressions as functions with inputs and outputs', {
    teacherGuidance: 'In functions letters define new quantities from known ones, e.g. y = 2x; write expressions from a given problem, e.g. y = 2x + 3.' }),
  S('M1-NA-29', 'NA', 'simplify and manipulate algebraic expressions by collecting like terms and multiplying a constant over a bracket', {
    teacherGuidance: 'Know that 2(a + b) is the same as 2a + 2b.' }),
  S('M1-NA-30', 'NA', 'manipulate algebraic expressions by taking out common factors that are constants', {
    teacherGuidance: 'Factorise 3a + 6b to give 3(a + 2b).' }),
  S('M1-NA-31', 'NA', 'write simple formulae and expressions from real-life contexts', {
    teacherGuidance: 'A trainee hairdresser earns £12 per hour and works h hours: write a formula for her total pay P.' }),
  S('M1-NA-32', 'NA', 'substitute numbers into formulae (which may be expressed in words or algebraically) and expressions', {
    teacherGuidance: 'Work out the time needed to cook a chicken using an appropriate formula; evaluate expressions.' }),
  S('M1-NA-33', 'NA', 'use standard formulae', {
    teacherGuidance: 'Use perimeter, area and volume formulae.' }),
  S('M1-NA-34', 'NA', 'set up and solve linear equations in one unknown', {
    teacherGuidance: 'e.g. solve 5x − 3 = 7.' }),
  S('M1-NA-35', 'NA', 'work with co-ordinates in all 4 quadrants', {
    teacherGuidance: 'In 2 dimensions only; plot points using geometric information; name shapes formed by plotting coordinates.' }),
  S('M1-NA-36', 'NA', 'recognise and plot equations that correspond to straight line graphs in the co-ordinate plane', {
    teacherGuidance: 'Draw the line x = 3; plot y = 2x + 1 by completing a table of values.' }),
  S('M1-NA-37', 'NA', 'construct and interpret linear graphs in real world contexts', {
    teacherGuidance: 'Plot Cost against Quantity to determine the total cost of buying a given number of items.' }),

  S('M1-GM-01', 'GM', 'use conventional terms and notations such as points, lines, vertices, edges, parallel lines, perpendicular lines, right angles, polygons, regular polygons and polygons with reflection and/or rotation symmetries', {
    teacherGuidance: 'Know and use the terms vertical, horizontal, diagonal, acute, obtuse and reflex.' }),
  S('M1-GM-02', 'GM', 'use the standard conventions for labelling and referring to the sides and angles of shapes'),
  S('M1-GM-03', 'GM', 'draw diagrams from a written description', {
    teacherGuidance: 'Draw triangles and other 2D shapes using a ruler and protractor.' }),
  S('M1-GM-04', 'GM', 'apply the properties of angles: at a point; at a point on a straight line; and vertically opposite', {
    note: 'The spec sets the three cases as sub-bullets; flattened here.',
    teacherGuidance: 'Angle as turning; instructions for ¼, ½ and ¾ turns and right angles; clockwise and anticlockwise.' }),
  S('M1-GM-05', 'GM', 'understand and use alternate and corresponding angles on parallel lines', {
    teacherGuidance: 'Use the language vertically opposite, adjacent, alternate and corresponding; explain why the angle sum of any quadrilateral is 360°.' }),
  S('M1-GM-06', 'GM', 'identify and apply circle definitions and properties, including centre, radius, chord, diameter and circumference', {
    teacherGuidance: 'Use a compass to draw a circle of given size.' }),
  S('M1-GM-07', 'GM', 'apply the properties and definitions of triangles and quadrilaterals, including square, rectangle, parallelogram, trapezium, and kite and rhombus', {
    teacherGuidance: 'Classify triangles: scalene, right-angled, equilateral and isosceles.' }),
  S('M1-GM-08', 'GM', 'identify properties of the faces, surfaces, edges and vertices of cubes, cuboids, prisms, cylinders, pyramids, cones and spheres'),
  S('M1-GM-09', 'GM', 'draw and interpret 2D representations of 3D shapes, for example nets, plans and elevations', {
    teacherGuidance: 'Construct plans and elevations of simple solids and representations (e.g. isometric paper) of solids from plans and elevations.' }),
  S('M1-GM-10', 'GM', 'understand and use metric units of measurement'),
  S('M1-GM-11', 'GM', 'make sensible estimates of a range of measures', {
    teacherGuidance: 'Estimate the length of a car, the capacity of a teacup, the "weight" of a school bag, the time to complete a task.' }),
  S('M1-GM-12', 'GM', 'convert metric measurements from one unit to another', {
    teacherGuidance: 'Use millilitres and litres for the same jug; 2.4 kg = 2400 g.' }),
  S('M1-GM-13', 'GM', 'solve problems involving length, area, volume/capacity, mass, time, and temperature', {
    teacherGuidance: '12- and 24-hour clock and timetables; digital and analogue displays; calendars; positive and negative temperatures.' }),
  S('M1-GM-14', 'GM', 'measure line segments and angles in geometric figures'),
  S('M1-GM-15', 'GM', 'use compound measures/units such as speed, heart beats per minute and miles per gallon', {
    teacherGuidance: 'Know that Speed = Distance ÷ Time.' }),
  S('M1-GM-16', 'GM', 'calculate perimeters and areas of triangles and rectangles and simple compound shapes made from triangles and rectangles'),
  S('M1-GM-17', 'GM', 'calculate circumferences and areas of circles', {
    teacherGuidance: 'Calculate the perimeter and area of a semicircle with radius 7 cm.' }),
  S('M1-GM-18', 'GM', 'calculate surface area and volumes of cubes and cuboids', {
    note: 'pdftotext places this line beside the "Handling data" row label because of page layout; it is the last Geometry and measures outcome.' }),

  S('M1-HD-01', 'HD', 'understand and use the handling data cycle to solve problems', {
    teacherGuidance: '1 specify a problem/hypothesis and plan; 2 collect data; 3 process and present; 4 interpret and discuss.' }),
  S('M1-HD-02', 'HD', 'understand what is meant by a sample and a population', {
    teacherGuidance: 'Terms population, census and sample; why it is preferable to take a sample and estimate results.' }),
  S('M1-HD-03', 'HD', 'understand simple random sampling and the effect of sample size on the reliability of conclusions', {
    teacherGuidance: 'The greater the sample size the more reliable the results.' }),
  S('M1-HD-04', 'HD', 'design an experiment or survey to test hypotheses', {
    teacherGuidance: 'Survey of cars passing with one, two, three… occupants; best location for a pedestrian crossing.' }),
  S('M1-HD-05', 'HD', 'design data-collection sheets, distinguishing between different types of data', {
    teacherGuidance: 'Distinguish discrete and continuous data; design and criticise questionnaire questions; use a given decision tree to sort items.' }),
  S('M1-HD-06', 'HD', 'identify possible sources of bias', {
    teacherGuidance: 'To reduce bias a sample must, as far as possible, represent the whole population.' }),
  S('M1-HD-07', 'HD', 'sort, classify and tabulate qualitative (categorical) data and discrete or continuous quantitative data, including the use of 2 circle Venn diagrams to sort data', {
    teacherGuidance: 'Reasons for grouping; know when to use 0–4 or 0 ≤ t < 4; Venn diagram e.g. common factors of 12 and 20.' }),
  S('M1-HD-08', 'HD', 'extract data from printed tables and lists'),
  S('M1-HD-09', 'HD', 'design and use two-way tables for discrete and grouped data', {
    teacherGuidance: 'Use a table of distances between towns to plan a journey.' }),
  S('M1-HD-10', 'HD', 'find mean, median, mode and range from a list of values and understand their uses', {
    teacherGuidance: 'Consider the suitability of mean, mode or median in different circumstances.' }),
  S('M1-HD-11', 'HD', 'calculate mean from an ungrouped frequency table and identify the mode and median'),
  S('M1-HD-12', 'HD', 'construct and interpret a wide range of graphs and diagrams including frequency tables and diagrams, pictograms, bar charts, pie charts, line graphs, frequency trees and flow charts, recognising that graphs may be misleading', {
    teacherGuidance: 'Includes stem and leaf diagrams (e.g. median from a stem and leaf) and composite bar charts. Excludes frequency polygons. Misleading due to scales, labels, etc.' }),
  S('M1-HD-13', 'HD', 'examine data to find patterns and exceptions'),
  S('M1-HD-14', 'HD', 'compare distributions and make inferences', {
    teacherGuidance: 'Compare sets of data using the mean, median, mode and range.' }),
  S('M1-HD-15', 'HD', 'plot and interpret scatter diagrams and recognise correlation', {
    teacherGuidance: 'Draw conclusions such as "as the age of a car increases, its value decreases".' }),

  // ───────────────────────────── M5 ─────────────────────────────
  S('M5-NA-01', 'NA', 'solve problems involving whole numbers, fractions, decimals and percentages without a calculator', {
    teacherGuidance: 'Multiply and divide mentally single-digit multiples of powers of ten; multiplying by a number less than one decreases, dividing increases; e.g. 80 × 0.2, 600 ÷ 0.2.' }),
  S('M5-NA-02', 'NA', 'estimate answers and check calculations using approximation and estimation', {
    progressionOf: 'M1-NA-13', progressionSource: 'editorial',
    teacherGuidance: 'Estimate 278 ÷ 39 ≈ 7; estimate √97; 1472 − 383 ≈ 1100; (0.25 × 83.4) ÷ 5.7 ≈ 3 or 4.' }),
  S('M5-NA-03', 'NA', 'use ratio notation, including reduction to its simplest form and its various links to fraction notation', {
    teacherGuidance: 'Simplify 12:18 to 2:3; money shared 1:3 means John receives ¼; boys:girls 3:5 means 3/8 of the class are boys.' }),
  S('M5-NA-04', 'NA', 'divide a quantity in a given ratio', {
    teacherGuidance: 'Divide £10 between two people in the ratio 3:5.' }),
  S('M5-NA-05', 'NA', 'apply ratio and proportion to real-life contexts and problems such as conversion, best-buy, comparison, scaling, mixing, concentrations and exchange rates', {
    teacherGuidance: 'Lengths 8 cm and 12 cm are in the ratio 2:3; adapt a recipe for six people to one for eight.' }),
  S('M5-NA-06', 'NA', 'recognise and use sequences of, for example, triangular, square and cube numbers', {
    teacherGuidance: 'Patterns in addition and multiplication tables; relationships between multiplication by 2, 4 and 8.' }),
  S('M5-NA-07', 'NA', 'generate terms of a sequence using term-to-term or a position-to-term rule', {
    teacherGuidance: '1, 2, 4… may continue 8, 16 or 7, 11; difference method; matchstick squares; generalise mainly in words; use of a counter-example.' }),
  S('M5-NA-08', 'NA', 'plot and interpret graphs modelling real situations, for example conversion graphs, distance/time graphs and intersecting travel graphs', {
    progressionOf: 'M1-NA-37', progressionSource: 'editorial' }),

  S('M5-GM-01', 'GM', 'interpret scales on a range of measuring instruments and recognise the continuous nature of measure and approximate nature of measurement', {
    teacherGuidance: 'A length written as 9.7 cm correct to one decimal place means 9.65 ≤ l < 9.75.' }),
  S('M5-GM-02', 'GM', 'know and use imperial measures still in common use and their approximate metric equivalents', {
    progressionOf: 'M1-GM-12', progressionSource: 'editorial',
    teacherGuidance: 'Know that 5 miles = 8 km and 1 kg = 2.2 lb; all other conversions will be given.' }),
  S('M5-GM-03', 'GM', 'use and interpret maps, scale factors and scale drawings', {
    teacherGuidance: 'Use the eight points of the compass; calculate the actual distance as the crow flies between two places on a map.' }),
  S('M5-GM-04', 'GM', 'use the sum of angles in a triangle, for example to deduce the angle sum in any polygon', {
    progressionOf: 'M1-GM-04', progressionSource: 'editorial',
    teacherGuidance: 'Polygons may be regular or irregular; given 4 interior angles of an irregular pentagon, deduce the 5th.' }),
  S('M5-GM-05', 'GM', 'describe and transform 2D shapes using single transformations', {
    teacherGuidance: 'Reflect shapes in a mirror line; rotate using tracing paper; complete a diagram so it has rotational symmetry of order 4.' }),
  S('M5-GM-06', 'GM', 'describe and transform 2D shapes using reflections about the x and y axes'),
  S('M5-GM-07', 'GM', 'describe and transform 2D shapes using single rotations about the origin', {
    teacherGuidance: 'Rotations will be limited to ±90° and 180°.' }),
  S('M5-GM-08', 'GM', 'describe and transform 2D shapes using translations', {
    teacherGuidance: 'e.g. translate a given shape 2 left and 3 up.' }),
  S('M5-GM-09', 'GM', 'describe and transform 2D shapes using enlargements by a positive whole number scale factor', {
    teacherGuidance: 'Enlargements preserve angle but not length; use a given centre of enlargement and scale factor.' }),
  S('M5-GM-10', 'GM', 'draw triangles and other 2D shapes using a ruler and protractor', {
    progressionOf: 'M1-GM-03', progressionSource: 'editorial' }),

  S('M5-HD-01', 'HD', 'understand and use the vocabulary of probability, including notions of uncertainty and risk', {
    teacherGuidance: 'Place events in order of likelihood and use appropriate words to identify chance.' }),
  S('M5-HD-02', 'HD', 'use the terms fair, random, evens, certain, likely, unlikely and impossible', {
    teacherGuidance: 'You do not always get 5 heads in 10 tosses of a fair coin, and very occasionally there will be none.' }),
  S('M5-HD-03', 'HD', 'understand and use the probability scale from 0 to 1'),
  S('M5-HD-04', 'HD', 'list all outcomes for single events, and for two successive events', {
    teacherGuidance: 'List the outcomes when tossing two coins: HH, TT, TH, HT.' }),
  S('M5-HD-05', 'HD', 'apply systematic listing strategies', {
    teacherGuidance: 'List all the ways the letters A, B and C can form a 3-letter code.' }),
  S('M5-HD-06', 'HD', 'work out probabilities expressed as fractions or decimals from simple experiments with equally likely outcomes and simple combined events', {
    teacherGuidance: 'P(event) = desirable outcomes ÷ possible outcomes; beads 1, 1, 2, 2, 3, 4 give P(1) = 2/6. Probability may be given as a percentage but not as a ratio.' }),
  S('M5-HD-07', 'HD', 'identify different mutually exclusive outcomes and know that the sum of the probabilities of all these outcomes is 1'),
  S('M5-HD-08', 'HD', 'understand the probability of an event not occurring is one minus the probability that it occurs', {
    teacherGuidance: 'If P(machine fails) = 0.05 then P(does not fail) = 0.95.' }),
  S('M5-HD-09', 'HD', 'use probabilities to calculate expectation'),

  // ───────────────────────────── M2 ─────────────────────────────
  S('M2-NA-01', 'NA', 'use index notation and index laws for positive, whole number powers', {
    progressionOf: 'M1-NA-07',
    teacherGuidance: 'Evaluate 3² × 2³; know 2³ × 2⁴ = 2⁷, 4⁵ ÷ 4² = 4³, (3²)⁴ = 3⁸.' }),
  S('M2-NA-02', 'NA', 'use the concepts and vocabulary of divisor, highest common factor, least (lowest) common multiple and prime factor decomposition', {
    progressionOf: 'M1-NA-08',
    teacherGuidance: 'HCF and LCM of two whole numbers; unique product of prime factors, e.g. 147 = 3 × 7 × 7 = 3 × 7².' }),
  S('M2-NA-03', 'NA', 'add, subtract, multiply and divide decimals of any size', {
    progressionOf: 'M1-NA-12',
    teacherGuidance: 'Any numbers, including negative numbers and fractions.' }),
  S('M2-NA-04', 'NA', 'round to a specified or appropriate number of significant figures', { progressionOf: 'M1-NA-13' }),
  S('M2-NA-05', 'NA', 'recognise that recurring decimals are exact fractions and that some exact fractions are recurring decimals', {
    progressionOf: 'M1-NA-16',
    teacherGuidance: 'Use division to convert a simple fraction to a decimal, e.g. 1/6 = 0.1666…' }),
  S('M2-NA-06', 'NA', 'add, subtract, multiply and divide fractions, including mixed numbers', {
    progressionOf: 'M1-NA-17',
    teacherGuidance: 'Work out 3 1/5 + 2 3/4.' }),
  S('M2-NA-07', 'NA', 'use percentage and repeated proportional change', {
    progressionOf: 'M1-NA-21',
    teacherGuidance: 'e.g. how much the value of a car has depreciated after 3 years.' }),
  S('M2-NA-08', 'NA', 'calculate with money and solve problems in a finance context, for example compound interest, insurance, taxation, mortgages and investments', {
    progressionOf: 'M1-NA-25',
    teacherGuidance: 'Calculation of compound interest is restricted to a maximum of three iterations.' }),
  S('M2-NA-09', 'NA', 'simplify and manipulate algebraic expressions by multiplying a single term over a bracket', {
    progressionOf: 'M1-NA-29',
    teacherGuidance: 'Know that x(2x + 3) = 2x² + 3x.' }),
  S('M2-NA-10', 'NA', 'manipulate algebraic expressions by taking out common factors that are terms', {
    progressionOf: 'M1-NA-30',
    teacherGuidance: 'x² − 3x = x(x − 3) and vice versa.' }),
  S('M2-NA-11', 'NA', 'set up and solve linear equations in one unknown, including those with the unknown on both sides of the equation and equations of the form x/4 + 3 = 7', {
    note: 'The stacked fraction "x over 4" is garbled by pdftotext; reconstructed as x/4 + 3 = 7 (also given as x/4 + 3 = 7 in the Progression table).',
    progressionOf: 'M1-NA-34',
    teacherGuidance: '"If I double a number, then add 1, the result is 49 — what is the number?"' }),
  S('M2-NA-12', 'NA', 'find the midpoint and length of a line given in 2D co-ordinates', {
    progressionOf: 'M1-NA-35', progressionSource: 'editorial',
    teacherGuidance: 'Length is an application of Pythagoras’ theorem.' }),
  S('M2-NA-13', 'NA', 'find and interpret gradients and intercepts of linear graphs, for example plot and interpret the graph of the cost of car hire at £40 per day plus a cost of 20 p per mile', {
    progressionOf: 'M1-NA-37',
    teacherGuidance: 'Plumber-hire graph: y-intercept is the call-out charge, gradient the cost per hour.' }),

  S('M2-GM-01', 'GM', 'use compound measures or units such as density', {
    progressionOf: 'M1-GM-15',
    teacherGuidance: 'Density = Mass ÷ Volume.' }),
  S('M2-GM-02', 'GM', 'calculate perimeters and areas of kite, parallelogram, rhombus and trapezium', { progressionOf: 'M1-GM-16' }),
  S('M2-GM-03', 'GM', 'calculate perimeters and areas of composite shapes', {
    progressionOf: 'M1-GM-17',
    teacherGuidance: 'e.g. perimeter of a rectangle with a semicircle at one end.' }),
  S('M2-GM-04', 'GM', 'calculate volumes of right prisms', {
    progressionOf: 'M1-GM-18',
    teacherGuidance: 'A prism has a uniform cross-section; volume and surface area of a triangular prism; volume of a cylinder.' }),
  S('M2-GM-05', 'GM', 'use Pythagoras’ theorem in 2D problems', {
    teacherGuidance: 'Calculate a side of a right-angled triangle when the other two sides are known.' }),

  S('M2-HD-01', 'HD', 'use 3 circle Venn diagrams to sort data', {
    progressionOf: 'M1-HD-07',
    teacherGuidance: 'e.g. survey of pet owners owning cats, dogs and fish.' }),
  S('M2-HD-02', 'HD', 'estimate mean from a grouped frequency distribution', {
    progressionOf: 'M1-HD-11',
    teacherGuidance: 'Prepare tables using mid-points, e.g. 120 ≤ h < 130 → 125; marks 0–9 → 4.5.' }),
  S('M2-HD-03', 'HD', 'identify the modal class and the median class from a grouped frequency distribution', { progressionOf: 'M1-HD-11' }),
  S('M2-HD-04', 'HD', 'draw and/or use lines of best fit by eye, understanding what these lines represent', {
    progressionOf: 'M1-HD-15',
    teacherGuidance: 'Roughly the same number of points either side; the line can be used to estimate values.' }),
  S('M2-HD-05', 'HD', 'draw conclusions from scatter diagrams', { progressionOf: 'M1-HD-15' }),
  S('M2-HD-06', 'HD', 'use terms such as positive correlation, negative correlation and little or no correlation', { progressionOf: 'M1-HD-15' }),
  S('M2-HD-07', 'HD', 'interpolate and extrapolate from data and know the dangers of doing so', {
    teacherGuidance: 'Interpolation is usually reasonably accurate; extrapolation may not be.' }),
  S('M2-HD-08', 'HD', 'identify outliers', { teacherGuidance: 'Identify outliers on a scatter graph by eye.' }),
  S('M2-HD-09', 'HD', 'appreciate that correlation does not imply causality'),

  // ───────────────────────────── M6 ─────────────────────────────
  S('M6-NA-01', 'NA', 'understand the principles of number systems', {
    teacherGuidance: 'Other number systems were used in the past, e.g. Roman numerals. Questions will not be asked on number systems, with the exception of Decimal and Binary. The binary system only uses 2 symbols.' }),
  S('M6-NA-02', 'NA', 'convert numbers from decimal to binary (base 2) and vice versa', {
    teacherGuidance: 'Convert 15 to binary; convert 1011 to decimal.' }),
  S('M6-NA-03', 'NA', 'use index laws in algebra for positive powers', {
    progressionOf: 'M2-NA-01', progressionSource: 'editorial',
    teacherGuidance: 'y² × y³ = y⁵; simplify 6x⁶ ÷ 3x⁴, 2x² × 3x³, (x²)³.' }),
  S('M6-NA-04', 'NA', 'use systematic trial and improvement to find approximate solutions of equations where there is no simple analytical method of solving them', {
    teacherGuidance: 'Requires confirmation of solutions, e.g. a half-way test, rather than settling on a solution by eye; e.g. solve x² + x = 10 or x³ + x = 20.' }),
  S('M6-NA-05', 'NA', 'solve linear inequalities in one variable, and represent the solution set on a number line', {
    teacherGuidance: 'List integers n with −10 < 2n ≤ 20; solve 2n − 3 ≥ 7 on a number line; solve x ≤ 3x − 5. Empty circle for < or >, full circle for ≤ or ≥.' }),
  S('M6-NA-06', 'NA', 'change the subject of a simple formula', {
    teacherGuidance: 'Make t the subject of v = u + at.' }),
  S('M6-NA-07', 'NA', 'find the nth term of a sequence where the rule is linear', {
    progressionOf: 'M5-NA-07',
    teacherGuidance: '1, 3, 5, 7… → 2n − 1; 2n generates the even numbers.' }),
  S('M6-NA-08', 'NA', 'solve two linear simultaneous equations graphically'),
  S('M6-NA-09', 'NA', 'generate points and plot graphs of simple quadratic functions and use these to find approximate solutions for points of intersection with lines of the form y = ±a only', {
    note: 'pdftotext renders the line form as "= �  only"; reconstructed as y = ±a from the Progression table ("lines of the form y = ±a only").',
    teacherGuidance: 'Draw graphs of y = ax² + bx + c; use the graph of y = x² + 5x to solve x² + 5x = 7.' }),

  S('M6-GM-01', 'GM', 'understand and use bearings', {
    progressionOf: 'M5-GM-03',
    teacherGuidance: 'Use three-figure bearings to specify direction.' }),
  S('M6-GM-02', 'GM', 'calculate and use the sums of the interior and exterior angles of polygons', {
    progressionOf: 'M5-GM-04',
    teacherGuidance: 'Explain why some regular polygons fit together without gaps while others do not.' }),
  S('M6-GM-03', 'GM', 'distinguish properties that are preserved under particular transformations', {
    progressionOf: 'M5-GM-05',
    teacherGuidance: 'Translations, rotations and reflections preserve length and angle; enlargements preserve angle but not length; find the inverse of transformations.' }),
  S('M6-GM-04', 'GM', 'describe and transform 2D shapes using reflections in lines parallel to the x or y axis', { progressionOf: 'M5-GM-06' }),
  S('M6-GM-05', 'GM', 'describe and transform 2D shapes using rotations about any point', {
    progressionOf: 'M5-GM-07',
    teacherGuidance: 'Rotations will be limited to ±90° and 180° about a point.' }),
  S('M6-GM-06', 'GM', 'describe and transform 2D shapes using translations, to include using vector notation', {
    progressionOf: 'M5-GM-08',
    teacherGuidance: 'Give a shape a translation by the column vector (3, −2).' }),
  S('M6-GM-07', 'GM', 'understand and use the effect of enlargement on perimeter and area of shapes', {
    progressionOf: 'M5-GM-09', progressionSource: 'editorial',
    teacherGuidance: 'When a 2D shape is enlarged by scale factor k the area is enlarged by k².' }),
  S('M6-GM-08', 'GM', 'understand the term congruent', {
    teacherGuidance: 'Group together congruent shapes from a range of triangles and quadrilaterals.' }),
  S('M6-GM-09', 'GM', 'use the standard ruler and compass constructions', {
    progressionOf: 'M5-GM-10',
    teacherGuidance: 'Equilateral triangle with a given side; midpoint and perpendicular bisector of a line segment; perpendicular from a point to a line and from a point on a line; bisector of an angle. The perpendicular distance from a point to a line is the shortest distance.' }),
  S('M6-GM-10', 'GM', 'identify the loci of points, including real life problems', {
    teacherGuidance: 'Given distance from a fixed point; equidistant from 2 points; given distance from a line; equidistant from 2 intersecting lines; including the region bounded by a circle and an intersecting line.' }),

  S('M6-HD-01', 'HD', 'systematically list all outcomes for single events and for two successive events', {
    progressionOf: 'M5-HD-04',
    teacherGuidance: 'Record the outcomes for the sum of two dice; problems with two different spinners.' }),
  S('M6-HD-02', 'HD', 'understand and use estimates or measures of probability from relative frequency', {
    teacherGuidance: 'Recognise when probabilities can be based on equally likely outcomes and when estimates must be based on sufficient experimental evidence.' }),
  S('M6-HD-03', 'HD', 'compare experimental data and theoretical probabilities'),
  S('M6-HD-04', 'HD', 'understand that increasing sample size generally leads to better estimates of probability', {
    progressionOf: 'M1-HD-03', progressionSource: 'editorial' }),

  // ───────────────────────────── M3 ─────────────────────────────
  S('M3-NA-01', 'NA', 'find the least common multiples (LCM) and highest common factor (HCF) of numbers written as the product of their prime factors', {
    progressionOf: 'M2-NA-02',
    teacherGuidance: 'Given 60 = 2² × 3 × 5 and 126 = 2 × 3² × 7, deduce the HCF or LCM of 60 and 126.' }),
  S('M3-NA-02', 'NA', 'find the original quantity, given the result of a proportional change', { progressionOf: 'M2-NA-07' }),
  S('M3-NA-03', 'NA', 'calculate the upper and lower bounds in calculations involving addition and multiplication of numbers expressed to a given degree of accuracy', {
    teacherGuidance: 'Given the sides of a rectangle correct to the nearest unit, calculate the range of values within which the area lies.' }),
  S('M3-NA-04', 'NA', 'know the difference between an equation and an identity', {
    progressionOf: 'M1-NA-27',
    teacherGuidance: 'Know the meaning of the word "identity" and the identity symbol ≡.' }),
  S('M3-NA-05', 'NA', 'multiply two linear expressions', {
    progressionOf: 'M2-NA-09',
    teacherGuidance: 'Expand and simplify (x + 4)(x − 2); know that (a ± b)² = a² ± 2ab + b².' }),
  S('M3-NA-06', 'NA', 'factorise quadratic expressions of the form x² + bx + c', {
    note: 'Superscript and letters lost by pdftotext ("2 +  + "); reconstructed from the Progression table.',
    progressionOf: 'M2-NA-10',
    teacherGuidance: 'x² − 8x + 15 = (x − 3)(x − 5).' }),
  S('M3-NA-07', 'NA', 'factorise using the difference of two squares', {
    progressionOf: 'M2-NA-10', progressionSource: 'editorial',
    teacherGuidance: 'x² − 16 = (x − 4)(x + 4).' }),
  S('M3-NA-08', 'NA', 'add or subtract algebraic fractions, for example simplify (4x + 3)/10 + (6x − 5)/5', {
    note: 'Stacked fractions garbled by pdftotext; reconstructed from the Progression table ("4x + 3 over 10 + 6x − 5 over 5").' }),
  S('M3-NA-09', 'NA', 'simplify, multiply and divide algebraic fractions with linear or quadratic numerators and denominators', {
    teacherGuidance: 'e.g. simplify 6x²/8x, (2x²/3) × (x/6), (x² + x − 6)/(x² − 4); a/b × c/d = ac/bd.' }),
  S('M3-NA-10', 'NA', 'set up and solve linear equations of the form (4x + 3)/10 + (6x − 5)/5 = 13/2', {
    note: 'Stacked fractions garbled by pdftotext; reconstructed from the Progression table.',
    progressionOf: 'M2-NA-11' }),
  S('M3-NA-11', 'NA', 'set up and solve quadratic equations using factors'),
  S('M3-NA-12', 'NA', 'understand that the form y = mx + c represents a straight line and that m is the gradient of the line and c is the value of the y-intercept', {
    note: 'Italic letters lost by pdftotext ("the form  =  +  … is the gradient"); reconstructed from the Progression table.',
    progressionOf: 'M1-NA-36',
    teacherGuidance: 'Derive a linear relationship from a straight-line graph; draw 3x − 4y = 7; determine x- and y-intercepts.' }),
  S('M3-NA-13', 'NA', 'find the equation of a line through two given points or through one point with a given gradient', { progressionOf: 'M2-NA-12' }),
  S('M3-NA-14', 'NA', 'understand and use the gradients of parallel lines', {
    teacherGuidance: 'y = −5x and y = −5x + 3 are parallel with gradient −5; find the equation of a line through a given point parallel to a given line.' }),

  S('M3-GM-01', 'GM', 'identify and apply circle definitions and properties, including tangent, arc, sector and segment', {
    progressionOf: 'M1-GM-06',
    teacherGuidance: 'A tangent to a circle is a straight line that touches the circle at a point.' }),
  S('M3-GM-02', 'GM', 'use compound measures or units such as pressure', {
    progressionOf: 'M2-GM-01',
    teacherGuidance: 'Pressure = Force ÷ Area.' }),
  S('M3-GM-03', 'GM', 'solve mensuration problems that involve arc length and area of sector, surface area of a cylinder and volume and surface area of a cone and sphere', {
    progressionOf: 'M2-GM-04',
    teacherGuidance: 'Including simple arcs, simple sectors and composite shapes, e.g. the perimeter of a sector of radius 10 cm and angle 60°.' }),
  S('M3-GM-04', 'GM', 'understand and use the trigonometric ratios of sine, cosine and tangent to solve 2D problems, including those involving angles of elevation and depression', { progressionOf: 'M2-GM-05' }),

  S('M3-HD-01', 'HD', 'calculate quartiles and interquartile range from a list of values and understand their uses', { progressionOf: 'M1-HD-10' }),
  S('M3-HD-02', 'HD', 'construct and interpret cumulative frequency tables and the cumulative frequency curve', {
    progressionOf: 'M1-HD-12',
    teacherGuidance: 'Find the median, upper and lower quartiles and interquartile range; describe the dispersion of data.' }),
  S('M3-HD-03', 'HD', 'estimate the median, quartiles and interquartile range from a cumulative frequency curve and display information using box plots', {
    teacherGuidance: 'The median and interquartile range are not affected by extreme values; draw valid conclusions by comparing two box plots.' }),
  S('M3-HD-04', 'HD', 'infer properties of populations or distributions from a sample and know the limitations of doing so', {
    progressionOf: 'M1-HD-14',
    teacherGuidance: 'Use a measure of central tendency and a measure of dispersion to compare 2 distributions; different samples may provide different results.' }),

  // ───────────────────────────── M7 ─────────────────────────────
  S('M7-NA-01', 'NA', 'use surds and π in exact calculations', {
    note: 'The π glyph is dropped by pdftotext ("use surds and  in exact calculations").',
    progressionOf: 'M5-NA-01',
    teacherGuidance: '√5 is a surd; leave answers in the form 5√2 or 10π, e.g. area of a circle of radius 5 cm as 25π. The question will indicate when answers are required in this form.' }),
  S('M7-NA-02', 'NA', 'use index notation and index laws for zero, positive and negative powers', {
    progressionOf: 'M2-NA-01', progressionSource: 'editorial',
    teacherGuidance: 'Know that 10⁻¹ = 1/10 etc.' }),
  S('M7-NA-03', 'NA', 'interpret, order and calculate with numbers written in standard index form', {
    progressionOf: 'M1-NA-07', progressionSource: 'editorial',
    teacherGuidance: 'Positive and negative powers of ten; convert between ordinary and standard form; calculate (3.2 × 10⁴)/(1.6 × 10⁻³) without a calculator; use standard form on a calculator; also called scientific notation.' }),
  S('M7-NA-04', 'NA', 'use index laws in algebra for integer powers', {
    progressionOf: 'M6-NA-03',
    teacherGuidance: 'x⁰ = 1, 1/x = x⁻¹; write 12a²b/(6ab³) as 2ab⁻².' }),
  S('M7-NA-05', 'NA', 'set up and solve two linear simultaneous equations algebraically', {
    progressionOf: 'M6-NA-08', progressionSource: 'editorial' }),
  S('M7-NA-06', 'NA', 'solve linear inequalities in two variables representing the solution set on a graph', {
    progressionOf: 'M6-NA-05',
    teacherGuidance: 'Show by shading the region satisfying x ≥ 1, y ≥ x, x + 2y ≤ 6; hence find the greatest value of 2x + y in the region.' }),
  S('M7-NA-07', 'NA', 'change the subject of a formula, including cases where a power or root of the subject appears and cases where the subject appears in more than one term', {
    progressionOf: 'M6-NA-06',
    teacherGuidance: 'Transform formulae such as A = πr² and P = 100(s − c)/c.' }),
  S('M7-NA-08', 'NA', 'find the nth term of non-linear sequences', {
    progressionOf: 'M6-NA-07',
    teacherGuidance: 'e.g. 1/3, 2/5, 3/7, 4/9 → n/(2n + 1); 2, 5, 10, 17, 26 → n² + 1. Use of second differences to determine the nth term of more complex quadratic sequences is excluded.' }),
  S('M7-NA-09', 'NA', 'recognise, sketch and interpret graphs of linear functions, quadratic functions, simple cubic functions and the reciprocal function y = k/x with x ≠ 0', {
    note: 'Function "y = k/x with x ≠ 0" garbled by pdftotext; reconstructed from the Progression table.',
    teacherGuidance: 'Identify intercepts and, using symmetry, the turning point of quadratic graphs; "reciprocal" as multiplicative inverse; zero has no reciprocal.' }),
  S('M7-NA-10', 'NA', 'generate points and plot graphs of simple quadratic functions and use these to find approximate solutions for points of intersection with lines of the form y = mx + c', {
    note: 'Line form garbled by pdftotext ("= +"); reconstructed from the Progression table.',
    progressionOf: 'M6-NA-09',
    teacherGuidance: 'Solve y = 5x − 6 and y = x² by drawing the graph of each function.' }),
  S('M7-NA-11', 'NA', 'set up equations and solve problems involving direct proportion, including graphical and algebraic representations', {
    progressionOf: 'M5-NA-05', progressionSource: 'editorial',
    teacherGuidance: 'Power P varies as the square of current I; when I = 2, P = 1000; find P when I = 5. Quantities are in direct proportion if y/x is constant.' }),

  S('M7-GM-01', 'GM', 'describe and transform 2D shapes using combined transformations', { progressionOf: 'M6-GM-03' }),
  S('M7-GM-02', 'GM', 'describe and transform 2D shapes using reflections in the lines y = ±x', {
    note: 'pdftotext renders "y = � x"; ± restored (Progression table: "reflections in the lines y = ±x").',
    progressionOf: 'M6-GM-04' }),
  S('M7-GM-03', 'GM', 'describe and transform 2D shapes using enlargements by a fractional scale factor', { progressionOf: 'M5-GM-09' }),
  S('M7-GM-04', 'GM', 'understand and use the effect of enlargement on the volume of solids', {
    progressionOf: 'M6-GM-07',
    teacherGuidance: 'When a 3D shape is enlarged by scale factor k the volume is enlarged by k³.' }),
  S('M7-GM-05', 'GM', 'use the relationship between the ratios of lengths and areas of similar 2D shapes', {
    progressionOf: 'M6-GM-08',
    teacherGuidance: 'Understand "similar"; prove triangles are similar; problems may be reversed (areas given, find a length).' }),

  S('M7-HD-01', 'HD', 'use the product rule for counting: if there are m ways of doing one task and for each of these, there are n ways of doing another task, then the total number of ways the two tasks can be done is m × n', {
    note: '× glyph dropped by pdftotext ("m � n").',
    progressionOf: 'M5-HD-05',
    teacherGuidance: 'Two doors in and three out gives 2 × 3 ways; 3 starters, 4 mains, 5 desserts give 3 × 4 × 5 combinations.' }),
  S('M7-HD-02', 'HD', 'know when to add or multiply two probabilities: if A and B are mutually exclusive, then the probability of A or B occurring is P(A) + P(B), whereas if A and B are independent events, the probability of A and B occurring is P(A) × P(B)', {
    note: '× glyph dropped by pdftotext.',
    progressionOf: 'M5-HD-08' }),
  S('M7-HD-03', 'HD', 'use tree diagrams to represent successive events that are independent', {
    progressionOf: 'M6-HD-01', progressionSource: 'editorial',
    teacherGuidance: 'Selection with replacement, e.g. a coin tossed 3 times; P(both) is less than P(either) unless a probability is 0 or 1.' }),

  // ───────────────────────────── M4 ─────────────────────────────
  // The spec prints M4 as one block spanning all three strands; strand assignment here is editorial.
  S('M4-NA-01', 'NA', 'calculate the upper and lower bounds in calculations involving subtraction and division of numbers expressed to a given degree of accuracy', {
    progressionOf: 'M3-NA-03',
    teacherGuidance: 'Given the dimensions of a rectangular piece of paper and the radius of a circle to 1 d.p., calculate the greatest area of paper remaining when the circle is cut out.' }),
  S('M4-NA-02', 'NA', 'factorise quadratic expressions of the form ax² + bx + c', {
    note: 'Letters and superscript lost by pdftotext; reconstructed from the Progression table ("ax² + bx + c, including more complex expressions").',
    progressionOf: 'M3-NA-06',
    teacherGuidance: 'Factorise more complex expressions, e.g. 3x² − 75, x² + xy − 6y², 2px − qx − 2py + qy.' }),
  S('M4-NA-03', 'NA', 'add or subtract algebraic fractions with linear denominators, for example simplify 2/(x + 2) + 3/(2x − 1)', {
    note: 'Stacked fractions garbled by pdftotext; reconstructed from the Progression table.',
    progressionOf: 'M3-NA-08',
    teacherGuidance: 'Excluding addition or subtraction of fractions with quadratic denominators.' }),
  S('M4-NA-04', 'NA', 'set up and solve equations such as 2/(x + 2) + 3/(2x − 1) = 1', {
    note: 'Stacked fractions garbled by pdftotext; reconstructed from the Progression table.',
    progressionOf: 'M3-NA-10',
    teacherGuidance: 'Excluding equations with quadratic denominators.' }),
  S('M4-NA-05', 'NA', 'set up and solve quadratic equations using factors and the formula where the coefficient of x² ≠ 1, and more complex equations', {
    note: '"x² ≠ 1" garbled by pdftotext ("coefficient of 2  1"); reconstructed from the Progression table.',
    progressionOf: 'M3-NA-11',
    teacherGuidance: 'Solve 2x² − 18 = 0, 6x² + 5x − 4 = 0; the equation may not be given in the form ax² + bx + c = 0, e.g. 2x(x − 1) = (x + 1)² − 5. The method of completing the square is excluded.' }),
  S('M4-NA-06', 'NA', 'understand and use the gradients of perpendicular lines', {
    progressionOf: 'M3-NA-14',
    teacherGuidance: 'y = −5x and 5y = x + 4 are perpendicular; given the equation and midpoint of one diagonal of a rhombus, find the equation of the other diagonal.' }),
  S('M4-GM-01', 'GM', 'solve more complex mensuration problems, for example frustums', {
    progressionOf: 'M3-GM-03',
    teacherGuidance: 'Surface area and volume of compound solids built from cubes, cuboids, cones, spheres, hemispheres, cylinders and prisms. Questions on frustums of a cone will not require knowledge of similar shapes.' }),
  S('M4-GM-02', 'GM', 'understand and use circle theorems', {
    progressionOf: 'M3-GM-01', progressionSource: 'editorial',
    teacherGuidance: 'Angle in a semicircle; angle at the centre and at the circumference; angles in the same segment; cyclic quadrilaterals; angle between tangent and radius; tangent kite; alternate segment theorem. Proofs of circle theorems are excluded.' }),
  S('M4-HD-01', 'HD', 'understand and use stratified sampling techniques', {
    progressionOf: 'M1-HD-03', progressionSource: 'editorial' }),
  S('M4-HD-02', 'HD', 'construct and interpret histograms for grouped continuous data with unequal class intervals', {
    progressionOf: 'M3-HD-02',
    teacherGuidance: 'Use a histogram to estimate the mean or median of a distribution.' }),

  // ───────────────────────────── M8 ─────────────────────────────
  S('M8-NA-01', 'NA', 'distinguish between rational and irrational numbers', {
    progressionOf: 'M7-NA-01',
    teacherGuidance: 'Know that √5 and 10π are irrational.' }),
  S('M8-NA-02', 'NA', 'change a recurring decimal to a fraction', {
    progressionOf: 'M2-NA-05', progressionSource: 'editorial',
    teacherGuidance: 'Know the significance of recurring and non-recurring decimals.' }),
  S('M8-NA-03', 'NA', 'use index notation and index laws for integer, fractional and negative powers', {
    progressionOf: 'M7-NA-02',
    teacherGuidance: 'Evaluate 27^(2/3), 8^(−4/3).' }),
  S('M8-NA-04', 'NA', 'set up, solve and interpret the answers in growth and decay problems, for example use the formula for compound interest', {
    progressionOf: 'M2-NA-08', progressionSource: 'editorial',
    teacherGuidance: 'A radioactive source decreases by 5% per hour from 1500 counts per second: activity after 12 hours?' }),
  S('M8-NA-05', 'NA', 'simplify numerical expressions involving surds, including the rationalisation of the denominator of a fraction such as 5/(3√2)', {
    note: 'The stacked fraction and √ glyph are garbled by pdftotext ("5 / 32"); reconstructed as 5/(3√2) (both research reports agree).',
    progressionOf: 'M7-NA-01',
    teacherGuidance: 'Write √12 as 2√3; 1/√3 = √3/3; write (5 − √5)² in the form a + b√5.' }),
  S('M8-NA-06', 'NA', 'use index laws in algebra for integer, fractional and negative powers', {
    progressionOf: 'M7-NA-04',
    teacherGuidance: 'y^(½) × y^(3/2) = y².' }),
  S('M8-NA-07', 'NA', 'set up and solve two simultaneous equations, one linear and one non-linear', {
    progressionOf: 'M7-NA-05',
    teacherGuidance: 'e.g. 2x + y = 1 and x² + y = 1 (degree of x ≤ 2); equate, or rearrange the linear equation and substitute into the quadratic.' }),
  S('M8-NA-08', 'NA', 'recognise, sketch and interpret graphs of exponential functions y = kˣ for positive values of k, for example growth and decay rates', {
    note: '"y = kˣ" garbled by pdftotext ("functions  =  for positive values of k"); reconstructed from the Progression table.',
    progressionOf: 'M7-NA-09',
    teacherGuidance: 'Rates of economic growth and decline; half-life of radioactive elements.' }),
  S('M8-NA-09', 'NA', 'find the intersection points of the graphs of a linear and quadratic function, knowing that these are the approximate solutions of the corresponding simultaneous equations representing the linear and quadratic functions, which may require algebraic manipulation', {
    progressionOf: 'M7-NA-10',
    teacherGuidance: 'Given the graph of y = 6x − x², draw a suitable straight line to solve 2 + 5x − x² = 0.' }),
  S('M8-NA-10', 'NA', 'interpret the gradient at a point on a curve as the instantaneous rate of change', {
    progressionOf: 'M7-NA-09', progressionSource: 'editorial',
    teacherGuidance: 'Temperature against time: the gradient is the rate at which temperature is changing at a specific time. Gradients are to be estimated using a tangent at a point.' }),
  S('M8-NA-11', 'NA', 'recognise and use the equation of a circle, centre the origin and radius r', {
    progressionOf: 'M3-NA-12', progressionSource: 'editorial',
    teacherGuidance: 'x² + y² = 25 is a circle, centre the origin, radius 5.' }),
  S('M8-NA-12', 'NA', 'find the equation of a tangent to a circle at a given point on the circle', {
    progressionOf: 'M4-NA-06', progressionSource: 'editorial',
    teacherGuidance: 'Tangent to x² + y² = 25 at (−3, 4): the tangent is perpendicular to the radius from (0, 0) to (−3, 4).' }),
  S('M8-NA-13', 'NA', 'set up equations and solve problems involving indirect proportion, including graphical and algebraic representations', {
    progressionOf: 'M7-NA-11',
    teacherGuidance: 'Current I is inversely proportional to resistance R; I = 2 when R = 250; find I when R = 200. Quantities are in inverse proportion if xy is constant.' }),
  S('M8-GM-01', 'GM', 'understand and use the sine and cosine rules', {
    progressionOf: 'M3-GM-04',
    teacherGuidance: 'The ambiguous case of the sine rule is excluded.' }),
  S('M8-GM-02', 'GM', 'calculate the area of a triangle using A = ½ab sin C', {
    note: 'Formula garbled by pdftotext ("= 12  sin"); reconstructed from the formula sheet and Progression table.',
    progressionOf: 'M3-GM-04', progressionSource: 'editorial' }),
  S('M8-GM-03', 'GM', 'use Pythagoras’ theorem and trigonometry to solve 2D and 3D problems', {
    progressionOf: 'M3-GM-04',
    teacherGuidance: 'Find the length of a space diagonal; find the angle between a line and a plane.' }),
  S('M8-GM-04', 'GM', 'enlarge 2D shapes using negative scale factors', { progressionOf: 'M7-GM-03' }),
  S('M8-GM-05', 'GM', 'use the relationship between the ratios of lengths, areas and volumes of similar 3D shapes', {
    progressionOf: 'M7-GM-05',
    teacherGuidance: 'Surface areas and volumes of similar 3D shapes, including the frustum of a cone.' }),
  S('M8-HD-01', 'HD', 'use the most appropriate method when solving complex probability problems', { progressionOf: 'M5-HD-06' }),
  S('M8-HD-02', 'HD', 'use tree diagrams to represent successive events that are not independent', {
    progressionOf: 'M7-HD-03',
    teacherGuidance: 'Selection without replacement, e.g. a bag with 6 red and 4 green beads, two selected without replacement: P(both red).' }),
];
