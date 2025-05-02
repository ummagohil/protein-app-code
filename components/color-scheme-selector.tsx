"use client";
import { Badge } from "@/components/ui/badge";
import { Dispatch, SetStateAction } from "react";

interface ColorScheme {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface ColorSchemeSelectorProps {
  colorScheme: string;
  setColorScheme: Dispatch<SetStateAction<string>>;
}

export function ColorSchemeSelector({
  colorScheme,
  setColorScheme,
}: ColorSchemeSelectorProps) {
  const colorSchemes = [
    {
      id: "chainId",
      name: "Chain ID",
      color: "#3498db",
      description: "Colors each chain differently",
    },
    {
      id: "residueType",
      name: "Residue Type",
      color: "#2ecc71",
      description: "Colors by amino acid type",
    },
    {
      id: "secondaryStructure",
      name: "Secondary Structure",
      color: "#e74c3c",
      description: "Colors helices, sheets, and loops differently",
    },
    {
      id: "bFactor",
      name: "B-Factor",
      color: "#f39c12",
      description: "Colors by temperature factor (flexibility)",
    },
    {
      id: "hydrophobicity",
      name: "Hydrophobicity",
      color: "#9b59b6",
      description: "Colors by amino acid hydrophobicity",
    },
    {
      id: "charge",
      name: "Charge",
      color: "#1abc9c",
      description: "Colors by amino acid charge",
    },
    {
      id: "cpk",
      name: "CPK (Element)",
      color: "#34495e",
      description: "Standard coloring by element type",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Color Scheme</h3>

      <div className="grid grid-cols-2 gap-2">
        {colorSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className={`border rounded-md p-2 cursor-pointer transition-colors ${
              colorScheme === scheme.id ? "bg-primary/10 border-primary" : ""
            }`}
            onClick={() => setColorScheme(scheme.id)}
          >
            <div className="flex items-center">
              <Badge
                className="w-3 h-3 p-0 mr-2"
                style={{ backgroundColor: scheme.color }}
              />
              <span className="font-medium text-sm">{scheme.name}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {scheme.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
