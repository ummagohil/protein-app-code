"use client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VisualizationControlsProps {
  visualizationMode: string;
  setVisualizationMode: (mode: string) => void;
  showSideChains: boolean;
  setShowSideChains: (show: boolean) => void;
  showHydrogens: boolean;
  setShowHydrogens: (show: boolean) => void;
  showWater: boolean;
  setShowWater: (show: boolean) => void;
}

export function VisualizationControls({
  visualizationMode,
  setVisualizationMode,
  showSideChains,
  setShowSideChains,
  showHydrogens,
  setShowHydrogens,
  showWater,
  setShowWater,
}: VisualizationControlsProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="mode">
        <TabsList className="w-full">
          <TabsTrigger value="mode" className="flex-1">
            Mode
          </TabsTrigger>
          <TabsTrigger value="options" className="flex-1">
            Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mode" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                visualizationMode === "cartoon"
                  ? "bg-primary/10 border-primary"
                  : ""
              }`}
              onClick={() => setVisualizationMode("cartoon")}
            >
              <div className="font-medium mb-1">Cartoon</div>
              <div className="text-xs text-muted-foreground">
                Simplified representation showing secondary structure
              </div>
            </div>

            <div
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                visualizationMode === "ball-and-stick"
                  ? "bg-primary/10 border-primary"
                  : ""
              }`}
              onClick={() => setVisualizationMode("ball-and-stick")}
            >
              <div className="font-medium mb-1">Ball & Stick</div>
              <div className="text-xs text-muted-foreground">
                Shows atoms and bonds clearly
              </div>
            </div>

            <div
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                visualizationMode === "space-filling"
                  ? "bg-primary/10 border-primary"
                  : ""
              }`}
              onClick={() => setVisualizationMode("space-filling")}
            >
              <div className="font-medium mb-1">Space Filling</div>
              <div className="text-xs text-muted-foreground">
                Shows atoms at their van der Waals radii
              </div>
            </div>

            <div
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                visualizationMode === "surface"
                  ? "bg-primary/10 border-primary"
                  : ""
              }`}
              onClick={() => setVisualizationMode("surface")}
            >
              <div className="font-medium mb-1">Surface</div>
              <div className="text-xs text-muted-foreground">
                Shows molecular surface
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-side-chains">Show Side Chains</Label>
            <Switch
              id="show-side-chains"
              checked={showSideChains}
              onCheckedChange={setShowSideChains}
              disabled={
                visualizationMode === "cartoon" ||
                visualizationMode === "surface"
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-hydrogens">Show Hydrogens</Label>
            <Switch
              id="show-hydrogens"
              checked={showHydrogens}
              onCheckedChange={setShowHydrogens}
              disabled={
                visualizationMode === "cartoon" ||
                visualizationMode === "surface"
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-water">Show Water Molecules</Label>
            <Switch
              id="show-water"
              checked={showWater}
              onCheckedChange={setShowWater}
              disabled={
                visualizationMode === "cartoon" ||
                visualizationMode === "surface"
              }
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
