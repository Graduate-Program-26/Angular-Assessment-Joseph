export interface Track {
  id: number;
  title: string;
  duration: number;
  preview: string;
  type: 'track';
  explicit_lyrics?: boolean;
  rank: number;
  artist?: Artist;
  album?: Album;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface Artist {
  id: number;
  name: string;
  picture_medium?: string;
  picture_xl?: string;
  picture_small?: string;
  nb_album?: number;
  nb_fan?: number;
  type?: 'artist';
}

export interface Album {
  id: number;
  title: string;
  cover_medium: string;
  cover_small: string;
  cover_big?: string;
  cover_xl?: string;
  tracklist: string;
  artist?: Artist;
  type: 'album';
  release_date: string;
  nb_tracks?: number;
  fans?: number;
  tracks?: {data: Track[], total: number};
}

export type SearchItem = Track | Artist | Album;
