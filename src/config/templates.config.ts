/**
 * Flashcard Templates Configuration
 * Pre-made NEET flashcard templates for quick start
 */

import { DifficultyLevel } from "../types/flashcard.types";

export interface TemplateCard {
  front_content: string;
  back_content: string;
  difficulty: DifficultyLevel;
  tags: string[];
}

export interface FlashcardTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  topic: string;
  cardCount: number;
  difficulty: DifficultyLevel;
  cards: TemplateCard[];
  icon: string;
}

export const FLASHCARD_TEMPLATES: FlashcardTemplate[] = [
  // Physics Templates
  {
    id: "physics-laws-of-motion",
    title: "Newton's Laws of Motion",
    description: "Master the fundamental laws governing motion and forces",
    category: "Physics",
    topic: "Laws of Motion",
    cardCount: 8,
    difficulty: DifficultyLevel.MEDIUM,
    icon: "rocket",
    cards: [
      {
        front_content: "What is Newton's First Law of Motion?",
        back_content:
          "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force. Also known as the Law of Inertia.",
        difficulty: DifficultyLevel.EASY,
        tags: ["newton", "inertia", "first-law"],
      },
      {
        front_content: "State Newton's Second Law of Motion",
        back_content:
          "The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["newton", "force", "acceleration", "second-law"],
      },
      {
        front_content: "What is Newton's Third Law of Motion?",
        back_content:
          "For every action, there is an equal and opposite reaction. Forces always occur in pairs.",
        difficulty: DifficultyLevel.EASY,
        tags: ["newton", "action-reaction", "third-law"],
      },
      {
        front_content: "Define Inertia",
        back_content:
          "The tendency of an object to resist changes in its state of motion. Mass is a measure of inertia.",
        difficulty: DifficultyLevel.EASY,
        tags: ["inertia", "mass"],
      },
      {
        front_content: "What is momentum?",
        back_content:
          "The product of an object's mass and velocity. p = mv. It's a vector quantity measured in kg⋅m/s.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["momentum", "mass", "velocity"],
      },
      {
        front_content: "State the Law of Conservation of Momentum",
        back_content:
          "In a closed system with no external forces, the total momentum before collision equals the total momentum after collision.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["momentum", "conservation", "collision"],
      },
      {
        front_content: "What is impulse?",
        back_content:
          "The change in momentum of an object. Impulse = Force × Time = Change in momentum. J = FΔt = Δp",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["impulse", "force", "momentum"],
      },
      {
        front_content: "Differentiate between mass and weight",
        back_content:
          "Mass is the amount of matter in an object (scalar, measured in kg). Weight is the force of gravity on an object (vector, W = mg, measured in N).",
        difficulty: DifficultyLevel.EASY,
        tags: ["mass", "weight", "gravity"],
      },
    ],
  },
  {
    id: "physics-thermodynamics",
    title: "Thermodynamics Basics",
    description: "Essential concepts of heat, temperature, and energy transfer",
    category: "Physics",
    topic: "Thermodynamics",
    cardCount: 6,
    difficulty: DifficultyLevel.MEDIUM,
    icon: "flame",
    cards: [
      {
        front_content: "State the Zeroth Law of Thermodynamics",
        back_content:
          "If two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other. This law defines temperature.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["thermodynamics", "temperature", "equilibrium"],
      },
      {
        front_content: "What is the First Law of Thermodynamics?",
        back_content:
          "Energy cannot be created or destroyed, only converted from one form to another. ΔU = Q - W (Change in internal energy = Heat added - Work done)",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["thermodynamics", "energy", "conservation"],
      },
      {
        front_content: "State the Second Law of Thermodynamics",
        back_content:
          "Heat cannot spontaneously flow from a colder body to a hotter body. Entropy of an isolated system always increases.",
        difficulty: DifficultyLevel.HARD,
        tags: ["thermodynamics", "entropy", "heat"],
      },
      {
        front_content: "Define specific heat capacity",
        back_content:
          "The amount of heat required to raise the temperature of 1 kg of a substance by 1°C. Q = mcΔT",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["heat", "temperature", "specific-heat"],
      },
      {
        front_content: "What is latent heat?",
        back_content:
          "The heat energy required to change the state of a substance without changing its temperature. Q = mL",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["heat", "phase-change", "latent-heat"],
      },
      {
        front_content: "Differentiate between heat and temperature",
        back_content:
          "Heat is the total kinetic energy of molecules (measured in Joules). Temperature is the average kinetic energy of molecules (measured in °C or K).",
        difficulty: DifficultyLevel.EASY,
        tags: ["heat", "temperature", "energy"],
      },
    ],
  },

  // Chemistry Templates
  {
    id: "chemistry-periodic-table",
    title: "Periodic Table Essentials",
    description: "Key concepts about elements and periodic trends",
    category: "Chemistry",
    topic: "Periodic Table",
    cardCount: 7,
    difficulty: DifficultyLevel.EASY,
    icon: "grid",
    cards: [
      {
        front_content: "What is atomic number?",
        back_content:
          "The number of protons in the nucleus of an atom. It defines the element and its position in the periodic table.",
        difficulty: DifficultyLevel.EASY,
        tags: ["atomic-number", "protons", "elements"],
      },
      {
        front_content: "Define atomic mass",
        back_content:
          "The weighted average mass of all isotopes of an element, measured in atomic mass units (amu).",
        difficulty: DifficultyLevel.EASY,
        tags: ["atomic-mass", "isotopes"],
      },
      {
        front_content: "What is the periodic law?",
        back_content:
          "The physical and chemical properties of elements are periodic functions of their atomic numbers.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["periodic-law", "properties"],
      },
      {
        front_content: "Describe the trend of atomic radius across a period",
        back_content:
          "Atomic radius decreases from left to right across a period due to increasing nuclear charge pulling electrons closer.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["atomic-radius", "periodic-trends"],
      },
      {
        front_content: "What is electronegativity?",
        back_content:
          "The ability of an atom to attract shared electrons in a chemical bond. Fluorine is the most electronegative element.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["electronegativity", "bonding"],
      },
      {
        front_content: "Define ionization energy",
        back_content:
          "The energy required to remove an electron from a gaseous atom. It increases across a period and decreases down a group.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["ionization-energy", "electrons"],
      },
      {
        front_content: "What are valence electrons?",
        back_content:
          "Electrons in the outermost shell of an atom that participate in chemical bonding.",
        difficulty: DifficultyLevel.EASY,
        tags: ["valence-electrons", "bonding"],
      },
    ],
  },
  {
    id: "chemistry-chemical-bonding",
    title: "Chemical Bonding",
    description: "Understanding ionic, covalent, and metallic bonds",
    category: "Chemistry",
    topic: "Chemical Bonding",
    cardCount: 6,
    difficulty: DifficultyLevel.MEDIUM,
    icon: "link",
    cards: [
      {
        front_content: "What is an ionic bond?",
        back_content:
          "A chemical bond formed by the transfer of electrons from one atom to another, creating oppositely charged ions that attract each other.",
        difficulty: DifficultyLevel.EASY,
        tags: ["ionic-bond", "electrons", "ions"],
      },
      {
        front_content: "Define covalent bond",
        back_content:
          "A chemical bond formed by the sharing of electron pairs between atoms. Can be single, double, or triple bonds.",
        difficulty: DifficultyLevel.EASY,
        tags: ["covalent-bond", "electron-sharing"],
      },
      {
        front_content: "What is a metallic bond?",
        back_content:
          "A bond formed by the attraction between metal cations and delocalized electrons (electron sea model).",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["metallic-bond", "metals"],
      },
      {
        front_content: "Explain hydrogen bonding",
        back_content:
          "A special type of dipole-dipole attraction between a hydrogen atom bonded to N, O, or F and another electronegative atom.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["hydrogen-bond", "intermolecular-forces"],
      },
      {
        front_content:
          "What is electronegativity difference in ionic vs covalent bonds?",
        back_content:
          "Ionic bonds: electronegativity difference > 1.7. Covalent bonds: electronegativity difference < 1.7. Polar covalent: 0.4-1.7.",
        difficulty: DifficultyLevel.HARD,
        tags: ["electronegativity", "bond-types"],
      },
      {
        front_content: "Define bond energy",
        back_content:
          "The energy required to break one mole of bonds in gaseous molecules. Higher bond energy means stronger bond.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["bond-energy", "stability"],
      },
    ],
  },

  // Biology Templates
  {
    id: "biology-cell-structure",
    title: "Cell Structure & Function",
    description: "Explore the building blocks of life",
    category: "Biology",
    topic: "Cell Biology",
    cardCount: 8,
    difficulty: DifficultyLevel.EASY,
    icon: "cellular",
    cards: [
      {
        front_content: "What is the cell theory?",
        back_content:
          "1) All living organisms are made of cells. 2) The cell is the basic unit of life. 3) All cells arise from pre-existing cells.",
        difficulty: DifficultyLevel.EASY,
        tags: ["cell-theory", "fundamentals"],
      },
      {
        front_content: "What is the function of the nucleus?",
        back_content:
          "Controls cell activities and contains genetic material (DNA). It's the control center of the cell.",
        difficulty: DifficultyLevel.EASY,
        tags: ["nucleus", "organelles", "dna"],
      },
      {
        front_content: "Describe the function of mitochondria",
        back_content:
          "The powerhouse of the cell. Produces ATP through cellular respiration. Has its own DNA.",
        difficulty: DifficultyLevel.EASY,
        tags: ["mitochondria", "atp", "energy"],
      },
      {
        front_content: "What is the role of ribosomes?",
        back_content:
          "Protein synthesis. They translate mRNA into proteins. Can be free in cytoplasm or attached to ER.",
        difficulty: DifficultyLevel.EASY,
        tags: ["ribosomes", "protein-synthesis"],
      },
      {
        front_content: "Differentiate between rough and smooth ER",
        back_content:
          "Rough ER has ribosomes and synthesizes proteins. Smooth ER lacks ribosomes and synthesizes lipids and detoxifies substances.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["endoplasmic-reticulum", "organelles"],
      },
      {
        front_content: "What is the function of the Golgi apparatus?",
        back_content:
          "Modifies, packages, and transports proteins and lipids. Acts as the cell's post office.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["golgi-apparatus", "protein-processing"],
      },
      {
        front_content: "Describe lysosomes",
        back_content:
          "Contain digestive enzymes that break down waste materials and cellular debris. The cell's cleanup crew.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["lysosomes", "digestion"],
      },
      {
        front_content: "What is the cell membrane made of?",
        back_content:
          "Phospholipid bilayer with embedded proteins. Selectively permeable and controls what enters/exits the cell.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["cell-membrane", "phospholipids"],
      },
    ],
  },
  {
    id: "biology-photosynthesis",
    title: "Photosynthesis",
    description: "How plants convert light energy into chemical energy",
    category: "Biology",
    topic: "Plant Physiology",
    cardCount: 6,
    difficulty: DifficultyLevel.MEDIUM,
    icon: "leaf",
    cards: [
      {
        front_content: "What is photosynthesis?",
        back_content:
          "The process by which plants convert light energy into chemical energy (glucose) using CO₂ and H₂O. 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
        difficulty: DifficultyLevel.EASY,
        tags: ["photosynthesis", "glucose", "energy"],
      },
      {
        front_content: "Where does photosynthesis occur?",
        back_content:
          "In chloroplasts, specifically in the thylakoid membranes (light reactions) and stroma (Calvin cycle).",
        difficulty: DifficultyLevel.EASY,
        tags: ["chloroplast", "location"],
      },
      {
        front_content: "What are the two stages of photosynthesis?",
        back_content:
          "1) Light-dependent reactions (in thylakoids) - produce ATP and NADPH. 2) Light-independent reactions/Calvin cycle (in stroma) - produce glucose.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["light-reactions", "calvin-cycle"],
      },
      {
        front_content: "What is chlorophyll?",
        back_content:
          "The green pigment in chloroplasts that absorbs light energy (mainly red and blue light) for photosynthesis.",
        difficulty: DifficultyLevel.EASY,
        tags: ["chlorophyll", "pigment"],
      },
      {
        front_content: "What happens in the light reactions?",
        back_content:
          "Light energy splits water (photolysis), releases O₂, and produces ATP and NADPH for the Calvin cycle.",
        difficulty: DifficultyLevel.MEDIUM,
        tags: ["light-reactions", "atp", "nadph"],
      },
      {
        front_content: "Describe the Calvin cycle",
        back_content:
          "Uses ATP and NADPH from light reactions to fix CO₂ into glucose through carbon fixation, reduction, and regeneration of RuBP.",
        difficulty: DifficultyLevel.HARD,
        tags: ["calvin-cycle", "carbon-fixation"],
      },
    ],
  },
];

// Helper functions
export function getTemplatesByCategory(category: string): FlashcardTemplate[] {
  return FLASHCARD_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): FlashcardTemplate | undefined {
  return FLASHCARD_TEMPLATES.find((t) => t.id === id);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(FLASHCARD_TEMPLATES.map((t) => t.category)));
}
