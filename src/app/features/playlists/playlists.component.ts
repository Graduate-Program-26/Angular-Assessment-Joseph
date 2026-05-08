import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/services/indexed-db.service';
import { TuiButton, TuiDialogService, TuiLabel, TuiTextfield, TuiIcon } from '@taiga-ui/core';
import { TuiResponsiveDialogService, type TuiResponsiveDialogOptions } from '@taiga-ui/addon-mobile';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { CreatePlaylistDialogComponent } from './create-playlist-dialog/create-playlist-dialog.component';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    TuiButton,
    ReactiveFormsModule,
    TuiTextfield, 
    TuiIcon,
  ],
  template: `
    <div class="flex flex-col gap-8 pb-12">
      @if (auth.currentUser()) {
        <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="flex flex-col gap-2">
            <h1 class="text-3xl md:text-4xl font-bold text-var(--tui-text-primary)">Your Playlists</h1>
            <p class="text-(--tui-text-secondary)">Manage and explore your personal collection.</p>
          </div>
          <button tuiButton type="button" appearance="accent" size="m" shape="rounded" (click)="createNew()"
            class="hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
            <tui-icon icon="@tui.plus" class="mr-2"></tui-icon>
            Create new playlist
          </button>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (playlist of playlists(); track playlist.id) {
          <div [routerLink]="['/playlists', playlist.id]"
            class="relative flex flex-col gap-4 p-4 rounded-2xl bg-(--tui-background-elevation-1) border border-(--tui-border-normal) hover:bg-(--tui-background-elevation-2) transition-all group cursor-pointer">
            
            @if (playlist.name !== 'Liked Music') {
              <button tuiIconButton type="button" appearance="flat" size="s" iconStart="@tui.trash"
                class="absolute top-6 right-6 z-10 !text-white/30 hover:!text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-full bg-black/20 backdrop-blur-sm"
                (click)="$event.stopPropagation(); deletePlaylist(playlist)">
              </button>
            }

            <div
              class="aspect-square w-full rounded-xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-[1.02] transition-transform">
              <tui-icon icon="@tui.music" class="text-6xl text-white/50"></tui-icon>
            </div>
            <div class="flex flex-col">
              <h3 class="font-bold text-var(--tui-text-primary) group-hover:text-purple-400 transition-colors truncate">
                {{ playlist.name }}
              </h3>
              <span class="text-sm text-(--tui-text-secondary)">{{ playlist.tracks.length }} songs</span>
            </div>
          </div>
          }

          <!-- Empty State / Add New -->
          <div (click)="createNew()"
            class="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-(--tui-border-normal) hover:border-purple-500 hover:bg-purple-500/5 transition-all group cursor-pointer">
            <tui-icon icon="@tui.plus" class="text-4xl mb-2 group-hover:scale-110 transition-transform"></tui-icon>
            <span class="text-sm font-medium text-(--tui-text-secondary) group-hover:text-purple-400">New playlist</span>
          </div>
        </div>

        @if (playlists().length === 0) {
        <div class="text-center py-20">
          <p class="text-(--tui-text-secondary)">You haven't created any playlists yet.</p>
        </div>
        }
      } @else {
        <div class="flex flex-col items-center justify-center py-40 gap-6 text-center animate-in fade-in zoom-in duration-500">
          <div class="w-24 h-24 rounded-full bg-linear-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-4">
            <tui-icon icon="@tui.lock" class="text-4xl text-purple-400"></tui-icon>
          </div>
          <div class="flex flex-col gap-2 max-w-md">
            <h1 class="text-3xl font-black text-var(--tui-text-primary) tracking-tight">Your Music, Anywhere</h1>
            <p class="text-(--tui-text-secondary)">Sign in to create, manage and sync your playlists across all your devices.</p>
          </div>
          <button tuiButton appearance="accent" size="l" shape="rounded" (click)="auth.login()" class="mt-4">
             Sign in
          </button>
        </div>
      }
    </div>
  `,
})
export class PlaylistsComponent implements OnInit {
  private readonly playlistService = inject(PlaylistService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly responsiveDialogs = inject(TuiResponsiveDialogService);
  private readonly dialogs = inject(TuiDialogService);
  protected readonly auth = inject(AuthService);

  readonly playlists = signal<Playlist[]>([]);
  
  protected readonly options: Partial<TuiResponsiveDialogOptions> = {
    label: 'Create Playlist',
    size: 's',
  };

  constructor() {
    effect(() => {
      this.playlistService.version();
      this.loadPlaylists();
    });
  }

  ngOnInit() {
    this.loadPlaylists();
  }

  async loadPlaylists() {
    const p = await this.playlistService.getPlaylists();
    this.playlists.set(p);
  }

  createNew() {
    this.responsiveDialogs
      .open<string>(new PolymorpheusComponent(CreatePlaylistDialogComponent), this.options)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async name => {
        if (name) {
          await this.playlistService.createPlaylist(name);
        }
      });
  }

  deletePlaylist(playlist: Playlist) {
    this.dialogs.open<boolean>(
      `Are you sure you want to delete "${playlist.name}"?`,
      { label: 'Confirm Deletion', size: 's' }
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (confirm) => {
        if (confirm) {
          await this.playlistService.deletePlaylist(playlist.id);
          this.loadPlaylists();
        }
      });
  }
}
