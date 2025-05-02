export interface Atom {
  x: number;
  y: number;
  z: number;
  element: string;
  radius?: number;
}

export interface Residue {
  name: string;
  ss: string;
  atoms: Record<string, Atom>;
  bonds?: [string, string][];
}

export interface Chain {
  id: string;
  residues: Residue[];
}

export interface Protein {
  chains: Chain[];
  description?: string;
  resolution?: number;
  experimentalMethod?: string;
  name?: string;
}
