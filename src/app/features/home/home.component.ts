import { Component, inject, signal, OnInit, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { AppStore } from '../../core/store/app.store';
import { HistoryItem } from '../../core/services/indexed-db.service';
import { Track } from '../../core/models/track.model';
import { TuiIcon, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AddToPlaylistDialogComponent } from '../playlists/add-to-playlist-dialog/add-to-playlist-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TuiIcon, TuiButton],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly historyService = inject(HistoryService);
  private readonly playlistService = inject(PlaylistService);
  private readonly store = inject(AppStore);
  private readonly dialogs = inject(TuiDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recentlyPlayed = signal<HistoryItem[]>([]);
  protected readonly likedIds = this.playlistService.likedTrackIds;

  constructor() {
    effect(() => {
      this.historyService.version();
      this.loadRecentlyPlayed();
    });
  }

  ngOnInit() {
    this.loadRecentlyPlayed();
  }

  async loadRecentlyPlayed() {
    const history = await this.historyService.getHistory();
    this.recentlyPlayed.set(history.slice(0, 8));
  }

  playTrack(track: Track) {
    this.store.playTrackNow(track);
  }

  toggleLike(track: Track) {
    this.playlistService.toggleLike(track);
  }

  openAddToPlaylist(track: Track) {
    this.dialogs.open(
      new PolymorpheusComponent(AddToPlaylistDialogComponent),
      {
        data: track,
        label: 'Add to Playlist',
        dismissible: true,
      }
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();
  }
}
