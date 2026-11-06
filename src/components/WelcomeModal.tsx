import { useState, useEffect } from "react";

interface WelcomeModalProps {
  onStart: () => void;
}

export function WelcomeModal({ onStart }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onStart(); // Memulai musik latar dan mengaktifkan gameplay
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.code === "Space" || e.code === "Enter" || e.code === "Escape")) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="simple-modal-backdrop" onClick={handleClose}>
      <div className="simple-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="simple-modal-close"
          onClick={handleClose}
          aria-label="Tutup dan mulai main"
        >
          ✕
        </button>

        <p className="simple-modal-text">
          &ldquo;A thousand temples crafted for yayaa with love 🤍&rdquo;
        </p>

        <button className="simple-modal-btn" onClick={handleClose} autoFocus>
          Mulai Eksplorasi
        </button>
      </div>
    </div>
  );
}
