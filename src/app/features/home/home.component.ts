import { Component, inject, signal, OnInit, DestroyRef, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { DeezerService } from '../../core/services/deezer.service';
import { AppStore } from '../../core/store/app.store';
import { HistoryItem } from '../../core/services/indexed-db.service';
import { Album, Artist, Track } from '../../core/models/track.model';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AddToPlaylistDialogComponent } from '../playlists/add-to-playlist-dialog/add-to-playlist-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackCardComponent } from '../../shared/components/track-card/track-card.component';
import { AlbumCardComponent } from '../../shared/components/album-card/album-card.component';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TrackCardComponent, AlbumCardComponent, ArtistCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly historyService = inject(HistoryService);
  private readonly playlistService = inject(PlaylistService);
  private readonly deezer = inject(DeezerService);
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recentlyPlayed = signal<HistoryItem[]>([]);
  readonly trendingTracks = signal<Track[]>([]);
  readonly trendingAlbums = signal<Album[]>([]);
  readonly trendingArtists = signal<Artist[]>([]);
  
  protected readonly likedIds = this.playlistService.likedTrackIds;

  constructor() {
    effect(() => {
      this.historyService.version();
      this.loadRecentlyPlayed();
    });
  }

  ngOnInit() {
    this.loadRecentlyPlayed();
    this.loadTrending();
  }

  async loadRecentlyPlayed() {
    const history = await this.historyService.getHistory();
    this.recentlyPlayed.set(history.slice(0, 8));
  }

  loadTrending() {
    this.deezer.getChart().subscribe(res => {
      this.trendingTracks.set(res.tracks.data.slice(0, 10));
      this.trendingAlbums.set(res.albums.data.slice(0, 10));
      this.trendingArtists.set(res.artists.data.slice(0, 10));
    });
  }

  viewArtist(id: number) {
    this.router.navigate(['/artists', id]);
  }

  viewAlbum(id: number) {
    this.router.navigate(['/albums', id]);
  }

  playTrack(track: Track) {
    this.store.playTrackNow(track);
  }

  toggleLike(track: Track) {
    this.playlistService.toggleLike(track);
  }

  openAddToPlaylist(track: Track) {
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
}
