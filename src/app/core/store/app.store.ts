import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Track } from '../models/track.model';

export interface AppState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  searchTerm: string;
}

const initialState: AppState = {
  currentTrack: null,
  isPlaying: false,
  volume: 80,
  queue: [],
  searchTerm: '',
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
