import { Injectable, inject, signal } from '@angular/core';
import { Track } from '../models/track.model';
import { DateTime } from 'luxon';
import { AppDatabase, HistoryItem } from './indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly db = inject(AppDatabase);
  private readonly _version = signal(1);
  readonly version = this._version.asReadonly();

  async addToHistory(track: Track): Promise<void> {
    const historyItem: HistoryItem = {
      ...track,
      playedAt: DateTime.now().toISO(),
    };

    await this.db.history.put(historyItem);
    
    // Keep only last 30
    const maxHistory = 30;
    const count = await this.db.history.count();
    if (count > maxHistory) {
      const oldestItems = await this.db.history
        .orderBy('playedAt')
        .limit(count - maxHistory)
        .primaryKeys();
      await this.db.history.bulkDelete(oldestItems);
    }

    this._version.update(v => v + 1);
  }

  async getHistory(): Promise<HistoryItem[]> {
    return this.db.history
      .orderBy('playedAt')
      .reverse()
      .toArray();
  }
}
