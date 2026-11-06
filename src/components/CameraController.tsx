import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerPhysics, GameControls } from "../game/gameState";

interface CameraProps {
  physicsRef: React.MutableRefObject<PlayerPhysics>;
  controlsRef: React.MutableRefObject<GameControls>;
}

export function CameraController({ physicsRef, controlsRef }: CameraProps) {
  const { camera } = useThree();

  const currentCamPos = useRef(new THREE.Vector3(0, 3.5, 6.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.4, -4));
  const desiredCamPos = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const phys = physicsRef.current;
    const ctrl = controlsRef.current;

    // Base orbit parameters around player
    const distance = 5.8;
    const baseHeight = 2.4;

    // Determine target yaw (including look behind toggle)
    let totalYaw = ctrl.lookYaw;
    if (ctrl.lookBehind) {
      totalYaw += Math.PI;
    }

    const pitch = THREE.MathUtils.clamp(ctrl.lookPitch, -0.45, 0.65);

    // Spherical orbit calculation around player
    const horizontalDist = distance * Math.cos(pitch);
    const camX = phys.x + Math.sin(totalYaw) * horizontalDist;
    const camY = phys.y + baseHeight + Math.sin(pitch) * distance;
    const camZ = phys.z + Math.cos(totalYaw) * horizontalDist;

    desiredCamPos.current.set(camX, camY, camZ);

    // LookAt point is focused on the player's upper chest / head, with slight forward lead
    const forwardLead = ctrl.lookBehind ? 2.5 : -3.5;
    const lookX = phys.x - Math.sin(totalYaw) * 0.5;
    const lookY = phys.y + 1.4;
    const lookZ = phys.z + Math.cos(totalYaw) * forwardLead;

    desiredLookAt.current.set(lookX, lookY, lookZ);

    // Smooth lerp damping for camera position and look target
    const posLerpSpeed = 11.0;
    const lookLerpSpeed = 12.0;
    currentCamPos.current.lerp(desiredCamPos.current, 1 - Math.exp(-posLerpSpeed * dt));
    currentLookAt.current.lerp(desiredLookAt.current, 1 - Math.exp(-lookLerpSpeed * dt));

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);

    // Dynamic FOV based on speed
    if ("fov" in camera && typeof (camera as THREE.PerspectiveCamera).fov === "number") {
      const persCamera = camera as THREE.PerspectiveCamera;
      const targetFov = 50 + (phys.speed / 24) * 8;
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, dt * 4);
      persCamera.updateProjectionMatrix();
    }
  });

  return null;
}
