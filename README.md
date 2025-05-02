# 🧬 Protein app

This app uses mock data for 3D visuals of proteins.

## 🖥️ Protein Viewer

The protein viewer component is not SSR and sits at the root of the app. It is here where the main dashboard sits for the application.

The view of the proteins is handled by `canvas`. Functionality for taking screenshots and resetting the view are illustrated below.

```ts
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
```

To ensure the canvas updates correctly when it is changed by the user, a useEffect has been put in place.

```ts
// Update canvas ref when the component mounts
useEffect(() => {
  if (canvasRef.current) {
    const canvas = canvasRef.current.querySelector("canvas");
    if (canvas) {
      canvasRef.current = canvas;
    }
  }
}, []);
```

## ⚙️ Protein Model
The model enables you to view different versions of proteins, for example ball and stick or space filling. The visuals are created from **Three**.

## 🗒️ Protein Info

This component gives a break down of details for the protein selected.

## 🧪 Testing

`npm run test`

The app uses Vitest and there are currently two unit tests, **protein-model** and **protein-info**.
