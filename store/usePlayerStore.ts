import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Track } from "../types";

interface PlayerState {
  playlist: Track[];
  activeTrackIndex: number | null;
  isPlaying: boolean;
  progress: number; // current time in seconds
  duration: number; // duration in seconds
  activeFolderName: string | null;
  seekTarget: number | null; // target position to seek to, reset to null after seeking
  
  // Actions
  setPlaylist: (tracks: Track[], folderName: string) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  seekRelative: (seconds: number) => void;
  clearSeekTarget: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      playlist: [],
      activeTrackIndex: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      activeFolderName: null,
      seekTarget: null,

      setPlaylist: (tracks, folderName) => {
        set({
          playlist: tracks,
          activeFolderName: folderName,
          activeTrackIndex: tracks.length > 0 ? 0 : null,
          isPlaying: true, // start playing immediately when loading a folder
          progress: 0,
          duration: tracks.length > 0 ? tracks[0].duration : 0,
          seekTarget: null,
        });
      },

      playTrack: (index) => {
        const playlist = get().playlist;
        if (index >= 0 && index < playlist.length) {
          set({
            activeTrackIndex: index,
            isPlaying: true,
            progress: 0,
            duration: playlist[index].duration,
            seekTarget: null,
          });
        }
      },

      togglePlay: () => {
        const { activeTrackIndex, playlist } = get();
        if (activeTrackIndex === null && playlist.length > 0) {
          set({ activeTrackIndex: 0, isPlaying: true });
        } else {
          set({ isPlaying: !get().isPlaying });
        }
      },

      setIsPlaying: (isPlaying) => {
        set({ isPlaying });
      },

      nextTrack: () => {
        const { activeTrackIndex, playlist } = get();
        if (activeTrackIndex !== null && playlist.length > 0) {
          const nextIndex = (activeTrackIndex + 1) % playlist.length;
          set({
            activeTrackIndex: nextIndex,
            isPlaying: true,
            progress: 0,
            duration: playlist[nextIndex].duration,
            seekTarget: null,
          });
        }
      },

      prevTrack: () => {
        const { activeTrackIndex, playlist } = get();
        if (activeTrackIndex !== null && playlist.length > 0) {
          const prevIndex = (activeTrackIndex - 1 + playlist.length) % playlist.length;
          set({
            activeTrackIndex: prevIndex,
            isPlaying: true,
            progress: 0,
            duration: playlist[prevIndex].duration,
            seekTarget: null,
          });
        }
      },

      setProgress: (progress) => {
        set({ progress });
      },

      setDuration: (duration) => {
        set({ duration });
      },

      seekRelative: (seconds) => {
        const { progress, duration } = get();
        const target = Math.max(0, Math.min(duration, progress + seconds));
        set({ seekTarget: target, progress: target });
      },

      clearSeekTarget: () => {
        set({ seekTarget: null });
      },
    }),
    {
      name: "space-gems-player-state",
      storage: createJSONStorage(() => localStorage),
      // persist the track selection and list but avoid playing on initial load
      partialize: (state) => ({
        playlist: state.playlist,
        activeTrackIndex: state.activeTrackIndex,
        activeFolderName: state.activeFolderName,
      }),
    }
  )
);
