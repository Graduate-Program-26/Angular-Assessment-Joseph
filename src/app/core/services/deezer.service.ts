import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Album, Artist, Track } from '../models/track.model';
import { Observable } from 'rxjs';
import { HistoryItem, Playlist } from './indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class DeezerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  searchTracks(query: string, index = 0): Observable<{ data: Track[], next?: string, total: number }> {
    return this.http.get<{ data: Track[], next?: string, total: number }>(`${this.apiUrl}/search/tracks`, {
      params: { q: query, index: index.toString() },
    });
  }

  searchArtists(query: string, index = 0): Observable<{ data: Artist[], next?: string, total: number }> {
    return this.http.get<{ data: Artist[], next?: string, total: number }>(`${this.apiUrl}/search/artists`, {
      params: { q: query, index: index.toString() },
    });
  }

  searchAlbums(query: string, index = 0): Observable<{ data: Album[], next?: string, total: number }> {
    return this.http.get<{ data: Album[], next?: string, total: number }>(`${this.apiUrl}/search/albums`, {
      params: { q: query, index: index.toString() },
    });
  }

  getAlbumTracks(albumId: number): Observable<{ data: Track[] }> {
    return this.http.get<{ data: Track[] }>(`${this.apiUrl}/album/${albumId}/tracks`);
  }

  getTrack(trackId: number): Observable<Track> {
    return this.http.get<Track>(`${this.apiUrl}/track/${trackId}`);
  }

  // Cloud Sync
  uploadHistory(history: HistoryItem[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sync/history`, { history }, {
      withCredentials: true
    });
  }

  downloadHistory(): Observable<{ items: HistoryItem[] }> {
    return this.http.get<{ items: HistoryItem[] }>(`${this.apiUrl}/sync/history`, {
      withCredentials: true
    });
  }

  uploadPlaylists(playlists: Playlist[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sync/playlists`, { playlists }, {
      withCredentials: true
    });
  }

  downloadPlaylists(): Observable<{ playlists: Playlist[] }> {
    return this.http.get<{ playlists: Playlist[] }>(`${this.apiUrl}/sync/playlists`, {
      withCredentials: true
    });
  }
}
