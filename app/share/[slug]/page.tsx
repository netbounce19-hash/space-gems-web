"use client";

import { useState } from "react";
import { mockRelease } from "../../../mockData";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { Track, Folder } from "../../../types";
import { Search, Play, Pause, Download, Share2, Check, ChevronDown, ArrowUpDown, ArrowLeft } from "lucide-react";

interface SharePageProps {
  params: {
    slug: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  const { slug } = params;
  const release = mockRelease.slug === slug ? mockRelease : mockRelease;

  // Local state
  const [viewMode, setViewMode] = useState<"grid" | "playlist">("grid");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  // Zustand Store
  const {
    playlist,
    activeTrackIndex,
    isPlaying,
    setPlaylist,
    playTrack,
    togglePlay,
  } = usePlayerStore();

  const selectedFolder = release.folders.find((f) => f.id === selectedFolderId);

  // Play folder action (enters playlist view and starts playback)
  const handleOpenAndPlayFolder = (folder: Folder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFolderId(folder.id);
    setViewMode("playlist");
    
    // Check if it's already playing this folder
    const isFolderPlaying = playlist.length > 0 && playlist[0].audioUrl === folder.tracks[0]?.audioUrl;
    if (!isFolderPlaying) {
      setPlaylist(folder.tracks, folder.name);
    } else if (!isPlaying) {
      togglePlay();
    }
  };

  const handleOpenFolder = (folder: Folder) => {
    setSelectedFolderId(folder.id);
    setViewMode("playlist");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
  };

  // Play specific track action
  const handlePlayTrack = (track: Track) => {
    const isCurrentPlaylist = playlist.some((t) => t.id === track.id);
    
    if (isCurrentPlaylist) {
      const trackIndex = playlist.findIndex((t) => t.id === track.id);
      if (trackIndex === activeTrackIndex) {
        togglePlay();
      } else {
        playTrack(trackIndex);
      }
    } else {
      if (selectedFolder) {
        setPlaylist(selectedFolder.tracks, selectedFolder.name);
        const newTrackIndex = selectedFolder.tracks.findIndex((t) => t.id === track.id);
        if (newTrackIndex !== -1) {
          playTrack(newTrackIndex);
        }
      }
    }
  };

  const handleShareTrack = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${slug}?track=${track.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedTrackId(track.id);
    setTimeout(() => setCopiedTrackId(null), 2000);
  };

  const handleDownloadTrack = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingTrackId(track.id);
    const a = document.createElement("a");
    a.href = track.audioUrl;
    a.download = track.title;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloadingTrackId(null), 3000);
  };

  const getIsTrackPlaying = (track: Track) => {
    if (!isPlaying || activeTrackIndex === null || playlist.length === 0) return false;
    return playlist[activeTrackIndex].id === track.id;
  };

  const getIsTrackActive = (track: Track) => {
    if (activeTrackIndex === null || playlist.length === 0) return false;
    return playlist[activeTrackIndex].id === track.id;
  };

  return (
    <div className="flex-1 flex flex-col bg-white w-full max-w-md mx-auto border-x border-black min-h-screen pb-24 shadow-sm relative">
      {/* 1. Mobile-First Header */}
      <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-xs shrink-0">
            SG
          </div>
          <h1 className="text-lg font-bold tracking-widest truncate max-w-[180px]">
            {release.artist}
          </h1>
        </div>
        <button onClick={() => setSearchActive(!searchActive)} className="p-2">
          <Search className="w-5 h-5" />
        </button>
      </header>

      {searchActive && (
        <div className="p-4 border-b border-black bg-zinc-50">
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-black p-2 text-xs font-mono-tech outline-none uppercase"
          />
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="flex flex-col flex-1 animate-in fade-in duration-200">
          {/* 2. Image / Photo Banner */}
          <div 
            className="w-full h-32 border-b border-black bg-zinc-100 flex items-center justify-center relative overflow-hidden"
            style={{ 
              backgroundImage: `url('${release.coverImage}')`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          >
             {!release.coverImage.includes('http') && (
               <div className="absolute inset-0 blueprint-grid opacity-30" />
             )}
             <span className="font-mono-tech text-[10px] text-zinc-500 bg-white/80 px-2 py-1 border border-black absolute bottom-2 right-2">
                IMAGE / PHOTO
             </span>
          </div>

          {/* 3. Sections (Tabs) */}
          <div className="flex items-center gap-4 px-4 py-4 overflow-x-auto border-b border-black whitespace-nowrap scrollbar-hide text-sm font-bold tracking-widest uppercase">
            {release.folders.map(folder => (
              <button 
                key={folder.id} 
                onClick={() => handleOpenFolder(folder)}
                className="hover:underline underline-offset-4"
              >
                {folder.name}
              </button>
            ))}
          </div>

          {/* 4. Filters & Sort */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-black text-xs font-mono-tech">
            <button className="flex items-center gap-1 hover:opacity-70">
              ALL <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:opacity-70">
              NAME <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* 5. Square Folders Grid */}
          <div className="grid grid-cols-2 gap-4 p-4">
            {release.folders.map((folder) => {
              const isFolderPlaying = playlist.length > 0 && playlist[0].audioUrl === folder.tracks[0]?.audioUrl && isPlaying;
              
              return (
                <div key={folder.id} className="flex flex-col gap-2">
                  <div 
                    onClick={() => handleOpenFolder(folder)}
                    className="aspect-square border border-black relative cursor-pointer group bg-zinc-100"
                    style={{ 
                      backgroundImage: `url('${folder.coverImage}')`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    }}
                  >
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                      <button 
                        onClick={(e) => handleOpenAndPlayFolder(folder, e)}
                        className="w-12 h-12 bg-white/90 border border-black flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {isFolderPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
                      </button>
                    </div>
                  </div>
                  <div className="font-mono-tech text-xs uppercase truncate">
                    {folder.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Playlist View */}
      {viewMode === "playlist" && selectedFolder && (
        <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-200">
          {/* Back button & Folder Title */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-black bg-zinc-50">
            <button onClick={handleBackToGrid} className="p-1 hover:bg-zinc-200 rounded">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold tracking-widest text-sm uppercase truncate">
              {selectedFolder.name}
            </h2>
          </div>

          {/* Large Cover */}
          <div className="w-full aspect-square border-b border-black relative bg-zinc-100">
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundImage: `url('${selectedFolder.coverImage}')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
              }}
            />
            {/* Folder Play Button */}
            <button 
               onClick={() => handleOpenAndPlayFolder(selectedFolder)}
               className="absolute bottom-4 right-4 px-4 py-2 bg-black text-white text-xs font-bold flex items-center gap-2 border border-black hover:bg-white hover:text-black transition-colors"
            >
              PLAY FOLDER
            </button>
          </div>

          {/* Tracks List */}
          <div className="flex flex-col">
            {selectedFolder.tracks
              .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((track, index) => {
              const isTrackPlaying = getIsTrackPlaying(track);
              const isTrackActive = getIsTrackActive(track);

              return (
                <div 
                  key={track.id} 
                  className={`flex flex-col border-b border-black p-4 transition-colors ${isTrackActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3 overflow-hidden pr-4">
                      <span className="font-mono-tech text-xs text-zinc-400 mt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col">
                        <span className={`font-mono-tech text-sm truncate max-w-[200px] ${isTrackActive ? 'font-bold' : ''}`}>
                          {track.title}
                        </span>
                        <span className="font-mono-tech text-[10px] text-zinc-500 mt-1">
                          {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, "0")} • {track.bpm} BPM
                        </span>
                      </div>
                    </div>
                    {isTrackPlaying && (
                      <span className="text-[#ff3b30] animate-pulse-rec font-mono-tech text-[10px] whitespace-nowrap mt-0.5">
                        [ REC ]
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={`flex-1 py-2 border border-black flex items-center justify-center gap-1.5 transition-colors uppercase text-[10px] font-bold ${
                        isTrackPlaying
                          ? "bg-black text-white hover:bg-white hover:text-black"
                          : "bg-white text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {isTrackPlaying ? (
                        <><Pause className="w-3 h-3" /> PAUSE</>
                      ) : (
                        <><Play className="w-3 h-3" /> PLAY</>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDownloadTrack(track, e)}
                      disabled={downloadingTrackId === track.id}
                      className="p-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleShareTrack(track, e)}
                      className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
                    >
                      {copiedTrackId === track.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
