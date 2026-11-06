export interface GameControls {
  forward: number;   // -1 (backward / S) to +1 (forward / W)
  strafe: number;    // -1 (left / A) to +1 (right / D)
  sprint: boolean;   // true if sprint key held
  lookYaw: number;   // camera orbit angle around character
  lookPitch: number; // camera tilt angle
  isLooking: boolean;
  lookBehind: boolean;
}

export interface PlayerPhysics {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  speed: number;
  isMoving: boolean;
  facingAngle: number; // radians (body direction)
  headYaw: number;     // radians (head look left/right)
  distance: number;
  stride: number;      // walking cycle phase
}

export const GAME_CONSTANTS = {
  ROAD_WIDTH: 8.0,
  ROAD_LIMIT: 3.4,       // Max lateral distance from road center
  WALK_SPEED: 3.8,       // Kecepatan jalan santai & terkontrol
  RUN_SPEED: 6.8,        // Kecepatan lari ringan (sprint)
  BACKWARD_SPEED: 2.4,   // Kecepatan langkah mundur
  ACCEL: 14.0,           // Akselerasi halus
  DECEL: 18.0,           // Deselerasi berhenti responsif
  ROTATION_SPEED: 14.0,  // Kecepatan rotasi badan halus
  FOG_NEAR: 45,
  FOG_FAR: 185,
  FOG_COLOR: "#8ca889",
  SKY_COLOR: "#c2e4c1",
};
