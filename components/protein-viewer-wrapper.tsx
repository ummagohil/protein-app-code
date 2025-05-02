"use client";

import dynamic from "next/dynamic";
import { FC } from "react";

// Use dynamic import with no SSR to ensure the component only loads on the client
const ProteinViewer = dynamic(() => import("../protein-viewer"), {
  ssr: false,
});

const ProteinViewerWrapper: FC = () => {
  return (
    <div className="w-full min-h-screen">
      <ProteinViewer />
    </div>
  );
};

export default ProteinViewerWrapper;
