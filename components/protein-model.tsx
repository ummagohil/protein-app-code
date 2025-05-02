"use client";

import { useRef, useMemo } from "react";
import {
  Tube,
  Line,
  Instances,
  Instance,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { Vector3, CatmullRomCurve3, Color, DoubleSide } from "three";
import { useFrame } from "@react-three/fiber";
import { getColorByScheme } from "../utils/protein-colors";
import { Protein, Residue } from "../types/protein";
import * as THREE from "three";

// Add types to Helix component
interface HelixProps {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
  turns: number;
  segments?: number;
}

function Helix({
  start,
  end,
  radius,
  color,
  turns,
  segments = 30,
}: HelixProps) {
  const points = useMemo(() => {
    const startVec = new Vector3(start[0], start[1], start[2]);
    const endVec = new Vector3(end[0], end[1], end[2]);
    const direction = new Vector3().subVectors(endVec, startVec);
    const length = direction.length();

    const curve = [];
    const helixRadius = 1.5;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;

      const x = startVec.x + direction.x * t + Math.cos(angle) * helixRadius;
      const y = startVec.y + direction.y * t + Math.sin(angle) * helixRadius;
      const z = startVec.z + direction.z * t;

      curve.push(new Vector3(x, y, z));
    }

    return new CatmullRomCurve3(curve);
  }, [start, end, turns, segments]);

  return (
    <Tube args={[points, 64, radius, 8, false]}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
    </Tube>
  );
}

// Add types to BetaSheet component
interface BetaSheetProps {
  points: [number, number, number][];
  width?: number;
  color: string;
}

function BetaSheet({ points, width = 3, color }: BetaSheetProps) {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(points.map((p) => new Vector3(p[0], p[1], p[2]))),
    [points]
  );

  return (
    <Tube args={[curve, 64, width, 8, false]}>
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.3}
        side={DoubleSide}
        flatShading
      />
    </Tube>
  );
}

// Ensure the Atom interface is defined correctly
interface Atom {
  element: Element; // Ensure this matches the defined elements
  residueName: string; // Ensure this matches the defined residues
  ss?: string; // Optional
  chainId: string; // Ensure this is included
}

// Update the ProteinModelProps to include the correct type for quality
interface Quality {
  detail: number; // Ensure this is defined as an object
}

interface ProteinModelProps {
  protein: Protein | null;
  visualizationMode: string;
  colorScheme: string;
  quality: Quality; // Update this line
  showSideChains: boolean;
  showHydrogens: boolean;
  showWater: boolean;
}

export function ProteinModel({
  protein,
  visualizationMode,
  colorScheme,
  quality,
  showSideChains,
  showHydrogens,
  showWater,
}: ProteinModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate the protein slightly for animation effect
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Generate secondary structure elements for cartoon representation
  const secondaryStructures = useMemo(() => {
    if (!protein || !protein.chains || visualizationMode !== "cartoon")
      return [];

    const structures: {
      type: string | null;
      residues: Residue[];
      chainId: string;
    }[] = [];

    // For each chain in the protein
    protein.chains.forEach((chain) => {
      // Group residues by secondary structure
      let currentStructure: { type: string | null; residues: Residue[] } = {
        type: null,
        residues: [],
      };

      chain.residues.forEach((residue, index) => {
        if (
          residue.ss !== currentStructure.type &&
          currentStructure.residues.length > 0
        ) {
          // Save the current structure and start a new one
          structures.push({
            ...currentStructure,
            chainId: chain.id,
          });
          currentStructure = { type: residue.ss, residues: [residue] };
        } else {
          // Add to the current structure
          currentStructure.type = residue.ss;
          currentStructure.residues.push(residue);
        }
      });

      // Add the last structure
      if (currentStructure.residues.length > 0) {
        structures.push({
          ...currentStructure,
          chainId: chain.id,
        });
      }
    });

    return structures;
  }, [protein, visualizationMode]);

  // Generate atoms for ball-and-stick or space-filling representation
  const atoms = useMemo(() => {
    if (!protein || !protein.chains) return [];

    const atomsList: {
      position: [number, number, number];
      element: string;
      radius: number;
      chainId: string;
      residueName: string;
      residueIndex: number;
      atomName: string;
      isBackbone: boolean;
      ss: string;
    }[] = [];

    // For each chain in the protein
    protein.chains.forEach((chain, chainIndex) => {
      // For each residue in the chain
      chain.residues.forEach((residue, residueIndex) => {
        // For each atom in the residue
        Object.entries(residue.atoms).forEach(([atomName, atom]) => {
          // Skip hydrogens if not showing them
          if (!showHydrogens && atomName.startsWith("H")) return;

          // Skip water molecules if not showing them
          if (!showWater && residue.name === "HOH") return;

          // Skip side chain atoms if not showing them and not part of the backbone
          const isBackbone = ["N", "CA", "C", "O"].includes(atomName);
          if (!showSideChains && !isBackbone && residue.name !== "HOH") return;

          atomsList.push({
            position: [atom.x, atom.y, atom.z],
            element: atom.element,
            radius: atom.radius || 1.0,
            chainId: chain.id,
            residueName: residue.name,
            residueIndex: residueIndex,
            atomName: atomName,
            isBackbone: isBackbone,
            ss: residue.ss,
          });
        });
      });
    });

    return atomsList;
  }, [protein, showSideChains, showHydrogens, showWater]);

  // Generate bonds for ball-and-stick representation
  const bonds = useMemo(() => {
    if (!protein || !protein.chains || visualizationMode !== "ball-and-stick")
      return [];

    const bondsList: {
      start: [number, number, number];
      end: [number, number, number];
      chainId: string;
    }[] = [];

    // For each chain in the protein
    protein.chains.forEach((chain) => {
      // For each residue in the chain
      chain.residues.forEach((residue) => {
        // Add bonds within the residue
        if (residue.bonds) {
          residue.bonds.forEach((bond) => {
            const atom1 = residue.atoms[bond[0]];
            const atom2 = residue.atoms[bond[1]];

            // Skip if either atom doesn't exist
            if (!atom1 || !atom2) return;

            // Skip hydrogens if not showing them
            if (
              !showHydrogens &&
              (bond[0].startsWith("H") || bond[1].startsWith("H"))
            )
              return;

            // Skip side chain bonds if not showing them
            const isBackbond1 = ["N", "CA", "C", "O"].includes(bond[0]);
            const isBackbond2 = ["N", "CA", "C", "O"].includes(bond[1]);
            if (!showSideChains && !isBackbond1 && !isBackbond2) return;

            bondsList.push({
              start: [atom1.x, atom1.y, atom1.z],
              end: [atom2.x, atom2.y, atom2.z],
              chainId: chain.id,
            });
          });
        }
      });
    });

    return bondsList;
  }, [protein, visualizationMode, showSideChains, showHydrogens]);

  if (!protein || !protein.chains) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Cartoon/Ribbon Representation */}
      {visualizationMode === "cartoon" && (
        <>
          {secondaryStructures.map((structure, index) => {
            const color = getColorByScheme(
              {
                chainId: structure.chainId,
                ss: structure.type ? structure.type : ("default" as any),
                element: "default",
                residueName: "default",
              }, // Handle null case
              colorScheme
            );

            if (structure.type === "H") {
              // Alpha Helix
              const startResidue = structure.residues[0];
              const endResidue =
                structure.residues[structure.residues.length - 1];

              if (!startResidue.atoms.CA || !endResidue.atoms.CA) return null;

              const start: [number, number, number] = [
                startResidue.atoms.CA.x,
                startResidue.atoms.CA.y,
                startResidue.atoms.CA.z,
              ];
              const end: [number, number, number] = [
                endResidue.atoms.CA.x,
                endResidue.atoms.CA.y,
                endResidue.atoms.CA.z,
              ];

              return (
                <Helix
                  key={`helix-${index}`}
                  start={start}
                  end={end}
                  radius={1.2}
                  color={color}
                  turns={structure.residues.length / 3.6} // ~3.6 residues per turn in alpha helix
                  segments={structure.residues.length * 3}
                />
              );
            } else if (structure.type === "E") {
              // Beta Sheet
              const points: [number, number, number][] = structure.residues
                .filter((r) => r.atoms.CA)
                .map((r) => [r.atoms.CA.x, r.atoms.CA.y, r.atoms.CA.z]);

              if (points.length < 2) return null;

              return (
                <BetaSheet
                  key={`sheet-${index}`}
                  points={points}
                  width={2.5}
                  color={color}
                />
              );
            } else {
              // Loop/Coil
              const points = structure.residues
                .filter((r) => r.atoms.CA)
                .map(
                  (r) => new Vector3(r.atoms.CA.x, r.atoms.CA.y, r.atoms.CA.z)
                );

              if (points.length < 2) return null;

              const curve = new CatmullRomCurve3(points);

              return (
                <Tube key={`loop-${index}`} args={[curve, 64, 0.6, 8, false]}>
                  <meshStandardMaterial
                    color={color}
                    roughness={0.4}
                    metalness={0.1}
                  />
                </Tube>
              );
            }
          })}
        </>
      )}

      {/* Ball-and-Stick Representation */}
      {visualizationMode === "ball-and-stick" && (
        <>
          {/* Atoms */}
          <Instances limit={atoms.length}>
            <sphereGeometry args={[1, quality.detail, quality.detail]} />
            <meshStandardMaterial />

            {atoms.map((atom, index) => (
              <Instance
                key={`atom-${index}`}
                position={atom.position}
                scale={atom.radius * 0.3}
                color={getColorByScheme(atom as any, colorScheme)}
              />
            ))}
          </Instances>

          {/* Bonds */}
          {bonds.map((bond, index) => (
            <Line
              key={`bond-${index}`}
              points={[bond.start, bond.end]}
              color={new Color("#cccccc")}
              lineWidth={2}
            />
          ))}
        </>
      )}

      {/* Space-Filling Representation */}
      {visualizationMode === "space-filling" && (
        <Instances limit={atoms.length}>
          <sphereGeometry args={[1, quality.detail, quality.detail]} />
          <meshStandardMaterial />

          {atoms.map((atom, index) => (
            <Instance
              key={`atom-${index}`}
              position={atom.position}
              scale={atom.radius}
              color={getColorByScheme(atom as any, colorScheme)}
            />
          ))}
        </Instances>
      )}

      {/* Surface Representation */}
      {visualizationMode === "surface" && (
        <mesh>
          <sphereGeometry args={[20, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={10}
            chromaticAberration={0.02}
            anisotropy={0.1}
            distortion={0.2}
            distortionScale={0.2}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color={getColorByScheme(
              { chainId: "A", element: "C", residueName: "ALA" },
              colorScheme
            )}
            transmissionSampler
            clearcoat={1}
            clearcoatRoughness={0.2}
            roughness={0.2}
            metalness={0.1}
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}
