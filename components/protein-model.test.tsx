import { render } from "@testing-library/react";
import { ProteinModel } from "../components/protein-model";
import { Protein } from "../types/protein";

describe("ProteinModel", () => {
  const mockProtein: Protein = {
    name: "1cbn",
    chains: [
      {
        id: "A",
        residues: [
          {
            name: "ALA",
            atoms: {
              CA: { x: 1, y: 2, z: 3, element: "C", radius: 1.0 },
            },
            ss: "H",
          },
        ],
      },
    ],
  };

  test("renders without crashing when protein is provided", () => {
    render(
      <ProteinModel
        protein={mockProtein}
        visualizationMode="cartoon"
        colorScheme="default"
        quality={{ detail: 2 }}
        showSideChains={true}
        showHydrogens={true}
        showWater={true}
      />
    );
  });

  test("renders null when protein is null", () => {
    const { container } = render(
      <ProteinModel
        protein={null}
        visualizationMode="cartoon"
        colorScheme="default"
        quality={{ detail: 2 }}
        showSideChains={true}
        showHydrogens={true}
        showWater={true}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
