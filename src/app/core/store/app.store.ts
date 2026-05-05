import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { Album, Artist, Track } from '../models/track.model';
import { DeezerService } from '../services/deezer.service';

export interface AppState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  searchTerm: string;
  activeTab: string;
}

const initialState: AppState = {
  currentTrack: null,
  isPlaying: false,
  volume: 80,
  queue: [],
  searchTerm: '',
  activeTab: 'All',
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setCurrentTrack(track: Track): void {
      patchState(store, { currentTrack: track, isPlaying: true });
    },
    togglePlay(): void {
      patchState(store, { isPlaying: !store.isPlaying() });
    },
    setVolume(volume: number): void {
      patchState(store, { volume });
    },
    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },
    setActiveTab(activeTab: string): void {
      patchState(store, { activeTab });
    },
    addToQueue(track: Track): void {
      patchState(store, { queue: [...store.queue(), track] });
    },
    removeFromQueue(trackId: number): void {
      patchState(store, {
        queue: store.queue().filter((t) => t.id !== trackId),
      });
    },
    clearQueue(): void {
      patchState(store, { queue: [] });
    },
  }))
);
