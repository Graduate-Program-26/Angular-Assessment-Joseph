import { inject, Injectable, effect } from '@angular/core';
import { AppStore } from '../store/app.store';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly store = inject(AppStore);
  private readonly audio = new Audio();

  constructor() {
    // Sync isPlaying state
    effect(() => {
      const isPlaying = this.store.isPlaying();
      const currentTrack = this.store.currentTrack();

      if (currentTrack && isPlaying) {
        this.audio.play().catch(err => {
          console.error('Playback failed:', err);
          this.store.togglePlay();
        });
      } else {
        this.audio.pause();
      }
    });

    // Sync currentTrack (Source)
    effect(() => {
      const track = this.store.currentTrack();
      if (track?.preview && this.audio.src !== track.preview) {
        this.audio.src = track.preview;
        this.audio.load();
        if (this.store.isPlaying()) {
          this.audio.play().catch(() => {
            this.store.togglePlay();
          });
        }
      }
    });

    // sync Muted state
    effect(() => {
      const muted = this.store.muted();
      this.audio.muted = muted;
    });

    // Sync Volume
    effect(() => {
      const volume = this.store.volume();
      this.audio.volume = volume / 100;
    });

    // Handle progress updates
    this.audio.ontimeupdate = () => {
      this.store.updateProgress(this.audio.currentTime, this.audio.duration || 0);
    };

    // Handle track end
    this.audio.onended = () => {
      if (this.store.repeatMode() === 'one') {
        this.audio.currentTime = 0;
        this.audio.play();
        return;
      }
      const currentSongIndex = this.store.queue().findIndex((t) => t.id === this.store.currentTrack()?.id);
      if (this.store.repeatMode() === 'off' && currentSongIndex === this.store.queue().length - 1) {
        this.audio.pause();
        return;
      }
      if (this.store.repeatMode() === 'all' ){
        this.store.playNext();
        return;
      }
      this.store.playNext();
    };
  }

  playNext(): void {
    this.store.playNext();
  }

  playPrevious(): void {
    this.store.playPrevious();
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }
}
