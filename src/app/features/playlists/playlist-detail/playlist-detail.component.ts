import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { Playlist } from '../../../core/services/indexed-db.service';
import { TuiIcon, TuiButton, TuiDropdown, TuiDropdownOpen, TuiDataList, TuiDialogService } from '@taiga-ui/core';
import { AppStore } from '../../../core/store/app.store';
import { Track } from '../../../core/models/track.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [RouterLink, TuiIcon, TuiButton, TuiDropdown, TuiDropdownOpen, TuiDataList],
  template: `
    @if (playlist(); as p) {
      <div class="flex flex-col gap-8 pb-12">
        <!-- Header -->
        <header class="flex flex-col md:flex-row items-start md:items-end gap-6">
          <div class="w-48 h-48 rounded-2xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
            <span class="text-6xl">🎵</span>
          </div>
          
          <div class="flex flex-col gap-2 flex-1">
            <span class="text-xs font-bold uppercase tracking-widest text-purple-400">Playlist</span>
            <h1 class="text-4xl md:text-6xl font-bold text-var(--tui-text-primary)">{{ p.name }}</h1>
            <div class="flex items-center gap-2 text-sm text-(--tui-text-secondary)">
              <span class="font-bold text-var(--tui-text-primary)">{{ p.createdBy }}</span>
              <span>•</span>
              <span>{{ p.tracks.length }} tracks</span>
            </div>
          </div>

          <div class="flex gap-2">
             <button tuiButton appearance="flat" size="m" shape="rounded" (click)="playAll()" [disabled]="p.tracks.length === 0">
               <tui-icon icon="@tui.play" class="mr-2"></tui-icon> Play All
             </button>
             
             <div class="relative" [tuiDropdown]="menu" [(tuiDropdownOpen)]="menuOpen">
               <button tuiIconButton appearance="flat" size="m" shape="rounded" iconStart="@tui.more-vertical" (click)="menuOpen = !menuOpen"></button>
               <ng-template #menu>
                 <tui-data-list>
                   <button tuiOption (click)="deletePlaylist()">
                     <tui-icon icon="@tui.trash" class="mr-2 text-red-400"></tui-icon> Delete Playlist
                   </button>
                 </tui-data-list>
               </ng-template>
             </div>
          </div>
        </header>

        <!-- Track List -->
        <div class="flex flex-col">
          <div class="grid grid-cols-[48px_1fr_1fr_48px] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-(--tui-text-secondary) border-b border-(--tui-border-normal) mb-2">
            <span>#</span>
            <span>Title</span>
            <span class="hidden md:block">Album</span>
            <span></span>
          </div>

          @for (track of p.tracks; track track.id; let i = $index) {
            <div (click)="playTrack(track)"
                 class="grid grid-cols-[40px_1fr_40px] md:grid-cols-[48px_1fr_1fr_48px] gap-2 md:gap-4 px-2 md:px-4 py-3 rounded-xl hover:bg-(--tui-background-elevation-2) transition-colors group cursor-pointer items-center">
              
              <div class="flex items-center justify-center">
                <span class="text-xs text-(--tui-text-secondary) md:group-hover:hidden">{{ i + 1 }}</span>
                <tui-icon icon="@tui.play" class="hidden md:group-hover:block text-purple-400 text-xs"></tui-icon>
              </div>
              
              <div class="flex items-center gap-3 min-w-0">
                <img [src]="track.album.cover_small" class="w-10 h-10 rounded-md shadow-lg shrink-0" alt="">
                <div class="flex flex-col truncate">
                  <span class="font-bold text-sm md:text-base text-var(--tui-text-primary) truncate">{{ track.title }}</span>
                  <span class="text-xs md:text-sm text-(--tui-text-secondary) truncate">{{ track.artist.name }}</span>
                </div>
              </div>

              <span class="text-sm text-(--tui-text-secondary) truncate hidden md:block">{{ track.album.title }}</span>

              <div class="flex justify-end gap-2">
                <button tuiIconButton appearance="flat" size="s" shape="rounded" 
                        [iconStart]="likedIds().has(track.id) ? '@tui.heart-filled' : '@tui.heart'"
                        class="!text-(--tui-text-secondary) hover:!text-red-500 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all"
                        [class.!text-red-500]="likedIds().has(track.id)"
                        (click)="$event.stopPropagation(); toggleLike(track)"></button>
                <button tuiIconButton appearance="flat" size="s" shape="rounded" iconStart="@tui.x" 
                        class="text-red-400 md:opacity-0 md:group-hover:opacity-100 transition-all"
                        (click)="$event.stopPropagation(); removeTrack(track.id)"></button>
              </div>
            </div>
          }

          @if (p.tracks.length === 0) {
            <div class="flex flex-col items-center justify-center py-20 gap-4">
              <tui-icon icon="@tui.music" class="text-6xl text-gray-800"></tui-icon>
              <p class="text-(--tui-text-secondary)">This playlist is empty. Add some tracks from Search or Explore!</p>
              <a routerLink="/search" tuiButton appearance="outline" size="s" shape="rounded">Go to Search</a>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center py-40">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }
  `,
})
export class PlaylistDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playlistService = inject(PlaylistService);
  private readonly store = inject(AppStore);
  private readonly dialogs = inject(TuiDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly playlist = signal<Playlist | null>(null);
  protected readonly likedIds = this.playlistService.likedTrackIds;
  protected menuOpen = false;

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        this.loadPlaylist(params['id']);
      });
  }

  async loadPlaylist(id: string) {
    const p = await this.playlistService.getPlaylistById(id);
    if (!p) {
      this.router.navigate(['/playlists']);
      return;
    }
    this.playlist.set(p);
  }

  playTrack(track: Track) {
    this.store.setQueue(this.playlist()?.tracks || []);
    this.store.setCurrentTrack(track);
  }

  toggleLike(track: Track) {
    this.playlistService.toggleLike(track);
  }

  playAll() {
    const tracks = this.playlist()?.tracks || [];
    if (tracks.length > 0) {
      this.store.setQueue(tracks);
      this.store.setCurrentTrack(tracks[0]);
    }
  }

  async removeTrack(trackId: number) {
    const p = this.playlist();
    if (!p) return;

    await this.playlistService.removeTrackFromPlaylist(p.id, trackId);
    await this.loadPlaylist(p.id);
  }

  async deletePlaylist() {
    const p = this.playlist();
    if (!p) return;

    this.dialogs.open<boolean>(
      'Are you sure you want to delete this playlist?',
      { label: 'Confirm Deletion', size: 's' }
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (confirm) => {
        if (confirm) {
          await this.playlistService.deletePlaylist(p.id);
          this.router.navigate(['/playlists']);
        }
      });
  }
}
