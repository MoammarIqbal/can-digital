import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GAME_CONSTANTS } from "../game/gameState";

interface LightingProps {
  playerZ: React.MutableRefObject<number>;
}

export function LightingAndAtmosphere({ playerZ }: LightingProps) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const dirTargetRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    const pz = playerZ.current;
    if (dirLightRef.current && dirTargetRef.current) {
      // Keep directional light and its shadow camera tightly locked to player Z
      dirLightRef.current.position.set(16, 26, pz + 12);
      dirTargetRef.current.position.set(0, 0, pz - 10);
      dirLightRef.current.target = dirTargetRef.current;
      dirLightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {/* Harmonious natural jungle sky and fog */}
      <color attach="background" args={[GAME_CONSTANTS.FOG_COLOR]} />
      <fog
        attach="fog"
        args={[
          GAME_CONSTANTS.FOG_COLOR,
          GAME_CONSTANTS.FOG_NEAR,
          GAME_CONSTANTS.FOG_FAR,
        ]}
      />

      {/* Ambient and Hemisphere light for lush ambient fill */}
      <ambientLight intensity={1.4} color="#e5f5e0" />
      <hemisphereLight
        args={["#d9f0d3", "#3a5732", 1.0]}
        position={[0, 50, 0]}
      />

      {/* Main warm sunlight */}
      <object3D ref={dirTargetRef} />
      <directionalLight
        ref={dirLightRef}
        position={[16, 26, 12]}
        intensity={2.4}
        color="#fffcee"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={90}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.0003}
      />
    </>
  );
}
