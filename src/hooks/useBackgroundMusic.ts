import { useEffect, useRef, useState, useCallback } from "react";

export function useBackgroundMusic(audioSrc: string = "/sound/village-morn.mp3") {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true; // Loop otomatis tak terbatas jika durasi selesai
    audio.volume = 0.65;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [audioSrc]);

  const playMusic = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      })
      .catch(() => {
        // Handled on subsequent interaction
      });
  }, []);

  const toggleSound = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          if (audioRef.current) audioRef.current.muted = false;
        })
        .catch(() => {});
    } else {
      const nextMuted = !audioRef.current.muted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  }, []);

  return { isPlaying, isMuted, playMusic, toggleSound };
}
