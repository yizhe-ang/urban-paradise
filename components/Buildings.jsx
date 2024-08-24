import { Instance, InstancedAttribute, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { randFloat, randInt } from "three/src/math/MathUtils";
import CustomShaderMaterial from "three-custom-shader-material";
import CustomShaderMaterialVanilla from "three-custom-shader-material/vanilla";
import * as THREE from "three";
import { brickTile, tile } from "@/shaders/patterns";
import { iching } from "@/shaders/iching";
import { resolveLygia } from "resolve-lygia";
import { colors, palettesGrouped } from "@/lib/palettes";
import { shuffle } from "d3-array";
import { fbm, noise } from "@/shaders/common";
import { useControls } from "leva";
import * as easing from "maath/easing";
import * as tome from "chromotome";
import TextureAtlas from "@/lib/textureAtlas";
import { createNoise2D } from "simplex-noise";
import TransformedInstance from "./TransformedInstance";

// Handcraft colors?
// const palettes = palettesGrouped.get(2);

// TODO: Color grading
const palettes = [
  "iiso_daily",
  "iiso_curcuit",
  "iiso_zeitung",
  "iiso_airlines",
];

const noise2D = createNoise2D();

const Buildings = ({ size = 40, gridData }) => {
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uSize: { value: 30 },
      uRoof: { value: 0 },
      uTextures: { value: null },
    };
  }, []);

  const terrainTextures = useMemo(() => {
    const textures = new TextureAtlas();
    textures.Load("terrain", [
      "/textures/dirt.png",
      "/textures/dirt2.jpg",
      "/textures/grass.jpg",
      "/textures/sand.jpg",
      "/textures/stone.jpg",
    ]);

    textures.onLoad = () => {
      uniforms.uTextures.value = textures.Info["terrain"].atlas;
    };

    return textures;
  }, [uniforms]);

  const numTerrains = terrainTextures.Info["terrain"].textures.length;

  const materialProps = useMemo(() => {
    return {
      baseMaterial: THREE.MeshPhysicalMaterial,
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      silent: true,
      roughness: 0.5,
    };
  }, [uniforms]);

  useFrame(({ camera }, delta) => {
    uniforms.uTime.value += delta;
  });

  const { swarm } = useControls("Buildings", {
    swarm: false,
  });

  return (
    <Instances limit={size ** 2} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      {/* right-side */}
      <CustomShaderMaterial attach="material-0" {...materialProps} />
      {/* back-side */}
      <CustomShaderMaterial attach="material-1" {...materialProps} />
      {/* top-side */}
      <CustomShaderMaterial
        attach="material-2"
        {...materialProps}
        uniforms={{
          ...uniforms,
          uRoof: { value: 1 },
        }}
      />
      {/* bottom-side */}
      <CustomShaderMaterial attach="material-3" {...materialProps} />
      {/* left-side */}
      <CustomShaderMaterial attach="material-4" {...materialProps} />
      {/* back-side */}
      <CustomShaderMaterial attach="material-5" {...materialProps} />
      {/* depth material */}
      <CustomShaderMaterial
        attach="customDepthMaterial"
        baseMaterial={THREE.MeshDepthMaterial}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        silent
        depthPacking={THREE.RGBADepthPacking}
      />
      <InstancedAttribute name="aRandom" defaultValue={1} />
      {/* FIXME: Is this performant? */}
      <InstancedAttribute name="aRandom1" defaultValue={1} />
      <InstancedAttribute name="aIndex" defaultValue={[0, 0]} />
      <InstancedAttribute name="aColor1" defaultValue={[0, 0, 0]} />
      <InstancedAttribute name="aColor2" defaultValue={[0, 0, 0]} />
      <InstancedAttribute name="aType" defaultValue={0} />
      {Array.from({ length: size }).map((_, i) => {
        return Array.from({ length: size }).map((_, j) => {
          const x = i - size / 2;
          const z = j - size / 2;
          const y = size / 2 - x + (size / 2 - z) - size / 2;

          // const isTerrain = Math.random() < 0.3;
          const isTerrain = gridData[i][j].isTerrain;

          let noise = (noise2D(i * 0.2, j * 0.2) + 1) * 0.5;
          noise = Math.pow(noise, 1.5);

          // FIXME: Use noise instead for scale
          const scaleY = isTerrain ? 1 : 1 + noise * 4;
          const scaleX = isTerrain ? randFloat(0.9, 0.95) : randFloat(0.9, 1.0);
          const scaleZ = isTerrain ? randFloat(0.9, 0.95) : randFloat(0.9, 1.0);

          // const palette = palettes[Math.floor(Math.random() * palettes.length)];

          const palette = tome.get(palettes[randInt(0, palettes.length - 1)]);

          // TODO: Shuffle?
          // let selectedColors = palette.map((i) => {
          //   return colors[i].rgb.map((d) => d / 255);
          // });
          // selectedColors = shuffle(selectedColors)

          return (
            // <Building
            <TransformedInstance
              key={i * size + j}
              size={size}
              position={[x, y + scaleY / 2 - size / 2, z]}
              scale={[scaleX, scaleY, scaleZ]}
              aRandom={Math.random()}
              aRandom1={Math.random()}
              aIndex={[i, j]}
              // aColor1={selectedColors[0]}
              // aColor2={selectedColors[1]}
              aColor1={new THREE.Color(palette.background)}
              aColor2={
                new THREE.Color(
                  palette.colors[
                    Math.floor(Math.random() * palette.colors.length)
                  ]
                )
              }
              // Whether to place a building
              aType={isTerrain ? randInt(1, numTerrains) : 0}
              swarm={swarm}
            />
          );
        });
      })}
    </Instances>
  );
};

const Building = ({ size, swarm, position, ...props }) => {
  const ref = useRef();

  const currentPosition = useMemo(() => {
    return {
      x: position[0],
      y: position[1],
      z: position[2],
    };
  }, [position]);

  const particle = useMemo(() => {
    const t = Math.random() * 100;
    const factor = 20 + Math.random() * 100;
    const speed = 0.01 + Math.random() / 200;
    const xFactor = -50 + Math.random() * 100;
    const yFactor = -50 + Math.random() * 100;
    const zFactor = -50 + Math.random() * 100;

    return { t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 };
  }, []);

  useFrame(({ mouse }, delta) => {
    if (!swarm) {
      easing.dampE(ref.current.rotation, [0, 0, 0], 0.25, delta);

      // Advance
      currentPosition.z += delta;
      currentPosition.y -= delta;

      easing.damp3(ref.current.position, currentPosition, 0.25, delta);

      // Wrap buildings
      if (currentPosition.z > size / 2) {
        currentPosition.z -= size;
        currentPosition.y += size;

        ref.current.position.z -= size;
        ref.current.position.y += size;
        // TODO: Change random values
      }
    } else {
      // Swarm behaviour
      // FIXME: Why are the buildings disappearing?
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (mouse.x * 1000 - particle.mx) * 0.01;
      particle.my += (mouse.y * 1000 - 1 - particle.my) * 0.01;

      easing.damp3(
        ref.current.position,
        [
          (particle.mx / 10) * a +
            xFactor +
            Math.cos((t / 10) * factor) +
            (Math.sin(t * 1) * factor) / 10,
          (particle.my / 10) * b +
            yFactor +
            Math.sin((t / 10) * factor) +
            (Math.cos(t * 2) * factor) / 10,
          (particle.my / 10) * b +
            zFactor +
            Math.cos((t / 10) * factor) +
            (Math.sin(t * 3) * factor) / 10,
        ],
        0.25,
        delta
      );
      ref.current.rotation.set(s * 5, s * 5, s * 5);
    }
  });

  return <Instance ref={ref} {...props} />;
};

const vert = /* glsl */ `
  // #include "lygia/generative/random.glsl"

  uniform float uTime;
  uniform float uSize;

  attribute float aRandom;
  attribute float aRandom1;
  attribute vec2 aIndex;
  attribute vec3 aColor1;
  attribute vec3 aColor2;
  attribute float aType;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vRandom;
  varying float vRandom1;
  varying vec3 vColor1;
  varying vec3 vColor2;
  varying float vType;

  void main() {
    // Translate
    // csm_Position.y += sin(uTime * vRandom * 2.0) * vRandom1 * 5.0;
    // csm_Position.y += sin(uTime * 0.1) * 1.0;

    // TODO: How to wrap buildings?

    vUv = uv;
    vPosition = csm_Position;
    vRandom = aRandom;
    vRandom1 = aRandom1;
    vColor1 = aColor1;
    vColor2 = aColor2;
    vType = aType;
  }
`;

const frag = resolveLygia(/* glsl */ `
  uniform float uRoof;
  uniform sampler2DArray uTextures;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vRandom;
  varying float vRandom1;
  varying vec3 vColor1;
  varying vec3 vColor2;
  varying float vType;

  ${noise}
  ${fbm}
  ${tile}
  ${iching}
  ${brickTile}

  void main() {
    vec2 st = vUv;

    // Base color
    // FIXME: How to make colors darker nicer?
    // vec3 baseColor = vColor1 * (1.0 - vRandom1 * 0.5);
    vec3 baseColor = vColor1 * (1.0 + vRandom1 * 0.5);
    // vec3 baseColor = vColor1;
    vec3 color = baseColor;

    // FIXME: How to have different patterns depending
    // on which box side?
    // FIXME: Take into account resolution?

    // Bricks
    float bricks = brickTile(st, 7.0);
    color = mix(color, baseColor * 0.5, bricks);

    // Tile pattern
    // TODO: Randomize size of tiles
    // TODO: Add random offset
    float tiles = iching(st, floor(vRandom1 * 64.0), 0.05, 0.3);
    color = mix(color, vColor2, tiles);

    // Add windows
    // TODO: Should have 3D effect
    float windows = iching(st, floor(vRandom * 64.0), 0.15, 0.5);
    // TODO: Can vary the color of the windows
    // TODO: Don't use pure black
    color = mix(color, vec3(0.0 + vRandom * 0.1), windows);

    // If roof, just use base color
    color = mix(color, baseColor, uRoof);

    // FIXME: How to add noise and texture to facade?
    float n1 = 0.5 - fbm(st * 20.0);
    float n2 = 0.5 - fbm(st * 5.0);
    color += 0.3 * max(n1, n2);

    // color *= pow(16.*(1. - st.x)*(1. - st.y)*st.x*st.y, 1./16.);

    // TODO: Take inspiration from the grass shader lessons
    // Ambient occlusion
    color *= smoothstep(-0.8, 0.6, vPosition.y);

    // Terrain
    vec3 terrain = texture(uTextures, vec3(vUv, vType - 1.0)).rgb;
    color = mix(color, terrain * 0.5, step(1.0, vType));
    // TODO: Separate heights for terrain

    csm_DiffuseColor = vec4(color, 1.0);
  }
`);

export default Buildings;
