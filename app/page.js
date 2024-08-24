"use client";

import Experience from "@/components/Experience";
import { Canvas } from "@react-three/fiber";
import { getProject } from "@theatre/core";
import studio from "@theatre/studio";
import extension from "@theatre/r3f/dist/extension";
import { SheetProvider } from "@theatre/r3f";

studio.initialize();
studio.extend(extension);

const sheet = getProject("project").sheet("sheet");

export default function Home() {
  return (
    <div className="fixed inset-0">
      <Canvas shadows>
        <SheetProvider sheet={sheet}>
          <Experience />
        </SheetProvider>
      </Canvas>
    </div>
  );
}
