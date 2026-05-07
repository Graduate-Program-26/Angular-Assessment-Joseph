import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Track } from '../models/track.model';

export interface HistoryItem extends Track {
  playedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  createdBy: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppDatabase extends Dexie {
  history!: Table<HistoryItem, number>;
  playlists!: Table<Playlist, string>;

  constructor() {
    super('DeeJayDB');
    this.version(1).stores({
      history: 'id, playedAt',
      playlists: 'id, name',
    });
  }
}
