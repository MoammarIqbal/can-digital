import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GAME_CONSTANTS } from "../game/gameState";
import type { PlayerPhysics, GameControls } from "../game/gameState";

interface SimulationProps {
  physicsRef: React.MutableRefObject<PlayerPhysics>;
  controlsRef: React.MutableRefObject<GameControls>;
  keysPressed: React.MutableRefObject<{ [key: string]: boolean }>;
  onMetricsUpdate?: (distance: number, speedKmh: number, isMoving: boolean) => void;
}

export function GameSimulation({
  physicsRef,
  controlsRef,
  keysPressed,
  onMetricsUpdate,
}: SimulationProps) {
  const lastUiUpdate = useRef(0);

  useFrame((_, delta) => {
    // Cap delta time to prevent physics glitches on frame drops
    const dt = Math.min(delta, 0.08);
    const phys = physicsRef.current;
    const ctrl = controlsRef.current;
    const keys = keysPressed.current;

    // 1. Gather directional input vectors (WASD / Panah / Stik Virtual / D-Pad)
    let inputZ = ctrl.forward; // +1 maju (-Z), -1 mundur (+Z)
    let inputX = ctrl.strafe;  // -1 kiri (-X), +1 kanan (+X)

    if (keys["KeyW"] || keys["ArrowUp"] || keys["w"] || keys["W"]) inputZ += 1;
    if (keys["KeyS"] || keys["ArrowDown"] || keys["s"] || keys["S"]) inputZ -= 1;
    if (keys["KeyA"] || keys["ArrowLeft"] || keys["a"] || keys["A"]) inputX -= 1;
    if (keys["KeyD"] || keys["ArrowRight"] || keys["d"] || keys["D"]) inputX += 1;

    // Clamp input bounds
    inputZ = THREE.MathUtils.clamp(inputZ, -1, 1);
    inputX = THREE.MathUtils.clamp(inputX, -1, 1);

    const isSprint = Boolean(
      ctrl.sprint || keys["ShiftLeft"] || keys["ShiftRight"] || Math.hypot(inputX, inputZ) > 0.95,
    );

    // Keyboard look keys (Q / E / B)
    if (keys["KeyQ"] || keys["q"]) {
      ctrl.lookYaw -= 2.0 * dt;
    }
    if (keys["KeyE"] || keys["e"]) {
      ctrl.lookYaw += 2.0 * dt;
    }
    ctrl.lookBehind = Boolean(keys["KeyB"] || keys["b"]);

    // Calculate normalized movement vector with deadzone
    const inputMag = Math.hypot(inputX, inputZ);

    // 2. Continuous Vector Velocity Smoothing (Buttery Smooth Movement)
    let targetSpeed = 0;
    let targetVx = 0;
    let targetVz = 0;

    if (inputMag > 0.05) {
      phys.isMoving = true;

      // Base target speed
      let maxSpeed = isSprint ? GAME_CONSTANTS.RUN_SPEED : GAME_CONSTANTS.WALK_SPEED;
      if (inputZ < 0 && Math.abs(inputX) < 0.3) {
        maxSpeed = GAME_CONSTANTS.BACKWARD_SPEED; // Langkah mundur
      }
      targetSpeed = maxSpeed * Math.min(1.0, inputMag);

      // Target velocity components:
      // In Three.js: -Z is world forward, +X is world right
      const dirX = inputX / inputMag;
      const dirZ = inputZ / inputMag;

      targetVx = dirX * targetSpeed;
      targetVz = -dirZ * targetSpeed;
    } else {
      phys.isMoving = false;
      targetSpeed = 0;
      targetVx = 0;
      targetVz = 0;
    }

    // Smoothly interpolate current velocity towards target velocity
    const accelRate = phys.isMoving ? GAME_CONSTANTS.ACCEL : GAME_CONSTANTS.DECEL;
    const smoothFactor = 1 - Math.exp(-accelRate * dt);

    phys.vx = THREE.MathUtils.lerp(phys.vx, targetVx, smoothFactor);
    phys.vz = THREE.MathUtils.lerp(phys.vz, targetVz, smoothFactor);
    phys.speed = Math.hypot(phys.vx, phys.vz);

    // Stop negligible micro-drift
    if (phys.speed < 0.02) {
      phys.speed = 0;
      phys.vx = 0;
      phys.vz = 0;
      phys.isMoving = false;
    }

    // Update positions
    phys.x += phys.vx * dt;
    phys.z += phys.vz * dt;

    // Stride phase advances smoothly proportional to actual ground speed
    if (phys.speed > 0.05) {
      phys.distance += phys.speed * dt;
      // Stride rate tuned for natural foot cadence
      phys.stride += phys.speed * dt * 1.5 * Math.PI;

      // 3. Smooth Body Orientation towards travel direction
      // Direction angle in world: atan2(vx, vz)
      // When moving forward (vz < 0, vx = 0): atan2(0, -1) = Math.PI (faces -Z forward)
      const targetAngle = Math.atan2(phys.vx, phys.vz);
      let angleDiff = targetAngle - phys.facingAngle;

      // Shortest circular angle wrap
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

      // Smooth damped rotation
      const rotFactor = 1 - Math.exp(-GAME_CONSTANTS.ROTATION_SPEED * dt);
      phys.facingAngle += angleDiff * rotFactor;
    }

    // 4. Batasi Pergerakan agar Selalu di Atas Jalan (Road Boundary Clamping)
    if (phys.x < -GAME_CONSTANTS.ROAD_LIMIT) {
      phys.x = -GAME_CONSTANTS.ROAD_LIMIT;
      phys.vx = 0;
    } else if (phys.x > GAME_CONSTANTS.ROAD_LIMIT) {
      phys.x = GAME_CONSTANTS.ROAD_LIMIT;
      phys.vx = 0;
    }

    // 5. Karakter Menoleh (Nengok) Kanan dan Kiri
    const headTarget = THREE.MathUtils.clamp(
      ctrl.lookYaw,
      -Math.PI * 0.42,
      Math.PI * 0.42,
    );
    phys.headYaw = THREE.MathUtils.lerp(phys.headYaw, headTarget, dt * 10);

    // Camera auto-recenter spring when player is not actively dragging or holding Q/E
    if (!ctrl.isLooking && !keys["KeyQ"] && !keys["KeyE"] && !keys["q"] && !keys["e"]) {
      ctrl.lookYaw = THREE.MathUtils.lerp(ctrl.lookYaw, 0, dt * 2.5);
      ctrl.lookPitch = THREE.MathUtils.lerp(ctrl.lookPitch, 0, dt * 3.0);
    }

    // 6. Throttled UI Metrics Update
    const now = performance.now();
    if (now - lastUiUpdate.current > 150) {
      lastUiUpdate.current = now;
      if (onMetricsUpdate) {
        onMetricsUpdate(
          Math.floor(phys.distance),
          Math.round(phys.speed * 3.6),
          phys.isMoving,
        );
      }
    }
  });

  return null;
}
