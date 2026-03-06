/**
 * Knowledge Graph Configuration
 * Maps NEET topics with prerequisites and dependencies
 */

export interface TopicNode {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  name: string;
  prerequisites: string[]; // IDs of prerequisite topics
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  estimatedHours: number;
  neetWeightage: number; // Percentage of questions in NEET
  description: string;
}

// Physics Knowledge Graph
export const PHYSICS_GRAPH: TopicNode[] = [
  // Foundation
  {
    id: 'phy_001',
    subject: 'Physics',
    name: 'Units and Measurements',
    prerequisites: [],
    difficulty: 'foundation',
    estimatedHours: 4,
    neetWeightage: 2,
    description: 'Basic units, dimensional analysis, significant figures'
  },
  {
    id: 'phy_002',
    subject: 'Physics',
    name: 'Kinematics',
    prerequisites: ['phy_001'],
    difficulty: 'foundation',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Motion in straight line, projectile motion, relative velocity'
  },
  {
    id: 'phy_003',
    subject: 'Physics',
    name: 'Laws of Motion',
    prerequisites: ['phy_002'],
    difficulty: 'foundation',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Newton\'s laws, friction, circular motion'
  },
  {
    id: 'phy_004',
    subject: 'Physics',
    name: 'Work, Energy and Power',
    prerequisites: ['phy_003'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Work-energy theorem, conservation of energy, power'
  },
  {
    id: 'phy_005',
    subject: 'Physics',
    name: 'Rotational Motion',
    prerequisites: ['phy_003', 'phy_004'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 5,
    description: 'Torque, moment of inertia, angular momentum'
  },
  {
    id: 'phy_006',
    subject: 'Physics',
    name: 'Gravitation',
    prerequisites: ['phy_003'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Universal gravitation, planetary motion, satellites'
  },
  {
    id: 'phy_007',
    subject: 'Physics',
    name: 'Properties of Matter',
    prerequisites: ['phy_001'],
    difficulty: 'foundation',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Elasticity, surface tension, viscosity, fluid mechanics'
  },
  {
    id: 'phy_008',
    subject: 'Physics',
    name: 'Thermodynamics',
    prerequisites: ['phy_004'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Laws of thermodynamics, heat engines, entropy'
  },
  {
    id: 'phy_009',
    subject: 'Physics',
    name: 'Oscillations',
    prerequisites: ['phy_003', 'phy_004'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Simple harmonic motion, pendulum, springs'
  },
  {
    id: 'phy_010',
    subject: 'Physics',
    name: 'Waves and Sound',
    prerequisites: ['phy_009'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Wave motion, sound waves, Doppler effect'
  },
  {
    id: 'phy_011',
    subject: 'Physics',
    name: 'Electrostatics',
    prerequisites: ['phy_001'],
    difficulty: 'foundation',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Electric charge, field, potential, capacitance'
  },
  {
    id: 'phy_012',
    subject: 'Physics',
    name: 'Current Electricity',
    prerequisites: ['phy_011'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Ohm\'s law, circuits, Kirchhoff\'s laws, meters'
  },
  {
    id: 'phy_013',
    subject: 'Physics',
    name: 'Magnetism',
    prerequisites: ['phy_011'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Magnetic field, force on moving charges, magnetic materials'
  },
  {
    id: 'phy_014',
    subject: 'Physics',
    name: 'Electromagnetic Induction',
    prerequisites: ['phy_012', 'phy_013'],
    difficulty: 'advanced',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Faraday\'s law, Lenz\'s law, AC circuits'
  },
  {
    id: 'phy_015',
    subject: 'Physics',
    name: 'Optics',
    prerequisites: ['phy_010'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Reflection, refraction, lenses, optical instruments'
  },
  {
    id: 'phy_016',
    subject: 'Physics',
    name: 'Modern Physics',
    prerequisites: ['phy_011', 'phy_015'],
    difficulty: 'advanced',
    estimatedHours: 12,
    neetWeightage: 8,
    description: 'Photoelectric effect, atoms, nuclei, semiconductors'
  }
];

// Chemistry Knowledge Graph
export const CHEMISTRY_GRAPH: TopicNode[] = [
  {
    id: 'chem_001',
    subject: 'Chemistry',
    name: 'Basic Concepts',
    prerequisites: [],
    difficulty: 'foundation',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Atoms, molecules, mole concept, stoichiometry'
  },
  {
    id: 'chem_002',
    subject: 'Chemistry',
    name: 'Atomic Structure',
    prerequisites: ['chem_001'],
    difficulty: 'foundation',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Bohr model, quantum numbers, electronic configuration'
  },
  {
    id: 'chem_003',
    subject: 'Chemistry',
    name: 'Chemical Bonding',
    prerequisites: ['chem_002'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 5,
    description: 'Ionic, covalent, metallic bonds, VSEPR, hybridization'
  },
  {
    id: 'chem_004',
    subject: 'Chemistry',
    name: 'States of Matter',
    prerequisites: ['chem_001'],
    difficulty: 'foundation',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Gas laws, liquid state, solid state'
  },
  {
    id: 'chem_005',
    subject: 'Chemistry',
    name: 'Thermodynamics',
    prerequisites: ['chem_001'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 5,
    description: 'Enthalpy, entropy, Gibbs energy, spontaneity'
  },
  {
    id: 'chem_006',
    subject: 'Chemistry',
    name: 'Equilibrium',
    prerequisites: ['chem_005'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 5,
    description: 'Chemical equilibrium, Le Chatelier, ionic equilibrium'
  },
  {
    id: 'chem_007',
    subject: 'Chemistry',
    name: 'Redox Reactions',
    prerequisites: ['chem_001'],
    difficulty: 'foundation',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Oxidation-reduction, balancing equations'
  },
  {
    id: 'chem_008',
    subject: 'Chemistry',
    name: 'Electrochemistry',
    prerequisites: ['chem_007'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Galvanic cells, Nernst equation, electrolysis'
  },
  {
    id: 'chem_009',
    subject: 'Chemistry',
    name: 'Chemical Kinetics',
    prerequisites: ['chem_001'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Rate of reaction, order, Arrhenius equation'
  },
  {
    id: 'chem_010',
    subject: 'Chemistry',
    name: 'Surface Chemistry',
    prerequisites: ['chem_009'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Adsorption, catalysis, colloids'
  },
  {
    id: 'chem_011',
    subject: 'Chemistry',
    name: 'Periodic Table',
    prerequisites: ['chem_002'],
    difficulty: 'foundation',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Periodic trends, s-block, p-block elements'
  },
  {
    id: 'chem_012',
    subject: 'Chemistry',
    name: 'd and f Block Elements',
    prerequisites: ['chem_011'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Transition metals, lanthanides, actinides'
  },
  {
    id: 'chem_013',
    subject: 'Chemistry',
    name: 'Coordination Compounds',
    prerequisites: ['chem_012'],
    difficulty: 'advanced',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Nomenclature, isomerism, bonding theories'
  },
  {
    id: 'chem_014',
    subject: 'Chemistry',
    name: 'Hydrocarbons',
    prerequisites: ['chem_003'],
    difficulty: 'foundation',
    estimatedHours: 10,
    neetWeightage: 5,
    description: 'Alkanes, alkenes, alkynes, aromatic compounds'
  },
  {
    id: 'chem_015',
    subject: 'Chemistry',
    name: 'Organic Compounds with Functional Groups',
    prerequisites: ['chem_014'],
    difficulty: 'intermediate',
    estimatedHours: 12,
    neetWeightage: 6,
    description: 'Alcohols, phenols, ethers, aldehydes, ketones, acids'
  },
  {
    id: 'chem_016',
    subject: 'Chemistry',
    name: 'Biomolecules',
    prerequisites: ['chem_015'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 4,
    description: 'Carbohydrates, proteins, lipids, nucleic acids'
  },
  {
    id: 'chem_017',
    subject: 'Chemistry',
    name: 'Polymers',
    prerequisites: ['chem_014'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Classification, polymerization, important polymers'
  }
];

// Biology Knowledge Graph
export const BIOLOGY_GRAPH: TopicNode[] = [
  {
    id: 'bio_001',
    subject: 'Biology',
    name: 'Living World and Classification',
    prerequisites: [],
    difficulty: 'foundation',
    estimatedHours: 4,
    neetWeightage: 2,
    description: 'Characteristics of life, taxonomy, kingdoms'
  },
  {
    id: 'bio_002',
    subject: 'Biology',
    name: 'Cell Structure',
    prerequisites: ['bio_001'],
    difficulty: 'foundation',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Cell theory, prokaryotic vs eukaryotic, organelles'
  },
  {
    id: 'bio_003',
    subject: 'Biology',
    name: 'Biomolecules',
    prerequisites: ['bio_002'],
    difficulty: 'foundation',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Carbohydrates, proteins, lipids, nucleic acids, enzymes'
  },
  {
    id: 'bio_004',
    subject: 'Biology',
    name: 'Cell Division',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Mitosis, meiosis, cell cycle'
  },
  {
    id: 'bio_005',
    subject: 'Biology',
    name: 'Genetics - Mendelian',
    prerequisites: ['bio_004'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Laws of inheritance, monohybrid, dihybrid crosses'
  },
  {
    id: 'bio_006',
    subject: 'Biology',
    name: 'Molecular Basis of Inheritance',
    prerequisites: ['bio_003', 'bio_005'],
    difficulty: 'advanced',
    estimatedHours: 12,
    neetWeightage: 7,
    description: 'DNA structure, replication, transcription, translation'
  },
  {
    id: 'bio_007',
    subject: 'Biology',
    name: 'Evolution',
    prerequisites: ['bio_005'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Origin of life, Darwin\'s theory, speciation'
  },
  {
    id: 'bio_008',
    subject: 'Biology',
    name: 'Plant Morphology',
    prerequisites: ['bio_001'],
    difficulty: 'foundation',
    estimatedHours: 6,
    neetWeightage: 3,
    description: 'Root, stem, leaf, flower, fruit structure'
  },
  {
    id: 'bio_009',
    subject: 'Biology',
    name: 'Plant Physiology - Transport',
    prerequisites: ['bio_002', 'bio_008'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Water transport, mineral nutrition, transpiration'
  },
  {
    id: 'bio_010',
    subject: 'Biology',
    name: 'Photosynthesis',
    prerequisites: ['bio_003', 'bio_009'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Light and dark reactions, C3, C4, CAM pathways'
  },
  {
    id: 'bio_011',
    subject: 'Biology',
    name: 'Respiration',
    prerequisites: ['bio_003'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Glycolysis, Krebs cycle, ETC, fermentation'
  },
  {
    id: 'bio_012',
    subject: 'Biology',
    name: 'Human Physiology - Digestion',
    prerequisites: ['bio_002', 'bio_003'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Digestive system, enzymes, absorption'
  },
  {
    id: 'bio_013',
    subject: 'Biology',
    name: 'Human Physiology - Circulation',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Heart, blood vessels, blood, lymphatic system'
  },
  {
    id: 'bio_014',
    subject: 'Biology',
    name: 'Human Physiology - Respiration',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Respiratory system, gas exchange, regulation'
  },
  {
    id: 'bio_015',
    subject: 'Biology',
    name: 'Human Physiology - Excretion',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Kidney structure, urine formation, osmoregulation'
  },
  {
    id: 'bio_016',
    subject: 'Biology',
    name: 'Neural Control',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Neuron, nerve impulse, brain, reflex action'
  },
  {
    id: 'bio_017',
    subject: 'Biology',
    name: 'Chemical Coordination',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Endocrine glands, hormones, mechanism of action'
  },
  {
    id: 'bio_018',
    subject: 'Biology',
    name: 'Reproduction in Organisms',
    prerequisites: ['bio_004'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Asexual and sexual reproduction, human reproduction'
  },
  {
    id: 'bio_019',
    subject: 'Biology',
    name: 'Reproductive Health',
    prerequisites: ['bio_018'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    neetWeightage: 4,
    description: 'Contraception, STDs, infertility'
  },
  {
    id: 'bio_020',
    subject: 'Biology',
    name: 'Immune System',
    prerequisites: ['bio_002'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    neetWeightage: 5,
    description: 'Innate and adaptive immunity, vaccines, allergies'
  },
  {
    id: 'bio_021',
    subject: 'Biology',
    name: 'Ecology',
    prerequisites: ['bio_001'],
    difficulty: 'intermediate',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Ecosystem, food chains, biogeochemical cycles'
  },
  {
    id: 'bio_022',
    subject: 'Biology',
    name: 'Biotechnology',
    prerequisites: ['bio_006'],
    difficulty: 'advanced',
    estimatedHours: 10,
    neetWeightage: 6,
    description: 'Genetic engineering, PCR, applications'
  }
];

// Combined knowledge graph
export const KNOWLEDGE_GRAPH: TopicNode[] = [
  ...PHYSICS_GRAPH,
  ...CHEMISTRY_GRAPH,
  ...BIOLOGY_GRAPH
];

// Helper functions
export const getTopicById = (id: string): TopicNode | undefined => {
  return KNOWLEDGE_GRAPH.find(topic => topic.id === id);
};

export const getPrerequisites = (topicId: string): TopicNode[] => {
  const topic = getTopicById(topicId);
  if (!topic) return [];
  return topic.prerequisites.map(id => getTopicById(id)).filter(Boolean) as TopicNode[];
};

export const getDependents = (topicId: string): TopicNode[] => {
  return KNOWLEDGE_GRAPH.filter(topic => topic.prerequisites.includes(topicId));
};

export const getTopicsBySubject = (subject: 'Physics' | 'Chemistry' | 'Biology'): TopicNode[] => {
  return KNOWLEDGE_GRAPH.filter(topic => topic.subject === subject);
};

export const getFoundationTopics = (): TopicNode[] => {
  return KNOWLEDGE_GRAPH.filter(topic => topic.difficulty === 'foundation');
};
