"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Protein } from "../types/protein";

interface ProteinInfoProps {
  protein: Protein | null;
}

// Define a type for sample proteins
type SampleProteinKey =
  | "1cbn"
  | "1hho"
  | "1gfl"
  | "4ins"
  | "1bkv"
  | "6vxx"
  | "3eiy"
  | "1ubq";

const sampleProteins: Record<SampleProteinKey, { name: string }> = {
  "1cbn": { name: "Crambin" },
  "1hho": { name: "Hemoglobin" },
  "1gfl": { name: "Green Fluorescent Protein" },
  "4ins": { name: "Insulin" },
  "1bkv": { name: "Collagen" },
  "6vxx": { name: "SARS-CoV-2 Spike protein" },
  "3eiy": { name: "Lysozyme" },
  "1ubq": { name: "Ubiquitin" },
};

export function ProteinInfo({ protein }: ProteinInfoProps) {
  if (!protein) return <div>No protein data available</div>;

  // Count residues by type
  const residueCounts: Record<string, number> = {};
  let totalResidues = 0;
  let totalAtoms = 0;

  protein.chains.forEach((chain) => {
    chain.residues.forEach((residue) => {
      residueCounts[residue.name] = (residueCounts[residue.name] || 0) + 1;
      totalResidues++;
      totalAtoms += Object.keys(residue.atoms).length;
    });
  });

  // Fix Object.entries type
  const sortedResidueCounts = Object.entries(residueCounts) as [
    string,
    number
  ][];

  // Count secondary structure elements
  const ssCount = {
    helix: 0,
    sheet: 0,
    loop: 0,
  };

  protein.chains.forEach((chain) => {
    chain.residues.forEach((residue) => {
      if (residue.ss === "H") ssCount.helix++;
      else if (residue.ss === "E") ssCount.sheet++;
      else ssCount.loop++;
    });
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="summary">
        <TabsList className="w-full">
          <TabsTrigger value="summary" className="flex-1">
            Summary
          </TabsTrigger>
          <TabsTrigger value="composition" className="flex-1">
            Composition
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex-1">
            Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardContent className="p-4 space-y-3">
              {protein.description && (
                <p className="text-sm text-muted-foreground">
                  {protein.description}
                </p>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Chains:</span>
                <span>{protein.chains.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Residues:</span>
                <span>{totalResidues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atoms:</span>
                <span>{totalAtoms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resolution:</span>
                <span>
                  {protein.resolution ? `${protein.resolution} Å` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span>{protein.experimentalMethod || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composition">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium">Amino Acid Composition</h3>
              <div className="h-40 overflow-y-auto border rounded-md p-2">
                {sortedResidueCounts
                  .sort((a, b) => b[1] - a[1])
                  .map(([residue, count]) => (
                    <div key={residue} className="flex justify-between py-1">
                      <span>
                        {getFullResidueName(residue)} ({residue})
                      </span>
                      <span>
                        {count} ({Math.round((count / totalResidues) * 100)}%)
                      </span>
                    </div>
                  ))}
              </div>

              <h3 className="text-sm font-medium">Chain Composition</h3>
              <div className="flex flex-wrap gap-2">
                {protein.chains.map((chain) => (
                  <Badge key={chain.id} variant="outline">
                    Chain {chain.id}: {chain.residues.length} residues
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium">Secondary Structure</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex-1 justify-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  Helix: {ssCount.helix} (
                  {Math.round((ssCount.helix / totalResidues) * 100)}%)
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  Sheet: {ssCount.sheet} (
                  {Math.round((ssCount.sheet / totalResidues) * 100)}%)
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  Loop: {ssCount.loop} (
                  {Math.round((ssCount.loop / totalResidues) * 100)}%)
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Structure Features</h3>
                <div className="text-sm text-muted-foreground">
                  {getStructureDescription(protein)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get full residue names
function getFullResidueName(code: string): string {
  const residueNames: Record<string, string> = {
    ALA: "Alanine",
    ARG: "Arginine",
    ASN: "Asparagine",
    ASP: "Aspartic acid",
    CYS: "Cysteine",
    GLN: "Glutamine",
    GLU: "Glutamic acid",
    GLY: "Glycine",
    HIS: "Histidine",
    ILE: "Isoleucine",
    LEU: "Leucine",
    LYS: "Lysine",
    MET: "Methionine",
    PHE: "Phenylalanine",
    PRO: "Proline",
    SER: "Serine",
    THR: "Threonine",
    TRP: "Tryptophan",
    TYR: "Tyrosine",
    VAL: "Valine",
    HYP: "Hydroxyproline",
    HOH: "Water",
  };

  return residueNames[code] || code;
}

// Helper function to get structure description based on protein ID
function getStructureDescription(protein: Protein): string {
  const descriptions = {
    "1cbn":
      "Crambin has a compact structure with three disulfide bridges that contribute to its exceptional stability.",
    "1hho":
      "Hemoglobin has a quaternary structure with four subunits arranged in a tetrahedral configuration, each containing a heme group that binds oxygen.",
    "1gfl":
      "Green Fluorescent Protein has a distinctive beta-barrel structure (like a can) with the fluorophore located in the center of the barrel.",
    "4ins":
      "Insulin consists of two chains (A and B) connected by disulfide bonds, with alpha-helical regions that are important for receptor binding.",
    "1bkv":
      "Collagen has a unique triple-helical structure with a repeating sequence pattern (often Gly-X-Y) that allows tight packing.",
    "6vxx":
      "The SARS-CoV-2 Spike protein is a trimeric glycoprotein with a large ectodomain that includes the receptor-binding domain (RBD).",
    "3eiy":
      "Lysozyme has a mixed alpha/beta structure with a deep cleft that forms the active site for substrate binding.",
    "1ubq":
      "Ubiquitin has a compact globular structure with a mixed alpha/beta fold, featuring a beta-grasp motif.",
  };

  const pdbId = Object.keys(descriptions).find(
    (id) => protein.name === sampleProteins[id as SampleProteinKey]?.name
  );

  return (
    descriptions[pdbId as keyof typeof descriptions] ||
    "This protein has a unique three-dimensional structure determined by its amino acid sequence."
  );
}
