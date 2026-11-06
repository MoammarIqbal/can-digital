import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerPhysics } from "../game/gameState";

interface PlayerProps {
  physicsRef: React.MutableRefObject<PlayerPhysics>;
}

export function PlayerCharacter({ physicsRef }: PlayerProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const ponytailRef = useRef<THREE.Group>(null);

  // Articulated Thighs & Knees (Two-joint organic legs)
  const leftThighRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  // Articulated Arms & Elbows
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const phys = physicsRef.current;
    if (!rootGroupRef.current) return;

    const time = state.clock.getElapsedTime();

    // 1. Root Position & Orientation
    rootGroupRef.current.position.set(phys.x, phys.y, phys.z);
    rootGroupRef.current.rotation.y = phys.facingAngle;

    // 2. Head turning ("nengok kanan kiri")
    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = phys.headYaw;
    }

    // 3. Swaying Ponytail with secondary inertia
    if (ponytailRef.current) {
      const hairSway = Math.sin(time * 3 + phys.stride) * (phys.isMoving ? 0.22 : 0.04);
      ponytailRef.current.rotation.z = -phys.headYaw * 0.35 + hairSway * 0.4;
      ponytailRef.current.rotation.x = -0.22 - (phys.isMoving ? 0.28 : 0.06);
    }

    // 4. Smooth Organic Locomotion Kinematics
    if (phys.isMoving && phys.speed > 0.05) {
      const s = phys.stride;
      // Normalized movement intensity factor
      const walkFactor = THREE.MathUtils.clamp(phys.speed / 3.8, 0.3, 1.3);

      // Thigh swings
      const leftThighAngle = Math.sin(s) * 0.52 * walkFactor;
      const rightThighAngle = -Math.sin(s) * 0.52 * walkFactor;

      if (leftThighRef.current) {
        leftThighRef.current.rotation.x = leftThighAngle;
        leftThighRef.current.rotation.z = 0.02;
      }
      if (rightThighRef.current) {
        rightThighRef.current.rotation.x = rightThighAngle;
        rightThighRef.current.rotation.z = -0.02;
      }

      // Knee flexion: knee bends backward during leg forward swing for natural clearance
      // When sin(s) is negative, left leg swings forward -> knee bends!
      const leftKneeBend = Math.max(0, -Math.sin(s)) * 0.68 * walkFactor;
      const rightKneeBend = Math.max(0, Math.sin(s)) * 0.68 * walkFactor;

      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = leftKneeBend;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = rightKneeBend;
      }

      // Arms swing with natural elbow flexion
      if (leftUpperArmRef.current && leftForearmRef.current) {
        leftUpperArmRef.current.rotation.x = -Math.sin(s) * 0.42 * walkFactor;
        leftUpperArmRef.current.rotation.z = 0.06;
        leftForearmRef.current.rotation.x = -0.28 + Math.sin(s) * 0.12 * walkFactor;
      }
      if (rightUpperArmRef.current && rightForearmRef.current) {
        rightUpperArmRef.current.rotation.x = Math.sin(s) * 0.42 * walkFactor;
        rightUpperArmRef.current.rotation.z = -0.06;
        rightForearmRef.current.rotation.x = -0.28 - Math.sin(s) * 0.12 * walkFactor;
      }

      // Pelvis bob & gentle hip sway
      if (bodyGroupRef.current) {
        const bob = Math.abs(Math.sin(s)) * 0.045 * walkFactor;
        const hipSway = Math.sin(s) * 0.035 * walkFactor;
        const torsoTwist = -Math.sin(s) * 0.045 * walkFactor;

        bodyGroupRef.current.position.y = bob;
        bodyGroupRef.current.rotation.z = hipSway;
        bodyGroupRef.current.rotation.y = torsoTwist;
        bodyGroupRef.current.rotation.x = 0.05 * walkFactor; // Subtle forward lean
      }
    } else {
      // Natural Idle Stance with gentle breathing
      const breath = Math.sin(time * 2.2) * 0.015;

      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = THREE.MathUtils.lerp(
          bodyGroupRef.current.position.y,
          breath,
          0.12,
        );
        bodyGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          bodyGroupRef.current.rotation.x,
          0,
          0.12,
        );
        bodyGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          bodyGroupRef.current.rotation.y,
          0,
          0.12,
        );
        bodyGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          bodyGroupRef.current.rotation.z,
          0,
          0.12,
        );
      }

      // Reset Thighs & Knees to straight standing stance
      if (leftThighRef.current) {
        leftThighRef.current.rotation.x = THREE.MathUtils.lerp(leftThighRef.current.rotation.x, 0, 0.15);
      }
      if (rightThighRef.current) {
        rightThighRef.current.rotation.x = THREE.MathUtils.lerp(rightThighRef.current.rotation.x, 0, 0.15);
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, 0, 0.18);
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, 0, 0.18);
      }

      // Relaxed Arms by sides
      if (leftUpperArmRef.current && leftForearmRef.current) {
        leftUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftUpperArmRef.current.rotation.x,
          Math.sin(time * 1.5) * 0.02,
          0.1,
        );
        leftUpperArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftUpperArmRef.current.rotation.z,
          0.04,
          0.1,
        );
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftForearmRef.current.rotation.x,
          -0.12,
          0.1,
        );
      }
      if (rightUpperArmRef.current && rightForearmRef.current) {
        rightUpperArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightUpperArmRef.current.rotation.x,
          -Math.sin(time * 1.5) * 0.02,
          0.1,
        );
        rightUpperArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightUpperArmRef.current.rotation.z,
          -0.04,
          0.1,
        );
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightForearmRef.current.rotation.x,
          -0.12,
          0.1,
        );
      }
    }
  });

  return (
    <group ref={rootGroupRef}>
      <group ref={bodyGroupRef}>
        {/* === FEMALE TORSO & OUTFIT === */}
        {/* Fitted explorer crop vest (terracotta) */}
        <mesh position={[0, 1.16, 0]} castShadow>
          <boxGeometry args={[0.44, 0.44, 0.26]} />
          <meshStandardMaterial color="#9c4e33" roughness={0.7} />
        </mesh>
        {/* Inner athletic top (deep forest green) */}
        <mesh position={[0, 0.98, 0.02]} castShadow>
          <boxGeometry args={[0.38, 0.22, 0.24]} />
          <meshStandardMaterial color="#213322" roughness={0.8} />
        </mesh>

        {/* Explorer Waist Belt & Buckle */}
        <group position={[0, 0.88, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.43, 0.08, 0.28]} />
            <meshStandardMaterial color="#2c1d13" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[0.09, 0.09, 0.02]} />
            <meshStandardMaterial color="#c29b47" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.23, -0.04, 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.14, 0.12]} />
            <meshStandardMaterial color="#40281b" roughness={0.8} />
          </mesh>
        </group>

        {/* Explorer Shorts (olive green) */}
        <mesh position={[0, 0.76, 0]} castShadow>
          <boxGeometry args={[0.44, 0.24, 0.27]} />
          <meshStandardMaterial color="#414d36" roughness={0.85} />
        </mesh>

        {/* Compact Explorer Backpack */}
        <group position={[0, 1.15, -0.17]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.38, 0.16]} />
            <meshStandardMaterial color="#354631" roughness={0.85} />
          </mesh>
          <mesh position={[-0.18, -0.04, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.16, 6]} />
            <meshStandardMaterial color="#7a8d75" roughness={0.5} />
          </mesh>
        </group>

        {/* === HEAD & PONYTAIL === */}
        <group ref={headGroupRef} position={[0, 1.48, 0]}>
          <mesh position={[0, 0.07, 0]} castShadow>
            <boxGeometry args={[0.26, 0.28, 0.25]} />
            <meshStandardMaterial color="#dfb18c" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.17, -0.02]} castShadow>
            <boxGeometry args={[0.28, 0.18, 0.27]} />
            <meshStandardMaterial color="#241811" roughness={0.8} />
          </mesh>
          <mesh position={[-0.14, 0.09, 0.05]} castShadow>
            <boxGeometry args={[0.04, 0.22, 0.14]} />
            <meshStandardMaterial color="#241811" roughness={0.8} />
          </mesh>
          <mesh position={[0.14, 0.09, 0.05]} castShadow>
            <boxGeometry args={[0.04, 0.22, 0.14]} />
            <meshStandardMaterial color="#241811" roughness={0.8} />
          </mesh>

          {/* Ponytail Hairband (olive) */}
          <mesh position={[0, 0.22, -0.15]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 8]} />
            <meshStandardMaterial color="#507040" roughness={0.7} />
          </mesh>

          {/* Ponytail */}
          <group ref={ponytailRef} position={[0, 0.21, -0.16]}>
            <mesh position={[0, -0.18, -0.04]} castShadow>
              <cylinderGeometry args={[0.055, 0.03, 0.38, 7]} />
              <meshStandardMaterial color="#241811" roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* === ARTICULATED TWO-JOINT ARMS === */}
        {/* Left Arm */}
        <group ref={leftUpperArmRef} position={[-0.28, 1.34, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <boxGeometry args={[0.11, 0.32, 0.12]} />
            <meshStandardMaterial color="#9c4e33" roughness={0.7} />
          </mesh>
          {/* Left Forearm hinged at elbow */}
          <group ref={leftForearmRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.14, 0]} castShadow>
              <boxGeometry args={[0.09, 0.28, 0.1]} />
              <meshStandardMaterial color="#dfb18c" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Right Arm */}
        <group ref={rightUpperArmRef} position={[0.28, 1.34, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <boxGeometry args={[0.11, 0.32, 0.12]} />
            <meshStandardMaterial color="#9c4e33" roughness={0.7} />
          </mesh>
          {/* Right Forearm hinged at elbow */}
          <group ref={rightForearmRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.14, 0]} castShadow>
              <boxGeometry args={[0.09, 0.28, 0.1]} />
              <meshStandardMaterial color="#dfb18c" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* === ARTICULATED TWO-JOINT LEGS (WITH FLEXING KNEES) === */}
        {/* Left Leg: Thigh -> Knee/Calf -> Boot */}
        <group ref={leftThighRef} position={[-0.13, 0.74, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.14, 0.36, 0.16]} />
            <meshStandardMaterial color="#dfb18c" roughness={0.6} />
          </mesh>

          {/* Knee & Calf & Boot hinged at knee */}
          <group ref={leftKneeRef} position={[0, -0.36, 0]}>
            <mesh position={[0, -0.12, 0]} castShadow>
              <boxGeometry args={[0.13, 0.24, 0.14]} />
              <meshStandardMaterial color="#dfb18c" roughness={0.6} />
            </mesh>
            {/* Folded sock */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.16]} />
              <meshStandardMaterial color="#b8ab96" roughness={0.9} />
            </mesh>
            {/* Explorer Boot */}
            <mesh position={[0, -0.32, 0.02]} castShadow>
              <boxGeometry args={[0.16, 0.22, 0.22]} />
              <meshStandardMaterial color="#261910" roughness={0.65} />
            </mesh>
          </group>
        </group>

        {/* Right Leg: Thigh -> Knee/Calf -> Boot */}
        <group ref={rightThighRef} position={[0.13, 0.74, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.14, 0.36, 0.16]} />
            <meshStandardMaterial color="#dfb18c" roughness={0.6} />
          </mesh>

          {/* Knee & Calf & Boot hinged at knee */}
          <group ref={rightKneeRef} position={[0, -0.36, 0]}>
            <mesh position={[0, -0.12, 0]} castShadow>
              <boxGeometry args={[0.13, 0.24, 0.14]} />
              <meshStandardMaterial color="#dfb18c" roughness={0.6} />
            </mesh>
            {/* Folded sock */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.16]} />
              <meshStandardMaterial color="#b8ab96" roughness={0.9} />
            </mesh>
            {/* Explorer Boot */}
            <mesh position={[0, -0.32, 0.02]} castShadow>
              <boxGeometry args={[0.16, 0.22, 0.22]} />
              <meshStandardMaterial color="#261910" roughness={0.65} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
