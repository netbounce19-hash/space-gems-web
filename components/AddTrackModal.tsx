"use client";

import { useState, useRef } from "react";
import { uploadFileToSupabase } from "../utils/upload";
import { supabase } from "../lib/supabase";

interface AddTrackModalProps {
  releaseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTrackModal({ releaseId, onClose, onSuccess }: AddTrackModalProps) {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").toUpperCase()); // default title
      }
    }
  };

  const handleSave = async () => {
    if (!audioFile) {
      alert("PLEASE SELECT AN AUDIO FILE");
      return;
    }
    if (!title.trim()) {
      alert("TITLE IS REQUIRED");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const audioUrl = await uploadFileToSupabase(audioFile, `audio/${releaseId}`);

      // 2. Save to DB
      const { error } = await supabase.from('tracks').insert({
        release_id: releaseId,
        title: title.trim().toUpperCase(),
        audio_url: audioUrl,
        bpm: parseInt(bpm) || 0,
        format: audioFile.name.split('.').pop()?.toUpperCase() || 'WAV',
        file_size: (audioFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        duration: 0 // In a real app, we'd parse the audio duration here
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload track: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 overflow-y-auto">
      <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100 sticky top-0 z-10">
        <h2 className="text-lg font-bold tracking-widest uppercase">ADD NEW TRACK</h2>
        <button 
          onClick={onClose}
          disabled={isUploading}
          className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          [ BACK ]
        </button>
      </header>

      <div className="flex-1 flex flex-col p-6 gap-8">
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest uppercase">AUDIO FILE</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-bold tracking-widest uppercase border border-black px-4 py-3 hover:bg-black hover:text-white transition-colors bg-zinc-50 flex-1 text-left disabled:opacity-50 truncate"
            >
              {audioFile ? `[ SELECTED: ${audioFile.name} ]` : "[ + CHOOSE WAV / MP3 ]"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAudioChange} 
              accept="audio/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest uppercase">TRACK TITLE</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.G. MAIN_DEMO_v2"
              disabled={isUploading}
              className="w-full border border-black p-3 text-sm font-mono-tech outline-none uppercase bg-zinc-50 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-widest uppercase">BPM (OPTIONAL)</label>
            <input 
              type="number" 
              value={bpm}
              onChange={e => setBpm(e.target.value)}
              placeholder="120"
              disabled={isUploading}
              className="w-full border border-black p-3 text-sm font-mono-tech outline-none uppercase bg-zinc-50 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-black bg-white sticky bottom-0 z-10 mt-auto">
        <button 
          onClick={handleSave}
          disabled={isUploading || !audioFile}
          className="w-full bg-black text-white p-4 font-bold tracking-widest uppercase flex items-center justify-center hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? "UPLOADING TO SUPABASE..." : "UPLOAD TRACK"}
        </button>
      </div>
    </div>
  );
}
