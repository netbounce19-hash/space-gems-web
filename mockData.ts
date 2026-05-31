import { Release } from "./types";

export const mockRelease: Release = {
  id: "release_space_gems_01",
  slug: "space-gems-vol1",
  artist: "METAGHETTO",
  title: "SPACE_GEMS_VOL_1",
  coverImage: "/placeholder-banner.png", // Will use custom blueprint style in CSS
  folders: [
    {
      id: "folder_demos",
      name: "DEMOS",
      coverImage: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=400&h=400", // Placeholder cover
      tracks: [
        {
          id: "track_demo_01",
          title: "METAGHETTO_DEMO_v1.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          bpm: 122,
          bitDepth: "24-bit",
          sampleRate: "44.1kHz",
          fileSize: "45.2 MB",
          format: "WAV",
          duration: 372, // 6:12
        },
        {
          id: "track_demo_02",
          title: "GHETTO_BLASTER_v2_ROUGH.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          bpm: 128,
          bitDepth: "24-bit",
          sampleRate: "48.0kHz",
          fileSize: "51.7 MB",
          format: "WAV",
          duration: 425, // 7:05
        },
        {
          id: "track_demo_03",
          title: "DARK_SYNTH_sketch_44k.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          bpm: 115,
          bitDepth: "16-bit",
          sampleRate: "44.1kHz",
          fileSize: "28.4 MB",
          format: "WAV",
          duration: 344, // 5:44
        },
      ],
    },
    {
      id: "folder_masters",
      name: "MASTERS",
      coverImage: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&q=80&w=400&h=400", // Placeholder cover
      tracks: [
        {
          id: "track_master_01",
          title: "STREET_LIGHTS_MASTER.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
          bpm: 92,
          bitDepth: "24-bit",
          sampleRate: "96.0kHz",
          fileSize: "112.5 MB",
          format: "WAV",
          duration: 302, // 5:02
        },
        {
          id: "track_master_02",
          title: "VOODOO_PEOPLE_REMIX_FINAL.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
          bpm: 140,
          bitDepth: "24-bit",
          sampleRate: "48.0kHz",
          fileSize: "84.1 MB",
          format: "WAV",
          duration: 362, // 6:02
        },
      ],
    },
    {
      id: "folder_beats",
      name: "BEATS",
      coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400&h=400", // Placeholder cover
      tracks: [
        {
          id: "track_beat_01",
          title: "HIPHOP_LOOP_90BPM_dry.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
          bpm: 90,
          bitDepth: "24-bit",
          sampleRate: "44.1kHz",
          fileSize: "38.9 MB",
          format: "WAV",
          duration: 338, // 5:38
        },
        {
          id: "track_beat_02",
          title: "TRAP_BANGER_808_130bpm.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
          bpm: 130,
          bitDepth: "24-bit",
          sampleRate: "44.1kHz",
          fileSize: "41.2 MB",
          format: "WAV",
          duration: 394, // 6:34
        },
        {
          id: "track_beat_03",
          title: "LOFI_CHILL_v9_stems.wav",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
          bpm: 85,
          bitDepth: "24-bit",
          sampleRate: "48.0kHz",
          fileSize: "49.6 MB",
          format: "WAV",
          duration: 318, // 5:18
        },
      ],
    },
  ],
};
