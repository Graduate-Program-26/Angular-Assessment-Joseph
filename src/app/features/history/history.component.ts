import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { HistoryService } from '../../core/services/history.service';
import { TimeAgoPipe } from '../../core/pipes/time-ago.pipe';
import { DurationPipe } from '../../core/pipes/duration.pipe';
import { TuiLoader, tuiLoaderOptionsProvider, TuiIcon, TuiDialogService, TuiButton, TuiDropdown, TuiDataList } from '@taiga-ui/core';
import { AppStore } from '../../core/store/app.store';
import { HistoryItem } from '../../core/services/indexed-db.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AddToPlaylistDialogComponent } from '../playlists/add-to-playlist-dialog/add-to-playlist-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-history',
  imports: [TimeAgoPipe, DurationPipe, TuiLoader, TuiIcon, TuiButton, TuiDropdown, TuiDataList],
  standalone: true,
  templateUrl: './history.component.html',
  providers: [
    tuiLoaderOptionsProvider({
      size: 'xxl',
      inheritColor: false,
      overlay: true,
    }),
  ],
})
export class HistoryComponent {
  private readonly historyService = inject(HistoryService);
  private readonly playlistService = inject(PlaylistService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly store = inject(AppStore);
  private readonly destroyRef = inject(DestroyRef);
  
  protected readonly likedIds = this.playlistService.likedTrackIds;

  readonly isLoading = signal(true);
  readonly items = signal<HistoryItem[]>([]);
  readonly tick = signal(0);

  playtrack(track: HistoryItem): void {
    this.store.playTrackNow(track);
  }

  toggleLike(track: HistoryItem): void {
    this.playlistService.toggleLike(track);
  }

  openAddToPlaylist(track: HistoryItem): void {
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

  constructor() {
    effect(() => {
      this.historyService.version(); 
      if (this.items().length === 0) this.isLoading.set(true);
      this.historyService.getHistory().then((history) => {
        this.items.set(history);
        this.isLoading.set(false);
      });
    });

    const interval = setInterval(() => this.tick.update(t => t + 1), 5000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }
}
