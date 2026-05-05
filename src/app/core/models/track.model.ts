export interface Track {
  id: number;
  title: string;
  duration: number;
  preview: string;
  type: 'track';
  explicit_lyrics?: boolean;
  artist: {
    id: number;
    name: string;
    picture?: string;
    picture_small?: string;
    picture_medium?: string;
    picture_big?: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface Artist {
  id: number;
  name: string;
  picture_medium: string;
  picture_xl?: string;
  nb_album?: number;
  nb_fan?: number;
  type: 'artist';
}

export interface Album {
  id: number;
  title: string;
  cover_medium: string;
  artist: {
    name: string;
  };
  type: 'album';
}

export type SearchItem = Track | Artist | Album;
