import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Album } from '../../../core/models/track.model';
import { TuiIcon, TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-album-card',
  standalone: true,
  imports: [CommonModule, TuiIcon, TuiButton],
  template: `
    <div (click)="viewDetail()" class="flex flex-col gap-3 group cursor-pointer w-full focus-visible:outline-none" tabindex="0">
      <div class="aspect-square w-full rounded-2xl overflow-hidden shadow-lg relative bg-(--tui-background-neutral-1)">
        <img [src]="album.cover_medium" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" [alt]="album.title">
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div class="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <tui-icon icon="@tui.play" class="text-3xl"></tui-icon>
           </div>
        </div>
      </div>
      <div class="flex flex-col px-1">
        <span class="font-bold text-base text-var(--tui-text-primary) truncate group-hover:text-purple-400 transition-colors">{{ album.title }}</span>
        <span class="text-xs text-(--tui-text-secondary) truncate">{{ album.artist?.name || 'Various Artists' }}</span>
      </div>
      <button tuiButton appearance="outline" size="s" shape="rounded" class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
        View Album
      </button>
    </div>
  `,
})
export class AlbumCardComponent {
  @Input({ required: true }) album!: Album;
  
  private readonly router = inject(Router);

  viewDetail() {
    this.router.navigate(['/albums', this.album.id]);
  }
}
