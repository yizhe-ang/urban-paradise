import { MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { editable as e } from "@theatre/r3f";
import { Instance, Instances } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material";
import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

const Water = ({ size, gridData }) => {
  // FIXME: How to animate water?

  const waterTexture = useTexture("/textures/water.jpg");
  waterTexture.repeat = new THREE.Vector2(1, 1);
  waterTexture.wrapS = THREE.RepeatWrapping;
  waterTexture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <Instances
        limit={size ** 2}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <MeshTransmissionMaterial
          color={new THREE.Color("#55aaff")
            .convertSRGBToLinear()
            .multiplyScalar(3)}
          ior={1.4}
          thickness={1.5}
          roughness={2}
          metalness={0.025}
          roughnessMap={waterTexture}
          metalnessMap={waterTexture}
        />
        {Array.from({ length: size }).map((_, i) => {
          return Array.from({ length: size }).map((_, j) => {
            // const isTerrain = gridData[i][j].isTerrain;

            // if (!isTerrain) return;

            const x = i - size / 2;
            const z = j - size / 2;
            const y = size / 2 - x + (size / 2 - z) - size / 2;

            let noise = (noise2D(i * 0.2, j * 0.2) + 1) * 0.5;
            noise = Math.pow(noise, 3);

            const scaleY = noise * 1;

            return (
              <Instance
                key={i * size + j}
                size={size}
                position={[x, y + scaleY / 2 - size / 2, z]}
                scale={[1, scaleY, 1]}
              />
            );
          });
        })}
      </Instances>
    </>
  );
};

export default Water;
