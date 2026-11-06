import { useState } from "react";
import { OnScreenControls } from "./OnScreenControls";
import type { GameControls } from "../game/gameState";

interface HUDProps {
  distance: number;
  speedKmh: number;
  isMoving: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  toggleSound: () => void;
  controlsRef: React.MutableRefObject<GameControls>;
}

export function GameHUD({
  distance,
  speedKmh,
  isMoving,
  isPlaying,
  isMuted,
  toggleSound,
  controlsRef,
}: HUDProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="game-hud-layer">
      {/* Top Status Bar */}
      <div className="hud-topbar">
        <div className="hud-metrics">
          <div className="hud-pill distance-pill" title="Jarak Tempuh Eksplorasi">
            <span className="pill-dot" />
            <span className="pill-label">JARAK</span>
            <strong className="pill-value">
              {distance.toLocaleString("id-ID")} <small>m</small>
            </strong>
          </div>

          <div
            className={`hud-pill speed-pill ${isMoving ? "moving" : "idle"}`}
            title="Kecepatan Gerak"
          >
            <span className="pill-label">{isMoving ? "KECEPATAN" : "STATUS"}</span>
            <strong className="pill-value">
              {isMoving ? (
                <>
                  {speedKmh} <small>km/h</small>
                </>
              ) : (
                <span className="idle-tag">DIAM (IDLE)</span>
              )}
            </strong>
          </div>
        </div>

        <div className="hud-actions">
          {/* Sound Toggle (village-morn.mp3) */}
          <button
            className={`hud-btn sound-btn ${!isMuted && isPlaying ? "sound-active" : ""}`}
            onClick={toggleSound}
            title={!isMuted && isPlaying ? "Matikan Suara" : "Aktifkan Musik Latar"}
            aria-label="Musik Latar Belakang"
          >
            {!isMuted && isPlaying ? "🔊" : "🔇"}
            <span className="btn-label">{!isMuted && isPlaying ? "Musik Aktif" : "Musik Hening"}</span>
          </button>

          {/* Controls Help */}
          <button
            className="hud-btn"
            onClick={() => setShowHelp((v) => !v)}
            title="Petunjuk Kontrol"
            aria-label="Petunjuk Kontrol"
          >
            ?
          </button>
        </div>
      </div>

      {/* Bottom Controls Area: Pojok kanan bawah bersih tanpa tombol */}
      <div className="hud-bottom-controls">
        {/* On-Screen Navigation: Stik Virtual & Tombol Arah (Penunjuk Arah) di kiri bawah */}
        <OnScreenControls controlsRef={controlsRef} />
      </div>

      {/* Controls Help Overlay Modal */}
      {showHelp && (
        <div className="modal-backdrop" onClick={() => setShowHelp(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Panduan Kontrol Eksplorasi Candi</h3>
              <button
                className="close-btn"
                onClick={() => setShowHelp(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="control-group">
                <h4>🖥️ Kontrol Keyboard (Desktop)</h4>
                <ul>
                  <li><kbd>W</kbd> / <kbd>↑</kbd> : Bergerak maju</li>
                  <li><kbd>S</kbd> / <kbd>↓</kbd> : Bergerak mundur</li>
                  <li><kbd>A</kbd> / <kbd>←</kbd> : Belok / melangkah ke kiri</li>
                  <li><kbd>D</kbd> / <kbd>→</kbd> : Belok / melangkah ke kanan</li>
                  <li><kbd>Shift</kbd> : Lari santai (sprint)</li>
                  <li><kbd>Q</kbd> / <kbd>E</kbd> : Nengok kiri / kanan</li>
                  <li><kbd>B</kbd> : Lihat candi di belakang</li>
                  <li><kbd>Drag Mouse</kbd> : Bebas memutar pandangan 360°</li>
                </ul>
              </div>

              <div className="control-group">
                <h4>📱 Kontrol Layar (Mobile / Tablet)</h4>
                <ul>
                  <li><strong>Tidak Jalan Sendiri:</strong> Karakter hanya melangkah saat stik atau tombol arah ditekan.</li>
                  <li><strong>Stik / Tombol Arah:</strong> Geser stik atau tekan tombol panah (Maju/Mundur/Kiri/Kanan) di kiri bawah.</li>
                  <li><strong>Nengok Kanan/Kiri:</strong> Usap / drag layar sebelah kanan untuk memutar pandangan dan menoleh ke klaster candi.</li>
                </ul>
              </div>
            </div>
            <button className="confirm-btn" onClick={() => setShowHelp(false)}>
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
