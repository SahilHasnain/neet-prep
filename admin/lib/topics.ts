export const TOPICS = {
  Physics: [
    { id: "phy_001", name: "Units and Measurements" },
    { id: "phy_002", name: "Kinematics" },
    { id: "phy_003", name: "Laws of Motion" },
    { id: "phy_004", name: "Work, Energy and Power" },
    { id: "phy_005", name: "Rotational Motion" },
    { id: "phy_006", name: "Gravitation" },
    { id: "phy_007", name: "Properties of Matter" },
    { id: "phy_008", name: "Thermodynamics" },
    { id: "phy_009", name: "Oscillations" },
    { id: "phy_010", name: "Waves and Sound" },
    { id: "phy_011", name: "Electrostatics" },
    { id: "phy_012", name: "Current Electricity" },
    { id: "phy_013", name: "Magnetism" },
    { id: "phy_014", name: "Electromagnetic Induction" },
    { id: "phy_015", name: "Optics" },
    { id: "phy_016", name: "Modern Physics" },
  ],
  Chemistry: [
    { id: "chem_001", name: "Basic Concepts" },
    { id: "chem_002", name: "Atomic Structure" },
    { id: "chem_003", name: "States of Matter" },
    { id: "chem_004", name: "Thermodynamics" },
    { id: "chem_005", name: "Chemical Equilibrium" },
    { id: "chem_006", name: "Redox Reactions" },
    { id: "chem_007", name: "Chemical Kinetics" },
    { id: "chem_008", name: "Organic Chemistry Basics" },
    { id: "chem_009", name: "Hydrocarbons" },
    { id: "chem_010", name: "Biomolecules" },
  ],
  Biology: [
    { id: "bio_001", name: "Living World and Classification" },
    { id: "bio_002", name: "Cell Structure" },
    { id: "bio_003", name: "Biomolecules" },
    { id: "bio_004", name: "Cell Division" },
    { id: "bio_005", name: "Genetics" },
    { id: "bio_006", name: "Molecular Basis of Inheritance" },
    { id: "bio_007", name: "Evolution" },
    { id: "bio_008", name: "Human Physiology" },
    { id: "bio_009", name: "Plant Physiology" },
    { id: "bio_010", name: "Ecology" },
  ],
};

export function getTopicName(topicId: string): string {
  for (const subject of Object.values(TOPICS)) {
    const topic = subject.find((t) => t.id === topicId);
    if (topic) return topic.name;
  }
  return topicId;
}
