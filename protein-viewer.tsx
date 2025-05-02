"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stats } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Rotate3D,
  ZoomIn,
  RefreshCw,
  Camera,
  Lightbulb,
  Maximize2,
} from "lucide-react";
import { ProteinModel } from "./components/protein-model";
import { ProteinInfo } from "./components/protein-info";
import { ColorSchemeSelector } from "./components/color-scheme-selector";
import { VisualizationControls } from "./components/visualization-controls";
import { sampleProteins } from "./data/sample-proteins";

export default function ProteinViewer() {
  const [pdbId, setPdbId] = useState("1cbn");
  const [protein, setProtein] = useState(sampleProteins["1cbn"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visualizationMode, setVisualizationMode] = useState("cartoon");
  const [colorScheme, setColorScheme] = useState("chainId");
  const [quality, setQuality] = useState("medium");
  const [showSideChains, setShowSideChains] = useState(false);
  const [showHydrogens, setShowHydrogens] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAxes, setShowAxes] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(1.0);
  const [environmentPreset, setEnvironmentPreset] = useState("city");
  const [cameraPosition, setCameraPosition] = useState([0, 0, 100]);
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef();
  const canvasRef = useRef();

  // Handle PDB ID input
  const handlePdbSubmit = async (e) => {
    e.preventDefault();

    if (!pdbId.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Check if it's one of our sample proteins first
      if (sampleProteins[pdbId.toLowerCase()]) {
        setProtein(sampleProteins[pdbId.toLowerCase()]);
        setLoading(false);
        return;
      }

      // In a real app, we would fetch from PDB here
      // For this demo, we'll just simulate a fetch
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // If not a known sample, show error
      setError(
        `Protein with PDB ID "${pdbId}" not found. Try 1cbn, 1ubq, 3eiy, 1hho, 1gfl, 4ins, 1bkv, or 6vxx.`
      );
    } catch (err) {
      setError("Failed to load protein data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load a sample protein
  const loadSampleProtein = (id) => {
    setPdbId(id);
    setProtein(sampleProteins[id]);
    setError("");
  };

  // Reset camera view
  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Take a screenshot
  const takeScreenshot = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.setAttribute("download", `${pdbId}-${visualizationMode}.png`);
      link.setAttribute(
        "href",
        canvasRef.current
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream")
      );
      link.click();
    }
  };

  // Quality settings
  const qualitySettings = {
    low: { detail: 5 },
    medium: { detail: 10 },
    high: { detail: 15 },
  };

  // Environment presets
  const environmentPresets = [
    "sunset",
    "dawn",
    "night",
    "warehouse",
    "forest",
    "apartment",
    "studio",
    "city",
    "park",
    "lobby",
  ];

  // Update canvas ref when the component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.querySelector("canvas");
      if (canvas) {
        canvasRef.current = canvas;
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Protein App</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Protein Explorer</CardTitle>
              <CardDescription>
                Visualize and analyze protein structures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="search">
                <TabsList className="w-full">
                  <TabsTrigger value="search" className="flex-1">
                    Search PDB
                  </TabsTrigger>
                  <TabsTrigger value="samples" className="flex-1">
                    Sample Proteins
                  </TabsTrigger>
                  <TabsTrigger value="info" className="flex-1">
                    Protein Info
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                  <form onSubmit={handlePdbSubmit} className="flex space-x-2">
                    <Input
                      value={pdbId}
                      onChange={(e) => setPdbId(e.target.value)}
                      placeholder="Enter PDB ID (e.g., 1cbn)"
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Loading..." : "Load"}
                    </Button>
                  </form>

                  {error && <div className="text-sm text-red-500">{error}</div>}

                  <div className="text-sm text-muted-foreground">
                    Enter a PDB ID to load a protein structure from the Protein
                    Data Bank. For this demo, try: 1cbn (Crambin), 1ubq
                    (Ubiquitin), 3eiy (Lysozyme), 1hho (Hemoglobin), 1gfl (GFP),
                    4ins (Insulin), 1bkv (Collagen), or 6vxx (SARS-CoV-2 Spike).
                  </div>
                </TabsContent>

                <TabsContent value="samples">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(sampleProteins).map(([id, data]) => (
                      <Button
                        key={id}
                        variant="outline"
                        onClick={() => loadSampleProtein(id)}
                        className={pdbId === id ? "border-primary" : ""}
                      >
                        {data.name} ({id.toUpperCase()})
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="info">
                  <ProteinInfo protein={protein} />
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Rendering Options</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-stats">Show Performance Stats</Label>
                      <Switch
                        id="show-stats"
                        checked={showStats}
                        onCheckedChange={setShowStats}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-axes">Show Coordinate Axes</Label>
                      <Switch
                        id="show-axes"
                        checked={showAxes}
                        onCheckedChange={setShowAxes}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-rotate">Auto-Rotate Model</Label>
                      <Switch
                        id="auto-rotate"
                        checked={autoRotate}
                        onCheckedChange={setAutoRotate}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Lighting</h3>
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <Slider
                        value={[lightIntensity]}
                        min={0}
                        max={2}
                        step={0.1}
                        onValueChange={(value) => setLightIntensity(value[0])}
                      />
                      <span className="text-sm">
                        {lightIntensity.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Environment</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {environmentPresets.map((preset) => (
                        <Button
                          key={preset}
                          variant={
                            environmentPreset === preset ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setEnvironmentPreset(preset)}
                        >
                          {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-6 pt-4">
                <VisualizationControls
                  visualizationMode={visualizationMode}
                  setVisualizationMode={setVisualizationMode}
                  showSideChains={showSideChains}
                  setShowSideChains={setShowSideChains}
                  showHydrogens={showHydrogens}
                  setShowHydrogens={setShowHydrogens}
                  showWater={showWater}
                  setShowWater={setShowWater}
                />

                <ColorSchemeSelector
                  colorScheme={colorScheme}
                  setColorScheme={setColorScheme}
                />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Rendering Quality</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant={quality === "low" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuality("low")}
                    >
                      Low
                    </Button>
                    <Button
                      variant={quality === "medium" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuality("medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      variant={quality === "high" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuality("high")}
                    >
                      High
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D Visualization */}
        <div>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                {protein.name} ({pdbId.toUpperCase()})
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetView}
                  title="Reset View"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={takeScreenshot}
                  title="Take Screenshot"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCameraPosition([0, 0, cameraPosition[2] * 0.8])
                  }
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas && canvas.requestFullscreen) {
                      canvas.requestFullscreen();
                    }
                  }}
                  title="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[700px] p-0 relative" ref={canvasRef}>
              <div className="absolute top-4 left-4 z-10 bg-black/10 backdrop-blur-sm rounded-md p-2 text-white text-sm">
                <div className="flex items-center space-x-2">
                  <Rotate3D className="h-4 w-4" />
                  <span>Drag to rotate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ZoomIn className="h-4 w-4" />
                  <span>Scroll to zoom</span>
                </div>
              </div>

              <Canvas camera={{ position: cameraPosition, fov: 50 }}>
                {showStats && <Stats />}
                <ambientLight intensity={lightIntensity * 0.5} />
                <pointLight
                  position={[10, 10, 10]}
                  intensity={lightIntensity}
                />
                <ProteinModel
                  protein={protein}
                  visualizationMode={visualizationMode}
                  colorScheme={colorScheme}
                  quality={qualitySettings[quality]}
                  showSideChains={showSideChains}
                  showHydrogens={showHydrogens}
                  showWater={showWater}
                />
                <OrbitControls
                  ref={controlsRef}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={10}
                  maxDistance={500}
                  autoRotate={autoRotate}
                  autoRotateSpeed={1}
                />
                <Environment preset={environmentPreset} />
                {showAxes && (
                  <>
                    <axesHelper args={[50]} />
                    <gridHelper args={[100, 100]} />
                  </>
                )}
              </Canvas>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
