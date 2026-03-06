/**
 * Diagnostic Quiz Configuration
 * Questions to assess student's current knowledge level
 */

export interface DiagnosticQuestion {
  id: string;
  topicId: string; // References knowledge-graph topic
  subject: 'Physics' | 'Chemistry' | 'Biology';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
}

// 30 diagnostic questions covering all subjects
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // Physics - 10 questions
  {
    id: 'diag_phy_001',
    topicId: 'phy_002',
    subject: 'Physics',
    difficulty: 'easy',
    question: 'A car travels 100m in 10s. What is its average speed?',
    options: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'],
    correctAnswer: 1,
    explanation: 'Average speed = Distance/Time = 100/10 = 10 m/s'
  },
  {
    id: 'diag_phy_002',
    topicId: 'phy_003',
    subject: 'Physics',
    difficulty: 'medium',
    question: 'Newton\'s second law states that F = ma. If force is doubled and mass remains constant, acceleration:',
    options: ['Remains same', 'Doubles', 'Halves', 'Becomes zero'],
    correctAnswer: 1,
    explanation: 'From F = ma, if F doubles and m is constant, a must double'
  },
  {
    id: 'diag_phy_003',
    topicId: 'phy_004',
    subject: 'Physics',
    difficulty: 'medium',
    question: 'Work done by a force is maximum when the angle between force and displacement is:',
    options: ['0°', '45°', '90°', '180°'],
    correctAnswer: 0,
    explanation: 'Work = F·d·cosθ, maximum when θ = 0° (cos0° = 1)'
  },
  {
    id: 'diag_phy_004',
    topicId: 'phy_008',
    subject: 'Physics',
    difficulty: 'hard',
    question: 'In an adiabatic process:',
    options: ['Heat exchange is zero', 'Temperature remains constant', 'Pressure remains constant', 'Volume remains constant'],
    correctAnswer: 0,
    explanation: 'Adiabatic process means no heat exchange with surroundings (Q = 0)'
  },
  {
    id: 'diag_phy_005',
    topicId: 'phy_011',
    subject: 'Physics',
    difficulty: 'easy',
    question: 'Like charges:',
    options: ['Attract each other', 'Repel each other', 'Neither attract nor repel', 'First attract then repel'],
    correctAnswer: 1,
    explanation: 'Like charges (both positive or both negative) repel each other'
  },
  {
    id: 'diag_phy_006',
    topicId: 'phy_012',
    subject: 'Physics',
    difficulty: 'medium',
    question: 'Ohm\'s law is valid for:',
    options: ['All conductors', 'Only metallic conductors at constant temperature', 'Semiconductors', 'Insulators'],
    correctAnswer: 1,
    explanation: 'Ohm\'s law (V = IR) applies to metallic conductors at constant temperature'
  },
  {
    id: 'diag_phy_007',
    topicId: 'phy_015',
    subject: 'Physics',
    difficulty: 'medium',
    question: 'The focal length of a convex lens is 20 cm. Its power is:',
    options: ['+2 D', '+5 D', '-5 D', '+10 D'],
    correctAnswer: 1,
    explanation: 'Power = 1/f(in meters) = 1/0.2 = +5 D'
  },
  {
    id: 'diag_phy_008',
    topicId: 'phy_016',
    subject: 'Physics',
    difficulty: 'hard',
    question: 'Photoelectric effect proves that light has:',
    options: ['Wave nature', 'Particle nature', 'Both wave and particle nature', 'Neither wave nor particle nature'],
    correctAnswer: 1,
    explanation: 'Photoelectric effect demonstrates particle (photon) nature of light'
  },
  {
    id: 'diag_phy_009',
    topicId: 'phy_009',
    subject: 'Physics',
    difficulty: 'medium',
    question: 'Time period of a simple pendulum depends on:',
    options: ['Mass', 'Length', 'Amplitude', 'All of these'],
    correctAnswer: 1,
    explanation: 'T = 2π√(L/g), depends only on length and gravity'
  },
  {
    id: 'diag_phy_010',
    topicId: 'phy_006',
    subject: 'Physics',
    difficulty: 'easy',
    question: 'Acceleration due to gravity on moon is approximately:',
    options: ['Same as Earth', '1/6th of Earth', '6 times Earth', 'Zero'],
    correctAnswer: 1,
    explanation: 'Moon\'s gravity is about 1/6th of Earth\'s gravity'
  },

  // Chemistry - 10 questions
  {
    id: 'diag_chem_001',
    topicId: 'chem_001',
    subject: 'Chemistry',
    difficulty: 'easy',
    question: 'One mole of any substance contains:',
    options: ['6.022 × 10²³ particles', '6.022 × 10²² particles', '1.66 × 10⁻²⁴ particles', '1 gram'],
    correctAnswer: 0,
    explanation: 'Avogadro\'s number = 6.022 × 10²³ particles per mole'
  },
  {
    id: 'diag_chem_002',
    topicId: 'chem_002',
    subject: 'Chemistry',
    difficulty: 'medium',
    question: 'Maximum number of electrons in M shell is:',
    options: ['2', '8', '18', '32'],
    correctAnswer: 2,
    explanation: 'Maximum electrons = 2n², for M shell (n=3): 2(3)² = 18'
  },
  {
    id: 'diag_chem_003',
    topicId: 'chem_003',
    subject: 'Chemistry',
    difficulty: 'medium',
    question: 'Shape of NH₃ molecule is:',
    options: ['Linear', 'Trigonal planar', 'Pyramidal', 'Tetrahedral'],
    correctAnswer: 2,
    explanation: 'NH₃ has pyramidal shape due to one lone pair on nitrogen'
  },
  {
    id: 'diag_chem_004',
    topicId: 'chem_005',
    subject: 'Chemistry',
    difficulty: 'hard',
    question: 'For an endothermic reaction, ΔH is:',
    options: ['Positive', 'Negative', 'Zero', 'Can be positive or negative'],
    correctAnswer: 0,
    explanation: 'Endothermic reactions absorb heat, so ΔH > 0 (positive)'
  },
  {
    id: 'diag_chem_005',
    topicId: 'chem_006',
    subject: 'Chemistry',
    difficulty: 'medium',
    question: 'Le Chatelier\'s principle is applicable to:',
    options: ['Irreversible reactions', 'Reversible reactions at equilibrium', 'All reactions', 'Only exothermic reactions'],
    correctAnswer: 1,
    explanation: 'Le Chatelier\'s principle applies to reversible reactions at equilibrium'
  },
  {
    id: 'diag_chem_006',
    topicId: 'chem_007',
    subject: 'Chemistry',
    difficulty: 'easy',
    question: 'In a redox reaction, oxidation involves:',
    options: ['Gain of electrons', 'Loss of electrons', 'Gain of protons', 'Loss of neutrons'],
    correctAnswer: 1,
    explanation: 'Oxidation is loss of electrons (OIL - Oxidation Is Loss)'
  },
  {
    id: 'diag_chem_007',
    topicId: 'chem_011',
    subject: 'Chemistry',
    difficulty: 'easy',
    question: 'Most reactive metal in periodic table is:',
    options: ['Sodium', 'Potassium', 'Francium', 'Lithium'],
    correctAnswer: 2,
    explanation: 'Francium (bottom of Group 1) is most reactive metal'
  },
  {
    id: 'diag_chem_008',
    topicId: 'chem_014',
    subject: 'Chemistry',
    difficulty: 'medium',
    question: 'Benzene shows:',
    options: ['Addition reactions only', 'Substitution reactions only', 'Both addition and substitution', 'Neither addition nor substitution'],
    correctAnswer: 1,
    explanation: 'Benzene preferentially undergoes electrophilic substitution due to aromatic stability'
  },
  {
    id: 'diag_chem_009',
    topicId: 'chem_015',
    subject: 'Chemistry',
    difficulty: 'hard',
    question: 'Lucas test is used to distinguish between:',
    options: ['Aldehydes and ketones', 'Primary, secondary and tertiary alcohols', 'Alcohols and phenols', 'Carboxylic acids and esters'],
    correctAnswer: 1,
    explanation: 'Lucas test differentiates 1°, 2°, and 3° alcohols based on reactivity'
  },
  {
    id: 'diag_chem_010',
    topicId: 'chem_009',
    subject: 'Chemistry',
    difficulty: 'medium',
    question: 'Rate of reaction increases with temperature because:',
    options: ['Molecules move faster', 'Activation energy decreases', 'More molecules have energy ≥ Ea', 'Concentration increases'],
    correctAnswer: 2,
    explanation: 'Higher temperature means more molecules have energy equal to or greater than activation energy'
  },

  // Biology - 10 questions
  {
    id: 'diag_bio_001',
    topicId: 'bio_001',
    subject: 'Biology',
    difficulty: 'easy',
    question: 'Binomial nomenclature was given by:',
    options: ['Darwin', 'Linnaeus', 'Mendel', 'Lamarck'],
    correctAnswer: 1,
    explanation: 'Carolus Linnaeus introduced binomial nomenclature system'
  },
  {
    id: 'diag_bio_002',
    topicId: 'bio_002',
    subject: 'Biology',
    difficulty: 'easy',
    question: 'Powerhouse of the cell is:',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'],
    correctAnswer: 2,
    explanation: 'Mitochondria produce ATP (energy), hence called powerhouse'
  },
  {
    id: 'diag_bio_003',
    topicId: 'bio_003',
    subject: 'Biology',
    difficulty: 'medium',
    question: 'Enzymes are primarily:',
    options: ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic acids'],
    correctAnswer: 2,
    explanation: 'Most enzymes are proteins that catalyze biochemical reactions'
  },
  {
    id: 'diag_bio_004',
    topicId: 'bio_004',
    subject: 'Biology',
    difficulty: 'medium',
    question: 'Crossing over occurs during:',
    options: ['Prophase I of meiosis', 'Metaphase of mitosis', 'Anaphase II of meiosis', 'Telophase of mitosis'],
    correctAnswer: 0,
    explanation: 'Crossing over (genetic recombination) occurs in Prophase I of meiosis'
  },
  {
    id: 'diag_bio_005',
    topicId: 'bio_005',
    subject: 'Biology',
    difficulty: 'medium',
    question: 'In a monohybrid cross between two heterozygotes, the phenotypic ratio is:',
    options: ['1:1', '1:2:1', '3:1', '9:3:3:1'],
    correctAnswer: 2,
    explanation: 'Monohybrid cross (Aa × Aa) gives 3:1 phenotypic ratio'
  },
  {
    id: 'diag_bio_006',
    topicId: 'bio_006',
    subject: 'Biology',
    difficulty: 'hard',
    question: 'DNA replication is:',
    options: ['Conservative', 'Semi-conservative', 'Dispersive', 'Random'],
    correctAnswer: 1,
    explanation: 'DNA replication is semi-conservative (each strand serves as template)'
  },
  {
    id: 'diag_bio_007',
    topicId: 'bio_010',
    subject: 'Biology',
    difficulty: 'medium',
    question: 'C4 plants are more efficient than C3 plants because:',
    options: ['They have more chlorophyll', 'They prevent photorespiration', 'They need less water', 'They grow faster'],
    correctAnswer: 1,
    explanation: 'C4 plants have mechanism to minimize photorespiration, increasing efficiency'
  },
  {
    id: 'diag_bio_008',
    topicId: 'bio_013',
    subject: 'Biology',
    difficulty: 'easy',
    question: 'Normal human heart rate is approximately:',
    options: ['50 beats/min', '72 beats/min', '100 beats/min', '120 beats/min'],
    correctAnswer: 1,
    explanation: 'Normal resting heart rate is about 72 beats per minute'
  },
  {
    id: 'diag_bio_009',
    topicId: 'bio_016',
    subject: 'Biology',
    difficulty: 'medium',
    question: 'Reflex arc involves:',
    options: ['Only brain', 'Only spinal cord', 'Spinal cord and brain', 'Neither brain nor spinal cord'],
    correctAnswer: 1,
    explanation: 'Reflex arc is mediated by spinal cord without brain involvement'
  },
  {
    id: 'diag_bio_010',
    topicId: 'bio_021',
    subject: 'Biology',
    difficulty: 'hard',
    question: 'In an ecosystem, energy flow is:',
    options: ['Bidirectional', 'Unidirectional', 'Cyclic', 'Random'],
    correctAnswer: 1,
    explanation: 'Energy flows unidirectionally from producers to consumers (10% law)'
  }
];

// Scoring thresholds
export const DIAGNOSTIC_SCORING = {
  EXCELLENT: 80, // 24+ correct out of 30
  GOOD: 60, // 18-23 correct
  AVERAGE: 40, // 12-17 correct
  NEEDS_IMPROVEMENT: 0 // 0-11 correct
};

// Topic mastery calculation
export const calculateTopicMastery = (
  topicId: string,
  results: { questionId: string; isCorrect: boolean }[]
): number => {
  const topicQuestions = DIAGNOSTIC_QUESTIONS.filter(q => q.topicId === topicId);
  const topicResults = results.filter(r =>
    topicQuestions.some(q => q.id === r.questionId)
  );

  if (topicResults.length === 0) return 0;

  const correctCount = topicResults.filter(r => r.isCorrect).length;
  return Math.round((correctCount / topicResults.length) * 100);
};
