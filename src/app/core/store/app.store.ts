import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Track } from '../models/track.model';
import { HistoryService } from '../services/history.service';

export interface AppState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  searchTerm: string;
  activeTab: string;
  currentTime: number;
  duration: number;
  muted: boolean;
  repeatMode: (typeof repeatModes)[number];
  shuffled: boolean;
}

const repeatModes = ['off', 'all', 'one'] as const;

const initialState: AppState = {
  currentTrack: null,
  isPlaying: false,
  volume: 80,
  queue: [],
  searchTerm: '',
  activeTab: 'All',
  currentTime: 0,
  duration: 0,
  muted: false,
  repeatMode: 'off',
  shuffled: false,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, historyService = inject(HistoryService)) => ({
    setCurrentTrack(track: Track): void {
      patchState(store, { currentTrack: track, isPlaying: true });
      historyService.addToHistory(track);
    },
    togglePlay(): void {
      patchState(store, { isPlaying: !store.isPlaying() });
    },
    setVolume(volume: number): void {
      patchState(store, { volume });
    },
    toggleMute(): void {
      patchState(store, { muted: !store.muted() });
    },
    toggleShuffle(): void {
      patchState(store, { shuffled: !store.shuffled() });
    },
    toggleRepeat(): void {
      const nextMode =
        repeatModes[(repeatModes.indexOf(store.repeatMode()) + 1) % repeatModes.length];
      patchState(store, { repeatMode: nextMode });
    },
    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },
    setActiveTab(activeTab: string): void {
      patchState(store, { activeTab });
    },
    updateProgress(currentTime: number, duration: number): void {
      patchState(store, { currentTime, duration });
    },
    setQueue(tracks: Track[]): void {
      patchState(store, { queue: tracks });
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
    playNext(): void {
      const queue = store.queue();
      const current = store.currentTrack();
      if (!current || queue.length === 0) return;

      if (store.shuffled()) {
        const otherTracks = queue.filter((t) => t.id !== current.id);
        const next =
          otherTracks.length > 0
            ? otherTracks[Math.floor(Math.random() * otherTracks.length)]
            : current;
        patchState(store, { currentTrack: next, isPlaying: true });
      } else {
        const index = queue.findIndex((t) => t.id === current.id);
        const next = queue[(index + 1) % queue.length];
        patchState(store, { currentTrack: next, isPlaying: true });
      }
      historyService.addToHistory(store.currentTrack()!);
    },
    playPrevious(): void {
      const queue = store.queue();
      const current = store.currentTrack();
      if (!current || queue.length === 0) return;

      if (store.shuffled()) {
        const otherTracks = queue.filter((t) => t.id !== current.id);
        const prev =
          otherTracks.length > 0
            ? otherTracks[Math.floor(Math.random() * otherTracks.length)]
            : current;
        patchState(store, { currentTrack: prev, isPlaying: true });
      } else {
        const index = queue.findIndex((t) => t.id === current.id);
        const prev = queue[(index - 1 + queue.length) % queue.length];
        patchState(store, { currentTrack: prev, isPlaying: true });
      }
      historyService.addToHistory(store.currentTrack()!);
    },
    playTrackAtQueueIndex(index: number) {
      const currentTrack = store.currentTrack();
      const queue = store.queue();
      if (!currentTrack || queue.length === 0) return;
      const track = queue[index];
      patchState(store, { currentTrack: track, isPlaying: true });
      historyService.addToHistory(store.currentTrack()!);
    },
    playTrackNow(track: Track): void {
      const queue = store.queue();
      const isAlreadyInQueue = queue.some((t) => t.id === track.id);
      if (!isAlreadyInQueue) {
        patchState(store, { queue: [track, ...queue] });
      }
      patchState(store, { currentTrack: track, isPlaying: true });
      historyService.addToHistory(store.currentTrack()!);
    },
    playTracklistNow(tracks: Track[], startIndex?: number): void {
      if (tracks.length === 0) return;
      const trackToPlay = tracks[startIndex ? startIndex : 0];
      patchState(store, { queue: tracks, currentTrack: trackToPlay, isPlaying: true });
      historyService.addToHistory(store.currentTrack()!);
    },
  })),
);
