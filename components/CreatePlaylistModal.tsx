"use client";

import { useState, useRef } from "react";
import { Track } from "../types";
import { uploadFileToSupabase } from "../utils/upload";
import { supabase } from "../lib/supabase";

interface CreatePlaylistModalProps {
  releaseId: string;
  trackPool: Track[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlaylistModal({ releaseId, trackPool, onClose, onSuccess }: CreatePlaylistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCoverImagePreview(imageUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddTrack = (track: Track) => {
    if (!selectedTracks.find(t => t.id === track.id)) {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t.id !== trackId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newTracks = [...selectedTracks];
    const temp = newTracks[index - 1];
    newTracks[index - 1] = newTracks[index];
    newTracks[index] = temp;
    setSelectedTracks(newTracks);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedTracks.length - 1) return;
    const newTracks = [...selectedTracks];
    const temp = newTracks[index + 1];
    newTracks[index + 1] = newTracks[index];
    newTracks[index] = temp;
    setSelectedTracks(newTracks);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("TITLE IS REQUIRED");
      return;
    }
    
    setIsSaving(true);
    try {
      let uploadedImageUrl = null;

      // 1. Upload Cover Image to Storage
      if (coverImageFile) {
        uploadedImageUrl = await uploadFileToSupabase(coverImageFile, `artworks/${releaseId}`);
      }

      // 2. Create Folder in DB
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .insert({
          release_id: releaseId,
          name: title.trim().toUpperCase(),
          cover_image: uploadedImageUrl
        })
        .select()
        .single();

      if (folderError) throw folderError;

      // 3. Link Tracks
      if (selectedTracks.length > 0) {
        const playlistTracks = selectedTracks.map((track, index) => ({
          folder_id: folderData.id,
          track_id: track.id,
          order_index: index
        }));

        const { error: linkError } = await supabase
          .from('playlist_tracks')
          .insert(playlistTracks);

        if (linkError) throw linkError;
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Failed to create playlist: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const unselectedTracks = trackPool.filter(
    poolTrack => !selectedTracks.some(t => t.id === poolTrack.id)
  );

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 overflow-y-auto">
      {/* Header */}
      <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100 sticky top-0 z-10">
        <h2 className="text-lg font-bold tracking-widest uppercase">CREATE PLAYLIST</h2>
        <button 
          onClick={onClose}
          disabled={isSaving}
          className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          [ BACK ]
        </button>
      </header>

      <div className="flex-1 flex flex-col p-6 gap-8">
        
        {/* Cover Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest uppercase">ARTWORK</label>
          <div className="flex items-end gap-4">
            <div 
              className="w-32 h-32 border border-black bg-zinc-100 flex items-center justify-center relative overflow-hidden shrink-0"
              style={coverImagePreview ? { backgroundImage: `url(${coverImagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!coverImagePreview && <span className="font-mono-tech text-xs text-zinc-400 text-center px-2">NO ARTWORK</span>}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button 
              onClick={triggerFileInput}
              disabled={isSaving}
              className="text-xs font-bold tracking-widest uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors h-fit bg-zinc-50 disabled:opacity-50"
            >
              [ + ADD ARTWORK ]
            </button>
          </div>
        </div>

        {/* Text Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest uppercase">TITLE</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.G. SUMMER DEMOS 2026"
              disabled={isSaving}
              className="w-full border border-black p-3 text-sm font-mono-tech outline-none uppercase bg-zinc-50 disabled:opacity-50"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest uppercase">DESCRIPTION</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="OPTIONAL DESCRIPTION"
              rows={3}
              disabled={isSaving}
              className="w-full border border-black p-3 text-sm font-mono-tech outline-none uppercase bg-zinc-50 resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Selected Tracks */}
        <div className="flex flex-col gap-2 mt-4 border-t border-black pt-6">
          <h3 className="text-sm font-bold tracking-widest uppercase">PLAYLIST TRACKS ({selectedTracks.length})</h3>
          
          {selectedTracks.length === 0 ? (
            <div className="border border-black p-4 text-xs font-mono-tech text-zinc-500 bg-zinc-50 text-center">
              NO TRACKS ADDED YET
            </div>
          ) : (
            <div className="flex flex-col gap-2 border border-black p-2 bg-zinc-50">
              {selectedTracks.map((track, index) => (
                <div key={track.id} className="flex items-center justify-between border border-black p-2 bg-white">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-mono-tech text-sm truncate uppercase font-bold">{track.title}</span>
                    <span className="font-mono-tech text-[10px] text-zinc-500">{track.bpm} BPM | {track.format}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0 || isSaving} className="w-8 h-8 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 text-xs font-mono-tech">
                      [ ↑ ]
                    </button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === selectedTracks.length - 1 || isSaving} className="w-8 h-8 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 text-xs font-mono-tech">
                      [ ↓ ]
                    </button>
                    <button onClick={() => handleRemoveTrack(track.id)} disabled={isSaving} className="w-8 h-8 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors text-xs font-mono-tech text-red-600 hover:text-red-400 disabled:opacity-30">
                      [ X ]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Track Pool */}
        <div className="flex flex-col gap-2 border-t border-black pt-6 mb-8">
          <h3 className="text-sm font-bold tracking-widest uppercase">TRACK POOL</h3>
          <div className="flex flex-col gap-2">
            {unselectedTracks.map(track => (
              <div key={track.id} className="flex items-center justify-between border border-black p-2 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-mono-tech text-sm truncate uppercase">{track.title}</span>
                  <span className="font-mono-tech text-[10px] text-zinc-500">{track.bpm} BPM | {track.format}</span>
                </div>
                <button 
                  onClick={() => handleAddTrack(track)}
                  disabled={isSaving}
                  className="px-3 py-1.5 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors text-xs font-mono-tech shrink-0 font-bold bg-white disabled:opacity-50"
                >
                  [ + ADD_TRACK ]
                </button>
              </div>
            ))}
            {unselectedTracks.length === 0 && (
              <div className="text-xs font-mono-tech text-zinc-500 p-2 border border-black text-center">
                ALL TRACKS ADDED
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sticky Save Button */}
      <div className="p-4 border-t border-black bg-white sticky bottom-0 z-10 mt-auto">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-black text-white p-4 font-bold tracking-widest uppercase flex items-center justify-center hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? "SAVING TO DB..." : "SAVE PLAYLIST"}
        </button>
      </div>

    </div>
  );
}
