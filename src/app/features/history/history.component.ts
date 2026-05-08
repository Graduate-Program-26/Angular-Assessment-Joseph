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

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-history',
  imports: [TimeAgoPipe, DurationPipe, TuiLoader, TuiIcon, TuiButton, TuiDropdown, TuiDataList],
  standalone: true,
  template: `
    <div class="flex flex-col gap-8 pb-12">
      <header>
        <h1 class="text-3xl md:text-4xl font-bold text-(--tui-text-primary) mb-2">History</h1>
        <p class="text-[var(--tui-text-secondary)]">Your recently played tracks and albums.</p>
      </header>

      @if (auth.currentUser()) {
        <tui-loader [loading]="isLoading()">
          <div class="flex flex-col gap-2">
            @for (track of items(); track track.playedAt) {
            <div
              class="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--tui-background-elevation-1)] focus-within:bg-[var(--tui-background-elevation-1)]   transition-colors group cursor-pointer border border-transparent focus-within::border-[var(--tui-border-normal)]">
              <div (click)="playtrack(track)" (keyup.enter)="playtrack(track)" tabindex="0"
                class="aspect-square rounded-lg overflow-hidden shadow-2xl focus group-hover:shadow-purple-500/20 group-focus:shadow-purple-500/20 transition-all group-focus:-translate-y-1 group-hover:-translate-y-1 duration-300 relative">
                <img [src]="track.album?.cover_medium" [alt]="track.title" class="w-15 h-15 object-cover">
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div
                    class="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-(--tui-text-primary) shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <tui-icon icon="@tui.play" class="text-3xl"></tui-icon>
                  </div>
                </div>
              </div>
              <div class="flex flex-col flex-1">
                <span class="text-sm font-semibold text-(--tui-text-primary)">{{ track.title }}</span>
                <span class="text-xs text-[var(--tui-text-secondary)]">{{ track.artist?.name || 'Unknown Artist' }} • {{ track.album?.title || 'Unknown Album' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button tuiIconButton shape="rounded" type="button" appearance="flat" size="s" 
                  [iconStart]="likedIds().has(track.id) ? '@tui.heart-filled' : '@tui.heart'"
                  class="!text-[var(--tui-text-secondary)] hover:!text-red-500 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all hidden md:flex"
                  [class.!text-red-500]="likedIds().has(track.id)"
                  (click)="$event.stopPropagation(); toggleLike(track)">
                </button>
                <button tuiIconButton shape="rounded" type="button" appearance="flat" size="s" iconStart="@tui.plus"
                  class="!text-[var(--tui-text-secondary)] hover:!text-purple-400 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all hidden md:flex"
                  (click)="$event.stopPropagation(); openAddToPlaylist(track)">
                </button>
                
                <button tuiIconButton shape="rounded" type="button" appearance="flat" size="s" iconStart="@tui.ellipsis"
                  class="!text-[var(--tui-text-secondary)] md:hidden"
                  [tuiDropdown]="historyMenu" (click)="$event.stopPropagation()">
                </button>
                <ng-template #historyMenu>
                  <tui-data-list>
                    <button tuiOption (click)="toggleLike(track)">Like track</button>
                    <button tuiOption (click)="openAddToPlaylist(track)">Add to playlist</button>
                  </tui-data-list>
                </ng-template>

                <div class="flex flex-col items-end gap-1 shrink-0 min-w-[60px]">
                  <span class="text-[10px] md:text-xs text-[var(--tui-text-secondary)]">{{
                    track.playedAt | timeAgo:tick()
                    }}</span>
                  <span
                    class="text-[10px] md:text-xs text-[var(--tui-text-tertiary)] group-hover:text-(--tui-text-primary) transition-colors">{{
                    track.duration | duration }}</span>
                </div>
              </div>
            </div>
            }
          </div>
        </tui-loader>
      } @else {
        <div class="flex flex-col items-center justify-center py-40 gap-6 text-center animate-in fade-in zoom-in duration-500">
          <div class="w-24 h-24 rounded-full bg-linear-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-4">
            <tui-icon icon="@tui.history" class="text-4xl text-purple-400"></tui-icon>
          </div>
          <div class="flex flex-col gap-2 max-w-md">
            <h1 class="text-3xl font-black text-var(--tui-text-primary) tracking-tight">Your Listening History</h1>
            <p class="text-(--tui-text-secondary)">Sign in to keep track of what you listen to and easily find your favorite songs again.</p>
          </div>
          <button tuiButton appearance="accent" size="l" shape="rounded" (click)="auth.login()" class="mt-4">
             Sign in with Deezer
          </button>
        </div>
      }
    </div>
  `,
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
  protected readonly auth = inject(AuthService);
  
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
