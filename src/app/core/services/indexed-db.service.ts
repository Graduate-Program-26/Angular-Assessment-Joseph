import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Track } from '../models/track.model';

export interface HistoryItem extends Track {
  playedAt: string;
  userId: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  createdBy: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppDatabase extends Dexie {
  history!: Table<HistoryItem, number>;
  playlists!: Table<Playlist, string>;

  constructor() {
    super('DeeJayDB');
    this.version(2).stores({
      history: 'id, playedAt, userId',
      playlists: 'id, name, userId',
    });
  }
}
