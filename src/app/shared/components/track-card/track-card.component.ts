import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../../core/models/track.model';
import { TuiIcon, TuiButton, TuiDialogService, TuiDropdown, TuiDataList } from '@taiga-ui/core';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AppStore } from '../../../core/store/app.store';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AddToPlaylistDialogComponent } from '../../../features/playlists/add-to-playlist-dialog/add-to-playlist-dialog.component';

@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [CommonModule, TuiIcon, TuiButton, TuiDropdown, TuiDataList],
  template: `
    <div (click)="play()"
         class="flex items-center gap-4 p-3 rounded-xl hover:bg-(--tui-background-elevation-1) transition-all group cursor-pointer border border-transparent hover:border-(--tui-border-normal)">
      
      @if (showIndex) {
        <span class="w-6 text-center text-sm font-bold text-(--tui-text-secondary) group-hover:text-purple-400">{{ index }}</span>
      }

      @if (!hideImage) {
        <div class="relative w-12 h-12 rounded shadow-lg overflow-hidden shrink-0">
          <img [src]="track.album?.cover_small" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <tui-icon icon="@tui.play" class="text-white text-xl"></tui-icon>
          </div>
        </div>
      } @else {
        <div class="w-6 flex items-center justify-center">
           <tui-icon icon="@tui.play" class="hidden group-hover:block text-purple-400 text-xs"></tui-icon>
        </div>
      }

      <div class="flex flex-col flex-1 min-w-0">
        <span class="font-bold text-var(--tui-text-primary) truncate group-hover:text-purple-400 transition-colors">{{ track.title }}</span>
        @if (!hideArtist) {
          <span class="text-xs text-(--tui-text-secondary) truncate">{{ track.artist?.name || 'Unknown Artist' }}</span>
        }
      </div>

      <!-- Desktop Actions -->
      <div class="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button tuiIconButton type="button" appearance="flat" size="s" 
          [iconStart]="likedIds().has(track.id) ? '@tui.heart-filled' : '@tui.heart'"
          class="!text-var(--tui-text-primary) hover:!text-red-500 rounded-full"
          [class.!text-red-500]="likedIds().has(track.id)"
          (click)="$event.stopPropagation(); toggleLike()">
        </button>
        <button tuiIconButton type="button" appearance="flat" size="s" iconStart="@tui.plus"
          class="!text-var(--tui-text-primary) hover:!text-purple-400 rounded-full"
          (click)="$event.stopPropagation(); openAddToPlaylist()">
        </button>
        @if (showRemove) {
          <button tuiIconButton type="button" appearance="flat" size="s" iconStart="@tui.trash"
            class="!text-red-400 hover:!bg-red-400/10 rounded-full"
            (click)="$event.stopPropagation(); remove.emit(track)">
          </button>
        }
      </div>

      <!-- Mobile Actions / Menu -->
      <div class="md:hidden">
        <button tuiIconButton type="button" appearance="flat" size="s" iconStart="@tui.ellipsis"
          class="!text-var(--tui-text-primary) rounded-full"
          [tuiDropdown]="menu" (click)="$event.stopPropagation()">
        </button>
        <ng-template #menu>
          <tui-data-list>
            <button tuiOption (click)="toggleLike()">
              <tui-icon [icon]="likedIds().has(track.id) ? '@tui.heart-filled' : '@tui.heart'" 
                class="mr-2" [class.text-red-500]="likedIds().has(track.id)"></tui-icon>
              {{ likedIds().has(track.id) ? 'Unlike' : 'Like' }}
            </button>
            <button tuiOption (click)="openAddToPlaylist()">
              <tui-icon icon="@tui.plus" class="mr-2"></tui-icon> Add to Playlist
            </button>
            @if (showRemove) {
              <button tuiOption (click)="remove.emit(track)" class="text-red-500">
                <tui-icon icon="@tui.trash" class="mr-2"></tui-icon> Remove
              </button>
            }
          </tui-data-list>
        </ng-template>
      </div>
    </div>
  `,
})
export class TrackCardComponent {
  @Input({ required: true }) track!: Track;
  @Input() index?: number;
  @Input() showIndex = false;
  @Input() hideImage = false;
  @Input() hideArtist = false;
  @Input() showRemove = false;
  @Output() remove = new EventEmitter<Track>();
  
  private readonly playlistService = inject(PlaylistService);
  private readonly store = inject(AppStore);
  private readonly dialogs = inject(TuiDialogService);

  protected readonly likedIds = this.playlistService.likedTrackIds;

  play() {
    this.store.playTrackNow(this.track);
  }

  toggleLike() {
    this.playlistService.toggleLike(this.track);
  }

  openAddToPlaylist() {
    this.dialogs.open(
      new PolymorpheusComponent(AddToPlaylistDialogComponent),
      {
        data: this.track,
        label: 'Add to Playlist',
        dismissible: true,
      }
    ).subscribe();
  }
}
