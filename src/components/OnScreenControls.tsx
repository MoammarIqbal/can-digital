import { useState, useRef, useCallback } from "react";
import type { GameControls } from "../game/gameState";

interface ControlsProps {
  controlsRef: React.MutableRefObject<GameControls>;
}

export function OnScreenControls({ controlsRef }: ControlsProps) {
  const [controlMode, setControlMode] = useState<"stick" | "dpad">("stick");

  // === VIRTUAL JOYSTICK STATE ===
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const maxRadius = 46;

  const handleStickDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const rect = e.currentTarget.getBoundingClientRect();
    origin.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    updateStickPosition(e.clientX, e.clientY);
  }, []);

  const updateStickPosition = (clientX: number, clientY: number) => {
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const dist = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;

    if (dist > maxRadius) {
      normX = (dx / dist) * maxRadius;
      normY = (dy / dist) * maxRadius;
    }

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${normX}px, ${normY}px)`;
    }

    // Horizontal axis controls strafe (-1 to +1)
    const strafeVal = normX / maxRadius;
    // Vertical axis controls forward: UP (negative dy) is forward, DOWN is backward
    const forwardVal = -normY / maxRadius;

    controlsRef.current.strafe = strafeVal;
    controlsRef.current.forward = forwardVal;
  };

  const handleStickMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    updateStickPosition(e.clientX, e.clientY);
  }, []);

  const handleStickEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = "translate(0px, 0px)";
    }

    // Segera berhenti (tidak jalan sendiri)
    controlsRef.current.strafe = 0;
    controlsRef.current.forward = 0;
  }, [controlsRef]);

  // === D-PAD DIRECTIONAL BUTTONS (PENUNJUK ARAH) ===
  const activeKeys = useRef<{ [key: string]: boolean }>({});

  const setDpadDirection = (dir: "up" | "down" | "left" | "right", active: boolean) => {
    activeKeys.current[dir] = active;

    let fwd = 0;
    let str = 0;
    if (activeKeys.current["up"]) fwd += 1;
    if (activeKeys.current["down"]) fwd -= 1;
    if (activeKeys.current["left"]) str -= 1;
    if (activeKeys.current["right"]) str += 1;

    controlsRef.current.forward = fwd;
    controlsRef.current.strafe = str;
  };

  // Helper for touch press on D-pad
  const bindDpadButton = (dir: "up" | "down" | "left" | "right") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDpadDirection(dir, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDpadDirection(dir, false);
    },
    onPointerCancel: () => {
      setDpadDirection(dir, false);
    },
  });

  return (
    <div className="on-screen-nav-container">
      {/* Selector: Stik Virtual vs Penunjuk Arah */}
      <div className="nav-mode-selector">
        <button
          className={`mode-toggle-btn ${controlMode === "stick" ? "active" : ""}`}
          onClick={() => {
            controlsRef.current.forward = 0;
            controlsRef.current.strafe = 0;
            setControlMode("stick");
          }}
          aria-label="Pilih Mode Stik Virtual"
        >
          🕹️ Stik
        </button>
        <button
          className={`mode-toggle-btn ${controlMode === "dpad" ? "active" : ""}`}
          onClick={() => {
            controlsRef.current.forward = 0;
            controlsRef.current.strafe = 0;
            setControlMode("dpad");
          }}
          aria-label="Pilih Mode Tombol Arah"
        >
          🧭 Tombol Arah
        </button>
      </div>

      {controlMode === "stick" ? (
        /* VIRTUAL JOYSTICK */
        <div
          className="virtual-joystick-base"
          onPointerDown={handleStickDown}
          onPointerMove={handleStickMove}
          onPointerUp={handleStickEnd}
          onPointerCancel={handleStickEnd}
          aria-label="Stik Penggerak Karakter"
        >
          <div className="virtual-joystick-ring" />
          <div ref={joystickKnobRef} className="virtual-joystick-knob">
            <div className="joystick-arrows">
              <span className="arrow-up">▲</span>
              <span className="arrow-left">◀</span>
              <span className="arrow-right">▶</span>
              <span className="arrow-down">▼</span>
            </div>
          </div>
        </div>
      ) : (
        /* D-PAD DIRECTIONAL BUTTONS (PENUNJUK ARAH) */
        <div className="dpad-container" aria-label="Penunjuk Arah Gerakan">
          <button className="dpad-btn dpad-up" {...bindDpadButton("up")} aria-label="Maju">
            ▲
          </button>
          <div className="dpad-middle-row">
            <button className="dpad-btn dpad-left" {...bindDpadButton("left")} aria-label="Kiri">
              ◀
            </button>
            <div className="dpad-center-hub" />
            <button className="dpad-btn dpad-right" {...bindDpadButton("right")} aria-label="Kanan">
              ▶
            </button>
          </div>
          <button className="dpad-btn dpad-down" {...bindDpadButton("down")} aria-label="Mundur">
            ▼
          </button>
        </div>
      )}
    </div>
  );
}
