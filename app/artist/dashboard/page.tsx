"use client";

import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Type, FolderPlus, Share2, Settings, Lock, Download } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import CreatePlaylistModal from "../../../components/CreatePlaylistModal";
import AddTrackModal from "../../../components/AddTrackModal";
import { Folder, Track } from "../../../types";

export default function ArtistDashboard() {
  const [release, setRelease] = useState<any>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [trackPool, setTrackPool] = useState<Track[]>([]);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [shareSettings, setShareSettings] = useState({
    allowDownloads: true,
    requirePassword: false,
    password: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Get or create default release for MVP
      let { data: rel, error: relError } = await supabase
        .from('releases')
        .select('*')
        .eq('slug', 'space-gems-vol1')
        .single();
        
      if (!rel && relError?.code === 'PGRST116') {
        const { data: newRel } = await supabase.from('releases').insert({
          slug: 'space-gems-vol1',
          artist: 'METAGHETTO',
          title: 'SPACE_GEMS_VOL_1',
          cover_image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=400&h=400'
        }).select().single();
        rel = newRel;
      }
      setRelease(rel);

      if (!rel) return;

      // 2. Fetch folders
      const { data: fData } = await supabase
        .from('folders')
        .select(`
          id, name, cover_image,
          playlist_tracks (
            order_index,
            tracks (*)
          )
        `)
        .eq('release_id', rel.id);

      // Format folders to match Folder interface
      const formattedFolders: Folder[] = (fData || []).map((f: any) => {
        // Sort tracks by order_index
        const sortedTracks = f.playlist_tracks
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((pt: any) => pt.tracks);
          
        return {
          id: f.id,
          name: f.name,
          coverImage: f.cover_image,
          tracks: sortedTracks
        };
      });
      setFolders(formattedFolders);

      // 3. Fetch track pool
      const { data: tData } = await supabase
        .from('tracks')
        .select('*')
        .eq('release_id', rel.id)
        .order('created_at', { ascending: false });
        
      // map to standard Track type
      const formattedPool: Track[] = (tData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        audioUrl: t.audio_url,
        bpm: t.bpm,
        bitDepth: t.bit_depth || "24-bit",
        sampleRate: t.sample_rate || "48kHz",
        format: t.format,
        fileSize: t.file_size,
        duration: t.duration || 0
      }));
      setTrackPool(formattedPool);
      
    } catch (e) {
      console.error("Failed to load data from Supabase", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const removeFolder = async (id: string) => {
    await supabase.from('folders').delete().eq('id', id);
    setFolders(folders.filter(f => f.id !== id));
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-white font-mono-tech text-xs tracking-widest uppercase">LOADING SUPABASE DATA...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-white w-full max-w-md mx-auto border-x border-black min-h-screen relative overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
            SG
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase">
            {release?.artist} / DASHBOARD
          </h1>
        </div>
        <button className="p-2 border border-black hover:bg-black hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-black">
        <button 
          onClick={() => setIsCreatingPlaylist(true)}
          className="flex flex-col items-center justify-center gap-2 p-6 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors group"
        >
          <FolderPlus className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase text-center leading-tight">CREATE<br/>PLAYLIST</span>
        </button>
        <button 
          onClick={() => setIsAddingTrack(true)}
          className="flex flex-col items-center justify-center gap-2 p-6 border border-black hover:bg-black hover:text-white transition-colors bg-zinc-50"
        >
          <Plus className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">ADD TRACK</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 p-6 border border-black hover:bg-black hover:text-white transition-colors bg-zinc-50 opacity-50">
          <ImageIcon className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">ADD IMAGE</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 p-6 border border-black hover:bg-black hover:text-white transition-colors bg-zinc-50 opacity-50">
          <Type className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">ADD BIO</span>
        </button>
      </div>

      {/* Playlists Management */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold tracking-widest uppercase">YOUR PLAYLISTS</h2>
        </div>
        
        {folders.length === 0 ? (
          <div className="border border-black p-8 flex flex-col items-center justify-center gap-4 bg-zinc-50">
            <span className="font-mono-tech text-xs text-zinc-500 uppercase">NO PLAYLISTS CREATED</span>
            <button 
              onClick={() => setIsCreatingPlaylist(true)}
              className="text-xs font-bold tracking-widest uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors bg-white"
            >
              [ + CREATE FIRST PLAYLIST ]
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {folders.map((folder) => (
              <div key={folder.id} className="border border-black p-4 flex flex-col gap-3 group bg-white hover:bg-zinc-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 border border-black bg-zinc-200 shrink-0"
                      style={{ backgroundImage: `url(${folder.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div className="flex flex-col">
                      <h3 className="font-bold tracking-widest uppercase truncate max-w-[180px]">{folder.name}</h3>
                      <p className="text-[10px] font-mono-tech text-zinc-500">{folder.tracks.length} TRACKS</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button className="text-[10px] font-bold tracking-widest uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                      [ EDIT ]
                    </button>
                    <button 
                      onClick={() => removeFolder(folder.id)}
                      className="text-[10px] font-bold tracking-widest uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors text-red-600 border-red-200 hover:border-red-600 bg-red-50 opacity-0 group-hover:opacity-100"
                    >
                      [ DELETE ]
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Modals */}
      {isCreatingPlaylist && release && (
        <CreatePlaylistModal 
          releaseId={release.id} 
          trackPool={trackPool}
          onClose={() => setIsCreatingPlaylist(false)} 
          onSuccess={() => {
            setIsCreatingPlaylist(false);
            loadData(); // reload to get new playlist
          }}
        />
      )}

      {isAddingTrack && release && (
        <AddTrackModal 
          releaseId={release.id} 
          onClose={() => setIsAddingTrack(false)} 
          onSuccess={() => {
            setIsAddingTrack(false);
            loadData(); // reload track pool
          }}
        />
      )}

      {showShareModal && release && (
        <div className="absolute inset-0 z-50 bg-white border-black flex flex-col animate-in fade-in slide-in-from-bottom-4">
          <header className="border-b border-black py-4 px-4 flex justify-between items-center bg-zinc-100">
            <h2 className="text-lg font-bold tracking-widest uppercase">SHARE SETTINGS</h2>
            <button 
              onClick={() => setShowShareModal(false)}
              className="text-xs font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
            >
              [ CLOSE ]
            </button>
          </header>

          <div className="p-6 flex flex-col gap-8 flex-1">
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
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/share/${release.slug}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert(`Link Copied to Clipboard!\n\n${shareUrl}`);
                  setShowShareModal(false);
                }}
                className="w-full bg-black text-white p-4 font-bold tracking-widest uppercase flex items-center justify-center hover:bg-white hover:text-black border border-black transition-colors"
              >
                COPY SECURE LINK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
