import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Artist } from '../../../core/models/track.model';
import { TuiIcon, TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule, TuiButton],
  template: `
    <div (click)="viewDetail()" class="flex flex-col items-center gap-4 group cursor-pointer w-full text-center focus-visible:outline-none" tabindex="0">
      <div class="w-full aspect-square rounded-full overflow-hidden shadow-xl ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all duration-300 relative">
        <img [src]="artist.picture_medium" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" [alt]="artist.name">
        <div class="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div class="flex flex-col gap-1 w-full">
        <span class="font-bold text-base text-var(--tui-text-primary) truncate w-full group-hover:text-purple-400 transition-colors">{{ artist.name }}</span>
        <span class="text-[10px] font-black uppercase tracking-widest text-(--tui-text-secondary)">Artist</span>
      </div>
      <button tuiButton appearance="flat" size="s" shape="rounded" class="opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
        View Profile
      </button>
    </div>
  `,
})
export class ArtistCardComponent {
  @Input({ required: true }) artist!: Artist;
  
  private readonly router = inject(Router);

  viewDetail() {
    this.router.navigate(['/artists', this.artist.id]);
  }
}
