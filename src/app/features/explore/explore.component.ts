import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DeezerService } from '../../core/services/deezer.service';
import { Track, Album, Artist } from '../../core/models/track.model';
import { AppStore } from '../../core/store/app.store';
import { PlaylistService } from '../../core/services/playlist.service';
import { TuiLoader } from '@taiga-ui/core';
import { TrackCardComponent } from '../../shared/components/track-card/track-card.component';
import { AlbumCardComponent } from '../../shared/components/album-card/album-card.component';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, TuiLoader, TrackCardComponent, AlbumCardComponent, ArtistCardComponent],
  templateUrl: './explore.component.html',
})
export class ExploreComponent implements OnInit {
  private readonly deezer = inject(DeezerService);
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly playlistService = inject(PlaylistService);

  readonly trendingTracks = signal<Track[]>([]);
  readonly topAlbums = signal<Album[]>([]);
  readonly topArtists = signal<Artist[]>([]);
  readonly isLoading = signal(true);
  
  protected readonly likedIds = this.playlistService.likedTrackIds;

  ngOnInit() {
    this.loadCharts();
  }

  loadCharts() {
    this.isLoading.set(true);
    this.deezer.getChart().subscribe({
      next: (res) => {
        this.trendingTracks.set(res.tracks.data);
        this.topAlbums.set(res.albums.data);
        this.topArtists.set(res.artists.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  playTrack(track: Track) {
    this.store.playTrackNow(track);
  }

  viewArtist(id: number) {
    this.router.navigate(['/artists', id]);
  }

  viewAlbum(id: number) {
    this.router.navigate(['/albums', id]);
  }

  toggleLike(track: Track) {
    this.playlistService.toggleLike(track);
  }
}
