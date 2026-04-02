import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Search, 
  Heart, 
  Clock, 
  Music, 
  ListMusic, 
  Filter,
  ChevronDown,
  History
} from "lucide-react";
import { Song, RecentlyPlayed } from "./types";
import { MOCK_SONGS } from "./mockData";

export default function App() {
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedArtist, setSelectedArtist] = useState<string>("All");
  const [sortByField, setSortByField] = useState<keyof Song>("title");
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed>([undefined, undefined, undefined, undefined, undefined]);

  // Derived data
  const genres = useMemo(() => ["All", ...new Set(songs.map(s => s.genre))], [songs]);
  const artists = useMemo(() => ["All", ...new Set(songs.map(s => s.artist))], [songs]);

  // Filter functions
  const filterByGenre = (songList: Song[], genre: string) => {
    if (genre === "All") return songList;
    return songList.filter(s => s.genre === genre);
  };

  const filterByArtist = (songList: Song[], artist: string) => {
    if (artist === "All") return songList;
    return songList.filter(s => s.artist === artist);
  };

  const sortBy = <K extends keyof Song>(songList: Song[], field: K) => {
    return [...songList].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (typeof valA === "string" && typeof valB === "string") {
        return valA.localeCompare(valB);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return (valB as number) - (valA as number); // Descending for numbers (playCount)
      }
      return 0;
    });
  };

  const filteredSongs = useMemo(() => {
    let result = songs.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.album.toLowerCase().includes(searchQuery.toLowerCase())
    );
    result = filterByGenre(result, selectedGenre);
    result = filterByArtist(result, selectedArtist);
    result = sortBy(result, sortByField);
    return result;
  }, [songs, searchQuery, selectedGenre, selectedArtist, sortByField]);

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      
      // Update recently played (fixed tuple of 5)
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(s => s?.id !== song.id);
        const next = [song, ...filtered].slice(0, 5);
        // Ensure it's exactly 5 elements for the tuple type
        const newRecentlyPlayed: RecentlyPlayed = [
          next[0] || undefined,
          next[1] || undefined,
          next[2] || undefined,
          next[3] || undefined,
          next[4] || undefined
        ];
        return newRecentlyPlayed;
      });

      // Increment play count locally
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, playCount: s.playCount + 1 } : s));
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSongs(prev => prev.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Music className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              VibeStream
            </h1>
          </div>

          <div className="flex flex-1 max-w-xl items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 focus-within:border-indigo-500/50 transition-all">
            <Search className="w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search songs, artists, or albums..." 
              className="bg-transparent border-none focus:ring-0 w-full px-3 text-sm placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors relative">
              <History className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-zinc-950"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Filters */}
          <aside className="lg:col-span-3 space-y-8">
            <section>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Genre</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Artist</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
                      value={selectedArtist}
                      onChange={(e) => setSelectedArtist(e.target.value)}
                    >
                      {artists.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Sort By</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
                      value={sortByField}
                      onChange={(e) => setSortByField(e.target.value as keyof Song)}
                    >
                      <option value="title">Title</option>
                      <option value="artist">Artist</option>
                      <option value="playCount">Popularity</option>
                      <option value="duration">Duration</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Recently Played
              </h2>
              <div className="space-y-3">
                {recentlyPlayed.map((song, idx) => song ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`${song.id}-${idx}`}
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
                    <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-indigo-400 transition-colors">{song.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div key={idx} className="h-10 border border-dashed border-zinc-800 rounded flex items-center justify-center">
                    <span className="text-[10px] text-zinc-700 uppercase tracking-widest">Empty</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-indigo-500" />
                Your Playlist
                <span className="text-sm font-normal text-zinc-500 ml-2">({filteredSongs.length} songs)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredSongs.map((song) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={song.id}
                    className={`group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer ${currentSong?.id === song.id ? 'ring-2 ring-indigo-500/50 bg-zinc-900' : ''}`}
                    onClick={() => handlePlaySong(song)}
                  >
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                          {currentSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                        </div>
                      </div>
                      {currentSong?.id === song.id && (
                        <div className="absolute bottom-2 right-2 bg-indigo-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">
                          Now Playing
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold truncate group-hover:text-indigo-400 transition-colors">{song.title}</h3>
                        <button 
                          onClick={(e) => toggleFavorite(song.id, e)}
                          className={`p-1 rounded-full hover:bg-zinc-800 transition-colors ${song.favorite ? 'text-rose-500' : 'text-zinc-600'}`}
                        >
                          <Heart className={`w-4 h-4 ${song.favorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                      <p className="text-xs text-zinc-500 truncate italic">{song.album}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {song.duration}
                      </span>
                      <span>{song.genre}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredSongs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No songs found matching your criteria</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedGenre("All"); setSelectedArtist("All"); }}
                  className="mt-4 text-indigo-500 hover:underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Player Bar */}
      <AnimatePresence>
        {currentSong && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-6 py-4 z-[100]"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Song Info */}
              <div className="flex items-center gap-4 w-1/3">
                <img 
                  src={currentSong.coverUrl} 
                  alt={currentSong.title} 
                  className="w-14 h-14 rounded-lg object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="font-bold truncate">{currentSong.title}</h4>
                  <p className="text-sm text-zinc-400 truncate">{currentSong.artist}</p>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(currentSong.id, e)}
                  className={`ml-2 p-2 rounded-full hover:bg-zinc-800 transition-colors ${currentSong.favorite ? 'text-rose-500' : 'text-zinc-600'}`}
                >
                  <Heart className={`w-5 h-5 ${currentSong.favorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-center gap-6">
                  <button className="text-zinc-400 hover:text-white transition-colors">
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                  </button>
                  <button className="text-zinc-400 hover:text-white transition-colors">
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                </div>
                <div className="w-full max-w-md flex items-center gap-3">
                  <span className="text-[10px] text-zinc-500 font-mono">1:24</span>
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden group cursor-pointer relative">
                    <div className="absolute inset-0 bg-indigo-500 w-1/3 group-hover:bg-indigo-400 transition-colors"></div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{currentSong.duration}</span>
                </div>
              </div>

              {/* Extra Controls */}
              <div className="flex items-center justify-end gap-4 w-1/3">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Plays: {currentSong.playCount}</div>
                </div>
                <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 w-2/3"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
