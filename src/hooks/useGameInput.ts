import { useEffect, useRef } from "react";
import type { GameControls } from "../game/gameState";

export function useGameInput() {
  const controlsRef = useRef<GameControls>({
    forward: 0,
    strafe: 0,
    sprint: false,
    lookYaw: 0,
    lookPitch: 0,
    isLooking: false,
    lookBehind: false,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent browser page scrolling on navigation keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    const onBlur = () => {
      keysPressed.current = {};
      controlsRef.current.forward = 0;
      controlsRef.current.strafe = 0;
      controlsRef.current.sprint = false;
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return { controlsRef, keysPressed };
}
