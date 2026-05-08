import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../../../core/services/playlist.service';
import { Playlist } from '../../../core/services/indexed-db.service';
import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { Track } from '../../../core/models/track.model';

@Component({
  selector: 'app-add-to-playlist-dialog',
  standalone: true,
  imports: [CommonModule, TuiButton, TuiIcon],
  template: `
    <div class="flex flex-col h-full">
      <header class="mb-6">
        <p class="text-sm text-[var(--tui-text-secondary)]">
          Select a playlist to add <span class="text-[var(--tui-primary)] font-bold">"{{ track.title }}"</span> to:
        </p>
      </header>
      
      <div class="flex-1 flex flex-col gap-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        @for (playlist of playlists(); track playlist.id) {
        <button (click)="addTo(playlist)"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--tui-background-elevation-2)] transition-all text-left group border border-transparent hover:border-[var(--tui-border-normal)]">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
            🎵
          </div>
          <div class="flex flex-col flex-1 truncate">
            <span class="font-bold text-[var(--tui-text-primary)] truncate group-hover:text-[var(--tui-primary)] transition-colors">{{ playlist.name }}</span>
            <span class="text-xs text-[var(--tui-text-secondary)]">{{ playlist.tracks.length }} tracks</span>
          </div>
          <tui-icon icon="@tui.plus" class="transition-opacity text-[var(--tui-primary)]"></tui-icon>
        </button>
        } @empty {
        <div class="text-center py-10 bg-[var(--tui-background-elevation-1)] rounded-2xl border border-dashed border-[var(--tui-border-normal)]">
           <p class="text-sm text-[var(--tui-text-secondary)] mb-4">No playlists found.</p>
           <button tuiButton size="m" appearance="secondary" (click)="createNew()">Create your first playlist</button>
        </div>
        }
      </div>

      <footer class="mt-6 pt-6 border-t border-[var(--tui-border-normal)] flex justify-end">
        <button
          tuiButton
          type="button"
          appearance="secondary"
          size="m"
          (click)="context.completeWith()"
        >
          Cancel
        </button>
      </footer>
    </div>
  `,
})
export class AddToPlaylistDialogComponent implements OnInit {
  private readonly playlistService = inject(PlaylistService);
  protected readonly context = inject<TuiDialogContext<void, Track>>(POLYMORPHEUS_CONTEXT);

  readonly playlists = signal<Playlist[]>([]);
  readonly track = this.context.data;

  async ngOnInit() {
    this.playlists.set(await this.playlistService.getPlaylists());
  }

  async addTo(playlist: Playlist) {
    await this.playlistService.addTrackToPlaylist(playlist.id, this.track);
    this.context.completeWith();
  }

  async createNew() {
    const name = prompt('Enter playlist name:');
    if (name) {
      const id = await this.playlistService.createPlaylist(name, [this.track]);
      this.context.completeWith();
    }
  }
}
