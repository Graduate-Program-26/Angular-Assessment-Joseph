import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { PlaylistService } from '../../services/playlist.service';
import { Playlist } from '../../services/indexed-db.service';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TuiIcon],
  template: `
    <nav aria-label="Main navigation">
      <ul class="flex flex-col gap-0.5 px-3">
        @for (item of navItems; track item.route) {
        <li>
          <a [routerLink]="item.route"
            routerLinkActive="bg-[var(--tui-background-elevation-2)] text-var(--tui-text-primary)"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--tui-text-secondary)] hover:text-var(--tui-text-primary) hover:bg-[var(--tui-background-elevation-1)] transition-all duration-150 font-medium text-sm group">
            <tui-icon [icon]="item.icon"
              class="text-lg shrink-0 group-hover:scale-110 transition-transform duration-150"></tui-icon>
            {{ item.label }}
          </a>
        </li>
        }
      </ul>
    </nav>

    <div class="mt-auto px-3 pt-4 border-t border-[var(--tui-border-normal)]">
      <p class="text-xs text-[var(--tui-text-tertiary)] px-3 mb-2 font-semibold uppercase tracking-wider">My Playlists</p>
      <div class="flex flex-col gap-0.5">
        @if (auth.currentUser()) {
          @for (playlist of playlists(); track playlist.id) {
          <a [routerLink]="['/playlists', playlist.id]"
            routerLinkActive="bg-[var(--tui-background-elevation-2)] text-var(--tui-text-primary)"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--tui-text-secondary)] hover:text-var(--tui-text-primary) hover:bg-[var(--tui-background-elevation-1)] transition-all duration-150 font-medium text-xs group">
            <tui-icon [icon]="playlist.name === 'Liked Music' ? '@tui.heart-filled' : '@tui.list-music'"
              [class.text-pink-500]="playlist.name === 'Liked Music'"
              class="text-sm shrink-0 group-hover:scale-110 transition-transform duration-150"></tui-icon>
            <span class="truncate">{{ playlist.name }}</span>
          </a>
          } @empty {
          <div class="px-3 py-2 text-xs text-[var(--tui-text-tertiary)] italic">No playlists yet</div>
          }
        } @else {
          <div class="px-3 py-4 flex flex-col gap-3">
            <p class="text-[10px] text-[var(--tui-text-secondary)] leading-tight">Log in to sync your playlists across devices.</p>
            <button (click)="auth.login()" class="text-[10px] font-bold text-purple-400 hover:underline text-left uppercase tracking-widest">Login Now</button>
          </div>
        }
      </div>
    </div>
  `,
  host: {
    class: 'hidden md:flex flex-col w-56 bg-[var(--tui-background-base)] border-r border-[var(--tui-border-normal)] py-4 gap-1 overflow-y-auto shrink-0',
  },
})
export class SidebarComponent {
  private readonly playlistService = inject(PlaylistService);
  protected readonly auth = inject(AuthService);
  
  readonly playlists = signal<Playlist[]>([]);

  readonly navItems: NavItem[] = [
    { label: 'Home', icon: '@tui.home', route: '/', exact: true },
    { label: 'Explore', icon: '@tui.compass', route: '/explore', exact: false },
    { label: 'Search', icon: '@tui.search', route: '/search', exact: false },
    { label: 'History', icon: '@tui.history', route: '/history', exact: false },
    { label: 'Playlists', icon: '@tui.list-music', route: '/playlists', exact: false },
  ];

  constructor() {
    effect(() => {
      this.playlistService.version();
      this.loadPlaylists();
    });
  }

  private async loadPlaylists() {
    const p = await this.playlistService.getPlaylists();
    this.playlists.set(p);
  }
}
