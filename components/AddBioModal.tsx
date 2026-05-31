"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { supabase } from "../lib/supabase";

interface AddBioModalProps {
  releaseId: string;
  initialBio: string;
  onClose: () => void;
  onSuccess: (newBio: string) => void;
}

export default function AddBioModal({ releaseId, initialBio, onClose, onSuccess }: AddBioModalProps) {
  const [bio, setBio] = useState(initialBio || "");
  const [isSaving, setIsSaving] = useState(false);
  const MAX_CHARS = 300;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('releases')
        .update({ bio })
        .eq('id', releaseId);

      if (error) throw error;
      onSuccess(bio);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save bio: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4">
      <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100">
        <h2 className="text-lg font-bold tracking-widest uppercase">EDIT BIO</h2>
        <button 
          onClick={onClose}
          disabled={isSaving}
          className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          [ BACK ]
        </button>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold tracking-widest uppercase">SHORT DESCRIPTION</label>
          <span className={`text-xs font-mono-tech ${bio.length > MAX_CHARS ? 'text-red-600' : 'text-zinc-500'}`}>
            {bio.length} / {MAX_CHARS}
          </span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="ENTER A SHORT BIO OR RELEASE DESCRIPTION..."
          disabled={isSaving}
          maxLength={MAX_CHARS}
          className="w-full flex-1 border border-black p-4 text-sm font-mono-tech outline-none uppercase bg-zinc-50 disabled:opacity-50 resize-none leading-relaxed"
        />
        <p className="text-[10px] text-zinc-500 font-mono-tech uppercase leading-tight">
          THIS TEXT WILL BE DISPLAYED ON THE SHAREABLE PAGE FOR YOUR LISTENERS. KEEP IT SHORT AND IMPACTFUL.
        </p>
      </div>

      <div className="p-4 border-t border-black bg-white mt-auto">
        <button 
          onClick={handleSave}
          disabled={isSaving || bio.length > MAX_CHARS}
          className="w-full bg-black text-white p-4 font-bold tracking-widest uppercase flex items-center justify-center hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? "SAVING..." : "SAVE BIO"}
        </button>
      </div>
    </div>
  );
}
