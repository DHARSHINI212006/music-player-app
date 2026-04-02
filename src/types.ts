export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string; // e.g., "3:45"
  favorite: boolean;
  playCount: number;
  coverUrl: string;
}

export interface Playlist {
  songList: Song[];
  name: string;
  createdDate: string;
  songCount: number;
}

export type RecentlyPlayed = [Song?, Song?, Song?, Song?, Song?];
