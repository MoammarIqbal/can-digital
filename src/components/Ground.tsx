import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGrassTexture, createRoadTexture } from "../utils/proceduralTextures";
import { GAME_CONSTANTS } from "../game/gameState";

interface GroundProps {
  playerZ: React.MutableRefObject<number>;
}

export function Ground({ playerZ }: GroundProps) {
  const grassTex = useMemo(() => createGrassTexture(), []);
  const roadTex = useMemo(() => createRoadTexture(), []);

  const groundGroupRef = useRef<THREE.Group>(null);
  const roadMeshRef = useRef<THREE.Mesh>(null);
  const grassMeshRef = useRef<THREE.Mesh>(null);

  // Materials
  const grassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.95,
      metalness: 0.05,
    });
  }, [grassTex]);

  const roadMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.85,
      metalness: 0.1,
    });
  }, [roadTex]);

  const curbMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#465342",
      roughness: 0.9,
    });
  }, []);

  useFrame(() => {
    const pz = playerZ.current;
    if (groundGroupRef.current) {
      groundGroupRef.current.position.z = pz;
    }

    // Scroll textures in sync with player movement along Z
    roadTex.offset.y = -pz / 40;
    grassTex.offset.y = -pz / 60;
  });

  const curbWidth = 0.35;
  const halfRoad = GAME_CONSTANTS.ROAD_WIDTH / 2;

  return (
    <group ref={groundGroupRef}>
      {/* Vast lush grass terrain surrounding the temple road */}
      <mesh
        ref={grassMeshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[280, 420]} />
        <primitive object={grassMaterial} attach="material" />
      </mesh>

      {/* Main ancient stone slab pathway */}
      <mesh
        ref={roadMeshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[GAME_CONSTANTS.ROAD_WIDTH, 420]} />
        <primitive object={roadMaterial} attach="material" />
      </mesh>

      {/* Left stone curb border */}
      <mesh position={[-halfRoad - curbWidth / 2, 0.04, 0]} receiveShadow>
        <boxGeometry args={[curbWidth, 0.12, 420]} />
        <primitive object={curbMaterial} attach="material" />
      </mesh>

      {/* Right stone curb border */}
      <mesh position={[halfRoad + curbWidth / 2, 0.04, 0]} receiveShadow>
        <boxGeometry args={[curbWidth, 0.12, 420]} />
        <primitive object={curbMaterial} attach="material" />
      </mesh>
    </group>
  );
}
