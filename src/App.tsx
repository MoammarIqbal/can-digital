import { Suspense, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { InfiniteTemples } from "./components/InfiniteTemples";
import { Ground } from "./components/Ground";
import { PlayerCharacter } from "./components/PlayerCharacter";
import { CameraController } from "./components/CameraController";
import { LightingAndAtmosphere } from "./components/LightingAndAtmosphere";
import { GameSimulation } from "./components/GameSimulation";
import { TouchLookZone } from "./components/TouchLookZone";
import { GameHUD } from "./components/GameHUD";
import { WelcomeModal } from "./components/WelcomeModal";
import { useGameInput } from "./hooks/useGameInput";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";
import type { PlayerPhysics } from "./game/gameState";

const MODEL_PATH = "/models/temple.glb";

export default function App() {
  const { controlsRef, keysPressed } = useGameInput();
  const { isPlaying, isMuted, playMusic, toggleSound } = useBackgroundMusic(
    "/sound/village-morn.mp3",
  );

  const [isStarted, setIsStarted] = useState(false);

  const physicsRef = useRef<PlayerPhysics>({
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vz: 0,
    speed: 0,
    isMoving: false,
    facingAngle: Math.PI, // Facing forward (-Z)
    headYaw: 0,
    distance: 0,
    stride: 0,
  });

  const playerZ = useRef(0);

  const [metrics, setMetrics] = useState({
    distance: 0,
    speedKmh: 0,
    isMoving: false,
  });

  const handleMetricsUpdate = useCallback(
    (distance: number, speedKmh: number, isMoving: boolean) => {
      playerZ.current = physicsRef.current.z;
      setMetrics({ distance, speedKmh, isMoving });
    },
    [],
  );

  const handleStartGame = useCallback(() => {
    setIsStarted(true);
    playMusic();
  }, [playMusic]);

  return (
    <main className="game-viewport">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.4, 6.2], fov: 52, near: 0.1, far: 220 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        <LightingAndAtmosphere playerZ={playerZ} />
        <Ground playerZ={playerZ} />

        <Suspense fallback={null}>
          {/* Klaster candi rapih di kanan kiri depan tanpa pepohonan */}
          <InfiniteTemples modelPath={MODEL_PATH} playerZ={playerZ} />
          <Preload all />
        </Suspense>

        {/* Karakter Petualang Cewek (cw) */}
        <PlayerCharacter physicsRef={physicsRef} />

        {/* Kamera pengikut sinkron & kontrol pandangan */}
        <CameraController physicsRef={physicsRef} controlsRef={controlsRef} />

        {/* Simulasi fisika manual (hanya jalan jika dialog sudah ditutup) */}
        <GameSimulation
          physicsRef={physicsRef}
          controlsRef={controlsRef}
          keysPressed={keysPressed}
          onMetricsUpdate={handleMetricsUpdate}
        />
      </Canvas>

      {/* Area usap sentuh / mouse drag untuk bebas melihat 360° */}
      <TouchLookZone controlsRef={controlsRef} />

      {/* Antarmuka bersih */}
      <GameHUD
        distance={metrics.distance}
        speedKmh={metrics.speedKmh}
        isMoving={metrics.isMoving}
        isPlaying={isPlaying}
        isMuted={isMuted}
        toggleSound={toggleSound}
        controlsRef={controlsRef}
      />

      {/* Modal Dialog Ucapan di tengah web dengan background gelap transparan */}
      {!isStarted && <WelcomeModal onStart={handleStartGame} />}
    </main>
  );
}
