import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Folder, Track } from "../types";
import { mockRelease } from "../mockData";

// Generate a track pool from mock data to simulate uploaded tracks
const initialTrackPool = mockRelease.folders.flatMap(f => f.tracks);

interface DashboardState {
  folders: Folder[];
  trackPool: Track[];
  
  // Actions
  addFolder: (folder: Folder) => void;
  removeFolder: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      folders: mockRelease.folders,
      trackPool: initialTrackPool,
      
      addFolder: (folder) => set((state) => ({
        folders: [...state.folders, folder]
      })),

      removeFolder: (id) => set((state) => ({
        folders: state.folders.filter(f => f.id !== id)
      })),
    }),
    {
      name: "space-gems-dashboard-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
