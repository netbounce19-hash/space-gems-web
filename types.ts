export interface Track {
  id: string;
  title: string;          // e.g. "METAGHETTO_DEMO_v2.wav"
  audioUrl: string;       // URL for streaming
  bpm: number;            // Beats per minute, e.g. 122
  bitDepth: string;       // e.g. "24-bit"
  sampleRate: string;     // e.g. "44.1kHz"
  fileSize: string;       // e.g. "45.2 MB"
  format: string;         // e.g. "WAV"
  duration: number;       // Duration in seconds
}

export interface Folder {
  id: string;
  name: string;           // e.g. "DEMOS", "MASTERS", "BEATS"
  coverImage: string;
  tracks: Track[];
}

export interface Release {
  id: string;
  slug: string;
  artist: string;
  title: string;
  coverImage: string;
  folders: Folder[];
}
