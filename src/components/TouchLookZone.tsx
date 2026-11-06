import { useRef, useCallback } from "react";
import type { GameControls } from "../game/gameState";

interface TouchLookZoneProps {
  controlsRef: React.MutableRefObject<GameControls>;
}

export function TouchLookZone({ controlsRef }: TouchLookZoneProps) {
  const activePointerId = useRef<number | null>(null);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Ignore if clicking on buttons or joystick
      if ((e.target as HTMLElement).closest("button, .virtual-joystick-base, .hud-card")) {
        return;
      }
      if (activePointerId.current !== null) return;

      activePointerId.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture fallback
      }

      lastPos.current = { x: e.clientX, y: e.clientY };
      controlsRef.current.isLooking = true;
    },
    [controlsRef],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== e.pointerId) return;

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      // Drag sensitivity
      const sensitivityX = 0.0065;
      const sensitivityY = 0.005;

      controlsRef.current.lookYaw -= dx * sensitivityX;
      controlsRef.current.lookPitch += dy * sensitivityY;
    },
    [controlsRef],
  );

  const handlePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== e.pointerId) return;
      activePointerId.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      controlsRef.current.isLooking = false;
    },
    [controlsRef],
  );

  return (
    <div
      className="touch-look-surface"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      aria-label="Area Pengarah Pandangan Kamera 3D"
    />
  );
}
