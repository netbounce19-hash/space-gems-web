"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Howl } from "howler";

export default function GlobalPlayer() {
  const [mounted, setMounted] = useState(false);
  const {
    playlist,
    activeTrackIndex,
    isPlaying,
    progress,
    duration,
    seekTarget,
    togglePlay,
    nextTrack,
    prevTrack,
    setProgress,
    setDuration,
    seekRelative,
    clearSeekTarget,
  } = usePlayerStore();

  const howlRef = useRef<Howl | null>(null);
  const progressRequestRef = useRef<number | null>(null);

  // Safely import Howler on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    return () => {
      if (progressRequestRef.current) {
        cancelAnimationFrame(progressRequestRef.current);
      }
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, []);

  // Update progress loop
  const updateProgress = () => {
    if (howlRef.current && howlRef.current.playing()) {
      const currentSeek = howlRef.current.seek() as number;
      setProgress(currentSeek);

      const trackDuration = howlRef.current.duration();
      if (trackDuration && trackDuration !== duration) {
        setDuration(trackDuration);
      }
    }
    progressRequestRef.current = requestAnimationFrame(updateProgress);
  };

  const startProgressLoop = () => {
    if (progressRequestRef.current) {
      cancelAnimationFrame(progressRequestRef.current);
    }
    progressRequestRef.current = requestAnimationFrame(updateProgress);
  };

  const stopProgressLoop = () => {
    if (progressRequestRef.current) {
      cancelAnimationFrame(progressRequestRef.current);
      progressRequestRef.current = null;
    }
  };

  // Sync track changes
  useEffect(() => {
    if (!mounted) return;

    if (activeTrackIndex === null || playlist.length === 0) {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
      return;
    }

    const track = playlist[activeTrackIndex];

    if (howlRef.current) {
      howlRef.current.unload();
    }

    const newHowl = new Howl({
      src: [track.audioUrl],
      html5: true, // required for gapless and byte range streaming
      format: ["mp3", "wav"],
      onload: () => {
        setDuration(newHowl.duration());
      },
      onplay: () => {
        startProgressLoop();
      },
      onpause: () => {
        stopProgressLoop();
      },
      onstop: () => {
        stopProgressLoop();
        setProgress(0);
      },
      onend: () => {
        stopProgressLoop();
        nextTrack();
      },
      onloaderror: (id: number, err: unknown) => {
        console.error("Audio Load Error:", err);
      },
      onplayerror: (id: number, err: unknown) => {
        console.error("Audio Play Error:", err);
        newHowl.once("unlock", () => {
          newHowl.play();
        });
      },
    });

    howlRef.current = newHowl;

    if (isPlaying) {
      newHowl.play();
    }

    return () => {
      newHowl.unload();
      stopProgressLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrackIndex, playlist, mounted]);

  // Sync isPlaying state
  useEffect(() => {
    if (!howlRef.current) return;

    if (isPlaying) {
      if (!howlRef.current.playing()) {
        howlRef.current.play();
      }
    } else {
      if (howlRef.current.playing()) {
        howlRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync absolute seeks (e.g. from progress bar clicks)
  useEffect(() => {
    if (seekTarget !== null && howlRef.current) {
      howlRef.current.seek(seekTarget);
      setProgress(seekTarget);
      clearSeekTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTarget]);

  if (!mounted) return null;

  const currentTrack =
    activeTrackIndex !== null && playlist.length > 0
      ? playlist[activeTrackIndex]
      : null;

  // Format seconds to precise MM:SS:CC (centiseconds)
  const formatPreciseTime = (secs: number) => {
    if (isNaN(secs) || secs === null) return "00:00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const centiseconds = Math.floor((secs % 1) * 100);

    const mStr = String(minutes).padStart(2, "0");
    const sStr = String(seconds).padStart(2, "0");
    const cStr = String(centiseconds).padStart(2, "0");

    return `${mStr}:${sStr}:${cStr}`;
  };

  // Seek bar click handler
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!howlRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = clickX / width;
    const targetTime = clickRatio * duration;

    setProgress(targetTime);
    howlRef.current.seek(targetTime);
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black text-black z-50 select-none">
      {/* 1px fill-up progress bar container */}
      <div
        className="w-full h-2 cursor-pointer relative group border-b border-zinc-200"
        onClick={handleProgressClick}
      >
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-zinc-200 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-[1px] bg-black -translate-y-1/2 transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Invisible larger hover handler */}
        <div className="absolute -top-1 bottom-0 left-0 right-0" />
      </div>

      {/* Main Player Info and Controls */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
        {/* Metadata display */}
        <div className="flex flex-col gap-1 w-full md:w-1/3 min-w-0">
          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="text-[#ff3b30] animate-pulse-rec font-bold flex items-center gap-1 font-mono-tech">
                [ REC ]
              </span>
            )}
            <span className="truncate font-mono-tech tracking-tight normal-case text-sm">
              {currentTrack ? currentTrack.title : "SYSTEM_IDLE.wav"}
            </span>
          </div>
          <div className="font-mono-tech text-[10px] text-zinc-500 flex flex-wrap gap-2">
            {currentTrack ? (
              <>
                <span>[ {currentTrack.bpm} BPM ]</span>
                <span>[ {currentTrack.bitDepth} ]</span>
                <span>[ {currentTrack.sampleRate} ]</span>
                <span>[ {currentTrack.format} ]</span>
                <span>[ {currentTrack.fileSize} ]</span>
              </>
            ) : (
              <span>[ LOAD FOLDER TO ACTIVATE ENGINE ]</span>
            )}
          </div>
        </div>

        {/* Time display */}
        <div className="font-mono-tech text-base tracking-widest text-black flex items-center gap-2">
          <span className="font-bold">{formatPreciseTime(progress)}</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-500">{formatPreciseTime(duration)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => seekRelative(-7)}
            disabled={!currentTrack}
            className="px-3 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black uppercase text-[10px]"
          >
            [ -7s ]
          </button>

          <button
            onClick={prevTrack}
            disabled={!currentTrack}
            className="p-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
            title="PREVIOUS TRACK"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={playlist.length === 0}
            className="p-2 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white flex items-center justify-center min-w-[40px]"
            title={isPlaying ? "PAUSE" : "PLAY"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={nextTrack}
            disabled={!currentTrack}
            className="p-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
            title="NEXT TRACK"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => seekRelative(7)}
            disabled={!currentTrack}
            className="px-3 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black uppercase text-[10px]"
          >
            [ +7s ]
          </button>
        </div>
      </div>
    </div>
  );
}
