import {
  Effects,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import Buildings from "./Buildings";
import { editable as e } from "@theatre/r3f";
import * as THREE from "three";
import Terrain from "./Terrain";
import Water from "./Water";
import Trees from "./Trees";
import { useMemo } from "react";
import { range } from "d3-array";

const size = 40;

const Experience = () => {
  // Generate grid data
  const gridData = useMemo(() => {
    return range(size).map((i) => {
      return range(size).map((j) => {
        const isTerrain = Math.random() < 0.3;

        return {
          isTerrain,
        };
      });
    });
  }, []);

  return (
    <>
      {/* STAGING */}
      {/* <color attach="background" args={["lightblue"]} /> */}
      <color attach="background" args={["#c6e5db"]} />
      {/* <fog attach="fog" args={["black", 10, 30]} /> */}

      {/* <Environment resolution={128}>
        <Lightformer
          form="circle"
          intensity={1}
          position={[10, 10, -10]}
          scale={10}
          onCreated={(self) => self.lookAt(0, 0, 0)}
        />
        <Lightformer
          intensity={6}
          rotation-y={Math.PI / 2}
          position={[-5, 1, -1]}
          scale={[50, 2, 1]}
        />
      </Environment> */}
      <Environment files="/envmaps/envmap.hdr"></Environment>

      {/* LIGHTS */}
      <ambientLight intensity={0.1} />
      {/* <directionalLight castShadow intensity={1.0} position={[5, 25, 20]} /> */}
      <e.pointLight
        theatreKey="pointLight"
        color={
          new THREE.Color("#FFCB8E").convertSRGBToLinear()
          // .convertSRGBToLinear()
        }
        intensity={80}
        distance={200}
        position={[10, 20, 10]}
        castShadow
        shadow-mapSize={[2046, 2046]}
        // shadow-radius={10}
        // shadow-camera-top={4}
        // shadow-camera-right={4}
        // shadow-camera-bottom={-4}
        // shadow-camera-left={-4}
        // shadow-camera-near={0.1}
        // shadow-camera-far={6}
      />

      {/* CAMERA */}
      <OrthographicCamera
        makeDefault
        position={[100, 100, 100]}
        zoom={50}
      ></OrthographicCamera>
      <OrbitControls />

      {/* SCENE */}
      <Buildings size={size} gridData={gridData} />

      {/* <Water size={size} gridData={gridData} /> */}

      {/* <Trees size={size} gridData={gridData} /> */}

      {/* TODO: Add grain */}
    </>
  );
};

export default Experience;
