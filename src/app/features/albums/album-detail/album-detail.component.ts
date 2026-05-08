import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DeezerService } from '../../../core/services/deezer.service';
import { Album, Track } from '../../../core/models/track.model';
import { TuiIcon, TuiButton, TuiLoader } from '@taiga-ui/core';
import { AppStore } from '../../../core/store/app.store';
import { TrackCardComponent } from '../../../shared/components/track-card/track-card.component';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TuiIcon, TuiButton, TuiLoader, TrackCardComponent],
  template: `
    @if (album(); as a) {
      <div class="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
        <!-- Header -->
        <header class="flex flex-col md:flex-row items-start md:items-end gap-8 bg-linear-to-b from-purple-900/20 to-transparent -mt-8 -mx-8 p-8 md:p-12">
          <div class="w-56 h-56 rounded-2xl overflow-hidden shadow-2xl shrink-0 group">
            <img [src]="a.cover_xl" [alt]="a.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          </div>
          
          <div class="flex flex-col gap-3 flex-1 min-w-0">
            <span class="text-xs font-bold uppercase tracking-widest text-purple-400">Album</span>
            <h1 class="text-4xl md:text-7xl font-black text-var(--tui-text-primary) tracking-tighter truncate">{{ a.title }}</h1>
            <div class="flex items-center gap-3 text-sm font-medium text-(--tui-text-secondary)">
              <div class="flex items-center gap-2">
                @if (a.artist?.picture_small) {
                  <img [src]="a.artist?.picture_small" class="w-6 h-6 rounded-full" alt="">
                }
                <a [routerLink]="['/artists', a.artist?.id]" class="font-bold text-var(--tui-text-primary) hover:underline">{{ a.artist?.name || 'Various Artists' }}</a>
              </div>
              <span>•</span>
              <span>{{ a.release_date | date:'yyyy' }}</span>
              <span>•</span>
              <span>{{ a.nb_tracks }} tracks</span>
            </div>
          </div>

          <div class="flex gap-3">
             <button tuiButton appearance="accent" size="l" shape="rounded" (click)="playAll()">
               <tui-icon icon="@tui.play" class="mr-2"></tui-icon> Play
             </button>
          </div>
        </header>

        <!-- Track List -->
        <div class="flex flex-col gap-1">
          <div class="grid grid-cols-[48px_1fr_48px] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-(--tui-text-secondary) border-b border-(--tui-border-normal) mb-4">
            <span class="text-center">#</span>
            <span>Title</span>
            <span></span>
          </div>

          @for (track of tracks(); track track.id; let i = $index) {
            <app-track-card [track]="track" [index]="i + 1" [showIndex]="true" [hideImage]="true" [hideArtist]="true"></app-track-card>
          }
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center py-40">
        <tui-loader [loading]="true" size="xl"></tui-loader>
      </div>
    }
  `,
})
export class AlbumDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly deezer = inject(DeezerService);
  private readonly store = inject(AppStore);

  readonly album = signal<Album | null>(null);
  readonly tracks = signal<Track[]>([]);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadAlbum(Number(id));
      }
    });
  }

  async loadAlbum(id: number) {
    this.deezer.getAlbum(id).subscribe(album => {
      this.album.set(album);
      this.deezer.getAlbumTracks(id).subscribe(res => {
        // Ensure the tracks have the album info for the cards
        const tracksWithAlbum = res.data.map(t => ({ ...t, album }));
        this.tracks.set(tracksWithAlbum);
      });
    });
  }

  playAll() {
    const tracks = this.tracks();
    if (tracks.length > 0) {
      this.store.setQueue(tracks);
      this.store.setCurrentTrack(tracks[0]);
    }
  }
}
