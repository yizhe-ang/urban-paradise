"use client";

import Experience from "@/components/Experience";
import { Canvas } from "@react-three/fiber";
import { getProject } from "@theatre/core";
import studio from "@theatre/studio";
import extension from "@theatre/r3f/dist/extension";
import { SheetProvider } from "@theatre/r3f";
import state from "@/lib/state.json";

// studio.initialize();
// studio.extend(extension);

const sheet = getProject("project", { state }).sheet("sheet");

export default function Home() {
  return (
    <div className="fixed inset-0">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover opacity-50"
        style={{
          backgroundImage: "url('./bg.svg')",
        }}
      />
      <Canvas shadows>
        <SheetProvider sheet={sheet}>
          <Experience />
        </SheetProvider>
      </Canvas>
    </div>
  );
}
