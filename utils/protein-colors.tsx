// Color schemes for protein visualization

// CPK coloring (element-based)
const elementColors = {
  H: "#FFFFFF", // White
  C: "#909090", // Grey
  N: "#3050F8", // Blue
  O: "#FF0D0D", // Red
  S: "#FFFF30", // Yellow
  P: "#FF8000", // Orange
  F: "#90E050", // Light Green
  CL: "#1FF01F", // Green
  BR: "#A62929", // Brown
  I: "#940094", // Purple
  NA: "#AB5CF2", // Purple-Blue
  MG: "#8AFF00", // Bright Green
  CA: "#3DFF00", // Lime Green
  MN: "#9C7AC7", // Purple-Pink
  FE: "#E06633", // Orange-Brown
  ZN: "#7D80B0", // Blue-Grey
  default: "#CCCCCC", // Light Grey
};

// Residue type colors
const residueColors = {
  ALA: "#C8C8C8", // Light Grey
  ARG: "#145AFF", // Blue
  ASN: "#00DCDC", // Cyan
  ASP: "#E60A0A", // Red
  CYS: "#E6E600", // Yellow
  GLN: "#00DCDC", // Cyan
  GLU: "#E60A0A", // Red
  GLY: "#EBEBEB", // White
  HIS: "#8282D2", // Blue-Purple
  ILE: "#0F820F", // Green
  LEU: "#0F820F", // Green
  LYS: "#145AFF", // Blue
  MET: "#E6E600", // Yellow
  PHE: "#3232AA", // Dark Blue
  PRO: "#DC9682", // Pink
  SER: "#FA9600", // Orange
  THR: "#FA9600", // Orange
  TRP: "#B45AB4", // Purple
  TYR: "#3232AA", // Dark Blue
  VAL: "#0F820F", // Green
  HYP: "#DC9682", // Pink (Hydroxyproline)
  default: "#CCCCCC", // Light Grey
};

// Secondary structure colors
const ssColors = {
  H: "#FF0000", // Helix - Red
  E: "#FFFF00", // Sheet - Yellow
  C: "#00BFFF", // Coil/Loop - Blue
  default: "#CCCCCC", // Light Grey
};

// Hydrophobicity colors (Kyte & Doolittle scale)
const hydrophobicityColors = {
  ALA: "#FF0000", // Red (hydrophobic)
  ARG: "#0000FF", // Blue (hydrophilic)
  ASN: "#0000FF", // Blue (hydrophilic)
  ASP: "#0000FF", // Blue (hydrophilic)
  CYS: "#FF0000", // Red (hydrophobic)
  GLN: "#0000FF", // Blue (hydrophilic)
  GLU: "#0000FF", // Blue (hydrophilic)
  GLY: "#FFFFFF", // White (neutral)
  HIS: "#0000FF", // Blue (hydrophilic)
  ILE: "#FF0000", // Red (hydrophobic)
  LEU: "#FF0000", // Red (hydrophobic)
  LYS: "#0000FF", // Blue (hydrophilic)
  MET: "#FF0000", // Red (hydrophobic)
  PHE: "#FF0000", // Red (hydrophobic)
  PRO: "#FFFF00", // Yellow (neutral)
  SER: "#0000FF", // Blue (hydrophilic)
  THR: "#0000FF", // Blue (hydrophilic)
  TRP: "#FF0000", // Red (hydrophobic)
  TYR: "#FF0000", // Red (hydrophobic)
  VAL: "#FF0000", // Red (hydrophobic)
  default: "#CCCCCC", // Light Grey
};

// Charge colors
const chargeColors = {
  ARG: "#0000FF", // Blue (positive)
  LYS: "#0000FF", // Blue (positive)
  HIS: "#8080FF", // Light Blue (slightly positive)
  ASP: "#FF0000", // Red (negative)
  GLU: "#FF0000", // Red (negative)
  default: "#CCCCCC", // Light Grey (neutral)
};

// Chain ID colors (first 10 chains)
const chainColors = [
  "#3498db", // Blue
  "#2ecc71", // Green
  "#e74c3c", // Red
  "#f39c12", // Orange
  "#9b59b6", // Purple
  "#1abc9c", // Teal
  "#d35400", // Dark Orange
  "#c0392b", // Dark Red
  "#16a085", // Dark Teal
  "#8e44ad", // Dark Purple
];

// Define types for elements and residues
type Element = keyof typeof elementColors;
type ResidueName = keyof typeof residueColors | "HYP"; // Include "HYP" for Hydroxyproline
type SecondaryStructure = keyof typeof ssColors;
type Hydrophobicity = keyof typeof hydrophobicityColors;
type Charge = keyof typeof chargeColors;

// Update the atom type to include chainId
interface Atom {
  element: Element;
  residueName: ResidueName; // Ensure this includes all residue names
  ss?: SecondaryStructure;
  chainId: string; // Ensure chainId is included
}

// B-factor colors (temperature gradient)
function getBFactorColor(bFactor: number): string {
  // Normalize B-factor to a value between 0 and 1
  // In a real application, this would use the min/max B-factors from the structure
  const normalizedB = Math.min(Math.max(bFactor / 100, 0), 1);

  // Create a temperature gradient from blue (cold, rigid) to red (hot, flexible)
  const r = Math.floor(normalizedB * 255);
  const g = 0;
  const b = Math.floor((1 - normalizedB) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

// Get color based on the selected color scheme
export function getColorByScheme(atom: Atom, colorScheme: string): string {
  switch (colorScheme) {
    case "cpk":
      return elementColors[atom.element] || elementColors.default;

    case "residueType":
      return residueColors[atom.residueName] || residueColors.default;

    case "secondaryStructure":
      return ssColors[atom.ss || "default"] || ssColors.default;

    case "hydrophobicity":
      return (
        hydrophobicityColors[
          atom.residueName as keyof typeof hydrophobicityColors
        ] || hydrophobicityColors.default
      );

    case "charge":
      return (
        chargeColors[atom.residueName as keyof typeof chargeColors] ||
        chargeColors.default
      );

    case "chainId":
      // Use modulo to cycle through colors for many chains
      const chainIndex =
        Number.parseInt(atom.chainId) ||
        atom.chainId.charCodeAt(0) % chainColors.length;
      return chainColors[chainIndex % chainColors.length];

    case "bFactor":
      // This would require B-factor information from the PDB
      // For this demo, we'll use a random value
      return getBFactorColor(Math.random() * 100);

    default:
      return "#CCCCCC";
  }
}
