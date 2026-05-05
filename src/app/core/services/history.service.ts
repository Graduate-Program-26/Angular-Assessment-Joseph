import { Injectable, signal } from '@angular/core';
import { Track } from '../models/track.model';
import {DateTime} from 'luxon';

export interface HistoryItem extends Track {
  playedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly dbName = 'DeeJayDB';
  private readonly storeName = 'history';
  private readonly _version =  signal(1);
  readonly version = this._version.asReadonly();

  private db: IDBDatabase | null = null;

  constructor() {
    this.initDb();
  }

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) return resolve(this.db);

      const request = indexedDB.open(this.dbName);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('playedAt', 'playedAt', { unique: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject('Failed to open IndexedDB');
      };
    });
  }

  async addToHistory(track: Track): Promise<void> {
    const db = await this.initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const historyItem:HistoryItem = {
        ...track,
        playedAt: DateTime.now().toISO(),
      };

      const request = store.put(historyItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Failed to add to history');

      // Cleanup old history (keep last 100)
      transaction.oncomplete = () => {
        this.limitHistory(db);
        this._version.update(v => v + 1); 
      };
    });
  }

  private async limitHistory(db: IDBDatabase): Promise<void> {
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('playedAt');
    const request = index.openCursor(null, 'prev');
    
    let count = 0;
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        count++;
        if (count > 100) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  async getHistory(): Promise<HistoryItem[]> {
    const db = await this.initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('playedAt');
      const request = index.openCursor(null, 'prev');
      
      const history: HistoryItem[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          history.push(cursor.value);
          cursor.continue();
        } else {
          resolve(history);
        }
      };
      request.onerror = () => reject('Failed to fetch history');
    });
  }
}
