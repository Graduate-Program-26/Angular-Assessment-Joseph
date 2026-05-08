import { Injectable, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { HistoryService } from './history.service';
import { PlaylistService } from './playlist.service';

@Injectable({ providedIn: 'root' })
export class SyncMediatorService {
  private readonly auth = inject(AuthService);
  private readonly history = inject(HistoryService);
  private readonly playlists = inject(PlaylistService);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        // Trigger initial sync on login
        this.triggerSync();
      }
    });
  }

  triggerSync(): void {
    if (this.auth.currentUser()) {
      this.history.syncWithCloud();
      this.playlists.syncWithCloud();
    }
  }
}
