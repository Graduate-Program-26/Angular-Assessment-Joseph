import { Component, computed, inject, DestroyRef } from '@angular/core';
import { TuiIcon, TuiDialogService, TuiButton } from '@taiga-ui/core';
import { AppStore } from '../../../../core/store/app.store';
import { DurationPipe } from '../../../../core/pipes/duration.pipe';
import { TuiTiles } from '@taiga-ui/kit';
import { PlaylistService } from '../../../../core/services/playlist.service';
import { Track } from '../../../../core/models/track.model';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AddToPlaylistDialogComponent } from '../../../../features/playlists/add-to-playlist-dialog/add-to-playlist-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-queue-content',
  standalone: true,
  imports: [TuiIcon, DurationPipe, TuiTiles, TuiButton],
  templateUrl: './queue-content.component.html',
  styleUrl: './queue-content.component.less',
})
export class QueueContentComponent {
  protected readonly store = inject(AppStore);
  private readonly playlistService = inject(PlaylistService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly destroyRef = inject(DestroyRef);

  order = computed(() => { return new Map<number, number>(this.store.queue().map((_, index) => [index, index])) });
  
  onOrderChange(newOrder: Map<number, number>): void {
    const updatedTracks = new Array(this.store.queue().length);
    newOrder.forEach((newIndex, originalIndex) => {
      updatedTracks[newIndex] = this.store.queue()[originalIndex];
    });
    this.store.setQueue(updatedTracks);
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