import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { Playlist } from '../../../core/services/indexed-db.service';
import { TuiIcon, TuiButton, TuiDropdown, TuiDropdownOpen, TuiDataList, TuiDialogService } from '@taiga-ui/core';
import { AppStore } from '../../../core/store/app.store';
import { Track } from '../../../core/models/track.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackCardComponent } from '../../../shared/components/track-card/track-card.component';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [RouterLink, TuiIcon, TuiButton, TuiDropdown, TuiDropdownOpen, TuiDataList, TrackCardComponent],
  template: `
    @if (playlist(); as p) {
      <div class="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
        <!-- Header -->
        <header class="flex flex-col md:flex-row items-start md:items-end gap-8 bg-linear-to-b from-purple-900/20 to-transparent -mt-8 -mx-8 p-8 md:p-12">
          <div class="w-56 h-56 rounded-2xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shrink-0 group">
            <span class="text-7xl group-hover:scale-110 transition-transform duration-500">🎵</span>
          </div>
          
          <div class="flex flex-col gap-3 flex-1 min-w-0">
            <span class="text-xs font-bold uppercase tracking-widest text-purple-400">Playlist</span>
            <h1 class="text-4xl md:text-7xl font-black text-var(--tui-text-primary) tracking-tighter truncate">{{ p.name }}</h1>
            <div class="flex items-center gap-3 text-sm font-medium text-(--tui-text-secondary)">
              <span class="font-bold text-var(--tui-text-primary)">{{ p.createdBy }}</span>
              <span>•</span>
              <span>{{ p.tracks.length }} tracks</span>
            </div>
          </div>

          <div class="flex gap-3">
             <button tuiButton appearance="accent" size="l" shape="rounded" (click)="playAll()" [disabled]="p.tracks.length === 0">
               <tui-icon icon="@tui.play" class="mr-2"></tui-icon> Play All
             </button>
             
             <div class="relative" [tuiDropdown]="menu" [(tuiDropdownOpen)]="menuOpen">
               <button tuiIconButton appearance="flat" size="l" shape="rounded" iconStart="@tui.more-vertical" (click)="menuOpen = !menuOpen"></button>
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
        <div class="flex flex-col gap-1">
          <div class="grid grid-cols-[48px_1fr_48px] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-(--tui-text-secondary) border-b border-(--tui-border-normal) mb-4">
            <span class="text-center">#</span>
            <span>Title</span>
            <span></span>
          </div>

          @for (track of p.tracks; track track.id; let i = $index) {
            <app-track-card 
              [track]="track" 
              [index]="i + 1" 
              [showIndex]="true" 
              [showRemove]="true"
              (remove)="removeTrack($event.id)"></app-track-card>
          }

          @if (p.tracks.length === 0) {
            <div class="flex flex-col items-center justify-center py-20 gap-4 animate-in zoom-in duration-500">
              <div class="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <tui-icon icon="@tui.music" class="text-5xl text-purple-500 opacity-50"></tui-icon>
              </div>
              <h2 class="text-xl font-bold text-(--tui-text-primary)">Your playlist is empty</h2>
              <p class="text-(--tui-text-secondary) max-w-sm text-center">Add some tracks from Search or Explore to get started!</p>
              <a routerLink="/search" tuiButton appearance="outline" size="s" shape="rounded" class="mt-4">Find music</a>
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
