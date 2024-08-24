import { Instance, Instances } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material";
import * as THREE from "three";

const geometry = new THREE.PlaneGeometry(1, 1);
geometry.rotateX(-Math.PI / 2);

const Terrain = ({ size = 40 }) => {
  return (
    <Instances limit={size ** 2} castShadow receiveShadow frustumCulled={false}>
      <primitive object={geometry} />
      <CustomShaderMaterial
        baseMaterial={THREE.MeshPhysicalMaterial}
        silent
        color="red"
      />
      {Array.from({ length: size }).map((_, i) => {
        return Array.from({ length: size }).map((_, j) => {
          const x = i - size / 2;
          const z = j - size / 2;
          const y = size / 2 - x + (size / 2 - z) - size / 2;

          return (
            <Instance
              key={i * size + j}
              size={size}
              position={[x, y - size / 2, z]}
            />
          );
        });
      })}
    </Instances>
  );
};

export default Terrain;
