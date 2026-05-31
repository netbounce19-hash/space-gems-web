"use client";

import { useState } from "react";
import { mockRelease } from "../../../mockData";
import { Plus, Image as ImageIcon, Type, FolderPlus, Share2, Settings, Lock, Download } from "lucide-react";

export default function ArtistDashboard() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    allowDownloads: true,
    requirePassword: true,
    password: "",
  });

  return (
    <div className="flex-1 flex flex-col bg-white w-full max-w-md mx-auto border-x border-black min-h-screen relative">
      {/* Header */}
      <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
            SG
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase">
            {mockRelease.artist} / DASHBOARD
          </h1>
        </div>
        <button className="p-2 border border-black hover:bg-black hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-black">
        <button className="flex flex-col items-center justify-center gap-2 p-6 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors group">
          <FolderPlus className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase text-center leading-tight">CREATE<br/>PLAYLIST</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 p-6 border border-black hover:bg-black hover:text-white transition-colors bg-zinc-50">
          <Plus className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">ADD TRACK</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 p-6 border border-black hover:bg-black hover:text-white transition-colors bg-zinc-50">
          <ImageIcon className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">ADD IMAGE</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 p-6 border border-black hover:bg-black hover:text-white transition-colors bg-zinc-50">
          <Type className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">ADD BIO</span>
        </button>
      </div>

      {/* Playlists Management */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold tracking-widest uppercase">YOUR PLAYLISTS</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {mockRelease.folders.map((folder) => (
            <div key={folder.id} className="border border-black p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 border border-black bg-zinc-200"
                    style={{ backgroundImage: `url(${folder.coverImage})`, backgroundSize: 'cover' }}
                  />
                  <div>
                    <h3 className="font-bold tracking-widest uppercase">{folder.name}</h3>
                    <p className="text-xs font-mono-tech text-zinc-500">{folder.tracks.length} TRACKS</p>
                  </div>
                </div>
                <button className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
                  EDIT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Release Action */}
      <div className="p-4 border-t border-black bg-zinc-50 mt-auto">
        <button 
          onClick={() => setShowShareModal(true)}
          className="w-full bg-black text-white p-4 font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white hover:text-black border border-black transition-colors"
        >
          <Share2 className="w-5 h-5" />
          CONFIGURE & SHARE LINK
        </button>
      </div>

      {/* Share Settings Modal */}
      {showShareModal && (
        <div className="absolute inset-0 z-50 bg-white border-black flex flex-col animate-in fade-in slide-in-from-bottom-4">
          <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100">
            <h2 className="text-lg font-bold tracking-widest uppercase">SHARE SETTINGS</h2>
            <button 
              onClick={() => setShowShareModal(false)}
              className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
            >
              CLOSE
            </button>
          </header>

          <div className="p-6 flex flex-col gap-8 flex-1">
            {/* Download Settings */}
            <div className="flex items-start justify-between border-b border-black pb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <h3 className="font-bold tracking-widest uppercase text-sm">ALLOW DOWNLOADS</h3>
                </div>
                <p className="text-xs font-mono-tech text-zinc-500">Allow listeners to download original files</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={shareSettings.allowDownloads}
                  onChange={(e) => setShareSettings({...shareSettings, allowDownloads: e.target.checked})}
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-checked:bg-black border border-black peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {/* Password Settings */}
            <div className="flex flex-col gap-4 border-b border-black pb-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <h3 className="font-bold tracking-widest uppercase text-sm">REQUIRE PASSWORD</h3>
                  </div>
                  <p className="text-xs font-mono-tech text-zinc-500">Protect this release with a password</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={shareSettings.requirePassword}
                    onChange={(e) => setShareSettings({...shareSettings, requirePassword: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-checked:bg-black border border-black peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {shareSettings.requirePassword && (
                <input 
                  type="text" 
                  placeholder="ENTER PASSWORD" 
                  value={shareSettings.password}
                  onChange={(e) => setShareSettings({...shareSettings, password: e.target.value})}
                  className="w-full border border-black p-3 text-sm font-mono-tech outline-none uppercase bg-zinc-50"
                />
              )}
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => {
                  alert("Link Copied to Clipboard!");
                  setShowShareModal(false);
                }}
                className="w-full bg-black text-white p-4 font-bold tracking-widest uppercase flex items-center justify-center hover:bg-white hover:text-black border border-black transition-colors"
              >
                GENERATE SECURE LINK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
