import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Album, Artist, Track } from '../models/track.model';
import { Observable } from 'rxjs';

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
}
