import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DeezerService } from '../../../core/services/deezer.service';
import { Artist, Track, Album } from '../../../core/models/track.model';
import { TuiIcon, TuiButton, TuiLoader } from '@taiga-ui/core';
import { AppStore } from '../../../core/store/app.store';
import { TrackCardComponent } from '../../../shared/components/track-card/track-card.component';
import { AlbumCardComponent } from '../../../shared/components/album-card/album-card.component';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, TuiIcon, TuiButton, TuiLoader, TrackCardComponent, AlbumCardComponent],
  template: `
    @if (artist(); as a) {
      <div class="flex flex-col gap-10 pb-12 animate-in fade-in duration-700">
        <!-- Hero Header -->
        <header class="relative h-80 md:h-96 -mt-8 -mx-8 mb-8 overflow-hidden">
          <img [src]="a.picture_xl || a.picture_medium" class="w-full h-full object-cover blur-sm brightness-50" alt="">
          <div class="absolute inset-0 flex flex-col justify-end p-8 md:p-12 gap-4">
            <div class="flex items-center gap-2 text-white">
              <tui-icon icon="@tui.check-circle" class="text-blue-400"></tui-icon>
              <span class="text-sm font-bold uppercase tracking-widest">Verified Artist</span>
            </div>
            <h1 class="text-5xl md:text-8xl font-black text-white tracking-tighter">{{ a.name }}</h1>
            <span class="text-white/80 font-bold">{{ a.nb_fan | number }} monthly listeners</span>
          </div>
        </header>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <button tuiButton appearance="accent" size="l" shape="rounded" (click)="playTopTracks()">
            <tui-icon icon="@tui.play" class="mr-2"></tui-icon> Play Top Tracks
          </button>
        </div>

        <!-- Content Sections -->
        <div class="flex flex-col gap-16">
          <!-- Popular Tracks -->
          <div class="flex flex-col gap-6">
            <h2 class="text-3xl font-black text-var(--tui-text-primary) tracking-tight">Popular</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (track of topTracks(); track track.id; let i = $index) {
                <app-track-card [track]="track" [index]="i + 1" [showIndex]="true"></app-track-card>
              }
            </div>
          </div>

          <!-- Albums -->
          <div class="flex flex-col gap-6">
             <h2 class="text-3xl font-black text-var(--tui-text-primary) tracking-tight">Albums</h2>
             <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                @for (album of albums(); track album.id) {
                  <app-album-card [album]="album"></app-album-card>
                }
             </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center py-40">
        <tui-loader [loading]="true" size="xl"></tui-loader>
      </div>
    }
  `,
})
export class ArtistDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly deezer = inject(DeezerService);
  private readonly store = inject(AppStore);

  readonly artist = signal<Artist | null>(null);
  readonly topTracks = signal<Track[]>([]);
  readonly albums = signal<Album[]>([]);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadArtist(Number(id));
      }
    });
  }

  async loadArtist(id: number) {
    this.deezer.getArtist(id).subscribe(artist => {
      this.artist.set(artist);
    });

    this.deezer.getArtistTopTracks(id).subscribe(res => {
      const artist = this.artist();
      if (artist) {
        const tracksWithArtist = res.data.map(track => ({
          ...track,
          artist: track.artist || artist
        }));
        this.topTracks.set(tracksWithArtist as Track[]);
      } else {
        this.topTracks.set(res.data);
      }
    });

    this.deezer.getArtistAlbums(id).subscribe(res => {
      const artist = this.artist();
      if (artist) {
        const albumsWithArtist = res.data.map(album => ({
          ...album,
          artist: artist
        }));
        this.albums.set(albumsWithArtist as Album[]);
      } else {
        this.albums.set(res.data);
      }
    });
  }

  playTopTracks() {
    const tracks = this.topTracks();
    if (tracks.length > 0) {
      this.store.setQueue(tracks);
      this.store.setCurrentTrack(tracks[0]);
    }
  }
}
