import { Instance } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as easing from "maath/easing";

const TransformedInstance = ({
  I = Instance,
  size,
  swarm,
  position,
  rotation = [0, 0, 0],
  ...props
}) => {
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
      easing.dampE(ref.current.rotation, rotation, 0.25, delta);

      // Advance
      currentPosition.z += delta * 1.5;
      currentPosition.y -= delta * 1.5;

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

  return <I ref={ref} {...props} />;
};

export default TransformedInstance;
