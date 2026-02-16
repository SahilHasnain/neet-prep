/**
 * NEET-Specific Configuration
 * Subject categories, topics, and exam-related constants
 */

export const NEET_SUBJECTS = {
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  BIOLOGY: "Biology",
} as const;

export const NEET_TOPICS = {
  // Physics Topics
  PHYSICS: [
    "Mechanics",
    "Thermodynamics",
    "Electrostatics",
    "Current Electricity",
    "Magnetism",
    "Electromagnetic Induction",
    "Optics",
    "Modern Physics",
    "Waves and Sound",
    "Kinematics",
    "Laws of Motion",
    "Work, Energy and Power",
    "Rotational Motion",
    "Gravitation",
    "Properties of Matter",
    "Heat and Thermodynamics",
    "Oscillations",
    "Wave Motion",
  ],

  // Chemistry Topics
  CHEMISTRY: [
    "Physical Chemistry",
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Chemical Bonding",
    "States of Matter",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "Coordination Compounds",
    "Hydrocarbons",
    "Alcohols and Phenols",
    "Aldehydes and Ketones",
    "Carboxylic Acids",
    "Amines",
    "Biomolecules",
    "Polymers",
    "Environmental Chemistry",
  ],

  // Biology Topics
  BIOLOGY: [
    "Cell Biology",
    "Genetics",
    "Evolution",
    "Plant Physiology",
    "Human Physiology",
    "Reproduction",
    "Ecology",
    "Biotechnology",
    "Diversity of Living Organisms",
    "Structural Organization",
    "Biomolecules",
    "Respiration",
    "Photosynthesis",
    "Excretion",
    "Locomotion",
    "Neural Control",
    "Chemical Coordination",
    "Immune System",
    "Reproductive Health",
    "Microbes in Human Welfare",
  ],
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  NEET_LEVEL: "neet_level", // NEET exam difficulty
} as const;

export const NEET_EXAM_INFO = {
  TOTAL_QUESTIONS: 200,
  PHYSICS_QUESTIONS: 50,
  CHEMISTRY_QUESTIONS: 50,
  BIOLOGY_QUESTIONS: 100,
  MARKS_PER_QUESTION: 4,
  NEGATIVE_MARKING: -1,
  TOTAL_MARKS: 720,
  DURATION_MINUTES: 200,
} as const;

// AI Prompt templates for NEET-specific content
export const NEET_AI_PROMPTS = {
  PHYSICS: (topic: string, count: number) =>
    `Generate ${count} NEET Physics flashcards on "${topic}". Include important formulas, concepts, and numerical problem patterns. Focus on NEET exam pattern and frequently asked questions.`,

  CHEMISTRY: (topic: string, count: number) =>
    `Generate ${count} NEET Chemistry flashcards on "${topic}". Include chemical reactions, mechanisms, important compounds, and NCERT-based concepts. Focus on NEET exam pattern.`,

  BIOLOGY: (topic: string, count: number) =>
    `Generate ${count} NEET Biology flashcards on "${topic}". Include definitions, diagrams descriptions, processes, and NCERT-based facts. Focus on NEET exam pattern and frequently asked questions.`,

  GENERAL: (topic: string, count: number) =>
    `Generate ${count} NEET exam flashcards on "${topic}". Make them suitable for NEET preparation with clear questions and concise answers.`,
} as const;

// Study recommendations
export const STUDY_RECOMMENDATIONS = {
  DAILY_CARDS_TARGET: 50,
  REVISION_INTERVAL_DAYS: 7,
  MASTERY_THRESHOLD: 4, // Out of 5
  RECOMMENDED_STUDY_DURATION_MINUTES: 45,
} as const;

// Subject-wise weightage for NEET
export const SUBJECT_WEIGHTAGE = {
  PHYSICS: 25, // 25%
  CHEMISTRY: 25, // 25%
  BIOLOGY: 50, // 50%
} as const;
