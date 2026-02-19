/**
 * Concept Mapper Utility
 * Maps labels to NEET subject concepts for mistake tracking
 */

interface ConceptMapping {
  subject: string;
  topic: string;
  keywords: string[];
}

// NEET Biology concepts
const BIOLOGY_CONCEPTS: ConceptMapping[] = [
  {
    subject: "biology",
    topic: "cell_biology",
    keywords: [
      "cell",
      "nucleus",
      "mitochondria",
      "ribosome",
      "membrane",
      "cytoplasm",
      "organelle",
    ],
  },
  {
    subject: "biology",
    topic: "human_physiology",
    keywords: [
      "heart",
      "lung",
      "kidney",
      "liver",
      "brain",
      "blood",
      "artery",
      "vein",
    ],
  },
  {
    subject: "biology",
    topic: "plant_physiology",
    keywords: [
      "leaf",
      "root",
      "stem",
      "flower",
      "chloroplast",
      "stomata",
      "xylem",
      "phloem",
    ],
  },
  {
    subject: "biology",
    topic: "genetics",
    keywords: ["dna", "rna", "gene", "chromosome", "allele", "mutation"],
  },
  {
    subject: "biology",
    topic: "ecology",
    keywords: ["ecosystem", "food chain", "population", "community", "biome"],
  },
];

// NEET Physics concepts
const PHYSICS_CONCEPTS: ConceptMapping[] = [
  {
    subject: "physics",
    topic: "mechanics",
    keywords: [
      "force",
      "motion",
      "velocity",
      "acceleration",
      "friction",
      "momentum",
    ],
  },
  {
    subject: "physics",
    topic: "optics",
    keywords: ["lens", "mirror", "light", "reflection", "refraction", "prism"],
  },
  {
    subject: "physics",
    topic: "electricity",
    keywords: [
      "circuit",
      "current",
      "voltage",
      "resistance",
      "capacitor",
      "battery",
    ],
  },
  {
    subject: "physics",
    topic: "magnetism",
    keywords: ["magnet", "magnetic field", "electromagnet", "flux"],
  },
];

// NEET Chemistry concepts
const CHEMISTRY_CONCEPTS: ConceptMapping[] = [
  {
    subject: "chemistry",
    topic: "organic",
    keywords: [
      "benzene",
      "alkane",
      "alkene",
      "alcohol",
      "acid",
      "ester",
      "functional group",
    ],
  },
  {
    subject: "chemistry",
    topic: "inorganic",
    keywords: ["metal", "ion", "salt", "acid", "base", "compound", "element"],
  },
  {
    subject: "chemistry",
    topic: "physical",
    keywords: [
      "reaction",
      "equilibrium",
      "thermodynamics",
      "kinetics",
      "solution",
    ],
  },
];

const ALL_CONCEPTS = [
  ...BIOLOGY_CONCEPTS,
  ...PHYSICS_CONCEPTS,
  ...CHEMISTRY_CONCEPTS,
];

/**
 * Generate concept ID from label text
 * Format: subject.topic.normalized_label
 */
export function generateConceptId(labelText: string): string {
  const normalized = labelText.toLowerCase().trim();

  // Find matching concept based on keywords
  for (const concept of ALL_CONCEPTS) {
    for (const keyword of concept.keywords) {
      if (normalized.includes(keyword)) {
        const labelSlug = normalized
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        return `${concept.subject}.${concept.topic}.${labelSlug}`;
      }
    }
  }

  // Default to general if no match
  const labelSlug = normalized.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  return `general.anatomy.${labelSlug}`;
}

/**
 * Extract subject from concept ID
 */
export function getSubjectFromConceptId(conceptId: string): string {
  return conceptId.split(".")[0] || "general";
}

/**
 * Extract topic from concept ID
 */
export function getTopicFromConceptId(conceptId: string): string {
  return conceptId.split(".")[1] || "general";
}

/**
 * Get human-readable concept name
 */
export function getConceptDisplayName(conceptId: string): string {
  const parts = conceptId.split(".");
  if (parts.length < 3) return conceptId;

  const label = parts[2].replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
