import { Injectable, inject, signal, Injector } from '@angular/core';
import { Track } from '../models/track.model';
import { DateTime } from 'luxon';
import { AppDatabase, HistoryItem } from './indexed-db.service';
import { AuthService } from './auth.service';
import { DeezerService } from './deezer.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly db = inject(AppDatabase);
  private readonly deezer = inject(DeezerService);
  private readonly injector = inject(Injector);
  private readonly _version = signal(1);
  readonly version = this._version.asReadonly();

  private get auth(): AuthService {
    return this.injector.get(AuthService);
  }


  async addToHistory(track: Track): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const historyItem: HistoryItem = {
      ...track,
      playedAt: DateTime.now().toISO(),
      userId: user.user_id,
    };

    await this.db.history.put(historyItem);
    
    // Keep only last 30 for this user
    const maxHistory = 30;
    const userHistory = this.db.history.where('userId').equals(user.user_id);
    const count = await userHistory.count();
    if (count > maxHistory) {
      const oldestItems = await userHistory
        .sortBy('playedAt');
      
      const idsToDelete = oldestItems
        .slice(0, count - maxHistory)
        .map(item => item.id);
        
      await this.db.history.bulkDelete(idsToDelete);
    }

    this._version.update(v => v + 1);

    // Sync if logged in
    this.syncWithCloud();
  }

  async getHistory(): Promise<HistoryItem[]> {
    const user = this.auth.currentUser();
    if (!user) return [];

    return this.db.history
      .where('userId')
      .equals(user.user_id)
      .reverse()
      .sortBy('playedAt');
  }

  async syncWithCloud(): Promise<void> {
    if (!this.auth.currentUser()) return;

    const localHistory = await this.getHistory();
    
    // 1. Upload local
    await firstValueFrom(this.deezer.uploadHistory(localHistory));

    // 2. Download latest from cloud
    const cloudData = await firstValueFrom(this.deezer.downloadHistory());
    
    if (cloudData.items?.length > 0) {
      const user = this.auth.currentUser();
      // Simple merge: put all cloud items into local DB, tagged with current userId
      const itemsWithUser = cloudData.items.map((item: HistoryItem) => ({ ...item, userId: user!.user_id }));
      await this.db.history.bulkPut(itemsWithUser);
      this._version.update(v => v + 1);
    }
  }
}
