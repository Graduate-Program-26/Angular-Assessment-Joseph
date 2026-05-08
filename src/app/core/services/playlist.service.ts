import { Injectable, inject, signal, Injector, effect } from '@angular/core';
import { Track } from '../models/track.model';
import { AppDatabase, Playlist } from './indexed-db.service';
import { DateTime } from 'luxon';
import { AuthService } from './auth.service';
import { DeezerService } from './deezer.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private readonly db = inject(AppDatabase);
  private readonly deezer = inject(DeezerService);
  private readonly injector = inject(Injector);
  private readonly _version = signal(1);
  readonly version = this._version.asReadonly();
  
  readonly likedTrackIds = signal<Set<number>>(new Set());

  constructor() {
    effect(() => {
      this.auth.currentUser();
      this._version.update(v => v + 1);
      this.refreshLikedTrackIds();
    });
  }

  private async refreshLikedTrackIds() {
    const playlists = await this.getPlaylists();
    const likedPlaylist = playlists.find(p => p.name === 'Liked Music');
    const ids = new Set(likedPlaylist?.tracks.map(t => t.id) || []);
    this.likedTrackIds.set(ids);
  }

  private get auth(): AuthService {
    return this.injector.get(AuthService);
  }


  private async triggerSync(): Promise<void> {
    if (this.auth.currentUser()) {
      await this.syncWithCloud();
    }
  }

  async createPlaylist(name: string, tracks: Track[] = []): Promise<string> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('User not logged in');

    const id = crypto.randomUUID();
    const playlist: Playlist = {
      id,
      name,
      tracks,
      createdAt: DateTime.now().toISO(),
      createdBy: user.name || 'User',
      userId: user.user_id,
    };

    await this.db.playlists.add(playlist);
    this._version.update(v => v + 1);
    await this.triggerSync();
    return id;
  }

  async getPlaylists(): Promise<Playlist[]> {
    const user = this.auth.currentUser();
    if (!user) return [];

    const uid = user.user_id;
    const playlists = await this.db.playlists
      .where('userId')
      .equals(uid)
      .toArray();

    // Check if "Liked Music" exists, if not create it
    const hasLiked = playlists.some(p => p.name === 'Liked Music');
    if (!hasLiked) {
      await this.createPlaylist('Liked Music');
      // Re-fetch to get the newly created playlist
      return this.db.playlists
        .where('userId')
        .equals(uid)
        .toArray();
    }

    return playlists;
  }

  async getPlaylistById(id: string): Promise<Playlist | undefined> {
    return this.db.playlists.get(id);
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    
    await this.db.playlists.put({ ...playlist, userId: user.user_id });
    this._version.update(v => v + 1);
    await this.refreshLikedTrackIds();
    await this.triggerSync();
  }

  async deletePlaylist(id: string): Promise<void> {
    await this.db.playlists.delete(id);
    this._version.update(v => v + 1);
    await this.triggerSync();
  }

  async addTrackToPlaylist(playlistId: string, track: Track): Promise<void> {
    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) throw new Error('Playlist not found');

    const isAlreadyIn = playlist.tracks.some(t => t.id === track.id);
    if (!isAlreadyIn) {
      playlist.tracks.push(track);
      await this.updatePlaylist(playlist);
    }
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: number): Promise<void> {
    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) throw new Error('Playlist not found');

    playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
    await this.updatePlaylist(playlist);
  }

  async renamePlaylist(id: string, newName: string): Promise<void> {
    await this.db.playlists.update(id, { name: newName });
    this._version.update(v => v + 1);
    await this.triggerSync();
  }

  async toggleLike(track: Track): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const playlists = await this.getPlaylists();
    const likedPlaylist = playlists.find(p => p.name === 'Liked Music');

    if (!likedPlaylist) {
      await this.createPlaylist('Liked Music', [track]);
      return;
    }

    const isAlreadyLiked = likedPlaylist.tracks.some(t => t.id === track.id);
    if (isAlreadyLiked) {
      await this.removeTrackFromPlaylist(likedPlaylist.id, track.id);
    } else {
      await this.addTrackToPlaylist(likedPlaylist.id, track);
    }
  }

  async isLiked(trackId: number): Promise<boolean> {
    const playlists = await this.getPlaylists();
    const likedPlaylist = playlists.find(p => p.name === 'Liked Music');
    return !!likedPlaylist?.tracks.some(t => t.id === trackId);
  }

  async syncWithCloud(): Promise<void> {
    if (!this.auth.currentUser()) return;

    const localPlaylists = await this.getPlaylists();
    
    // 1. Upload local
    await firstValueFrom(this.deezer.uploadPlaylists(localPlaylists));

    // 2. Download latest from cloud
    const cloudData = await firstValueFrom(this.deezer.downloadPlaylists());
    
    if (cloudData.playlists?.length > 0) {
      const user = this.auth.currentUser();
      // Simple merge: put all cloud playlists into local DB, tagged with current userId
      const itemsWithUser = cloudData.playlists.map((p: Playlist) => ({ ...p, userId: user!.user_id }));
      await this.db.playlists.bulkPut(itemsWithUser);
      this._version.update(v => v + 1);
    }
  }
}
