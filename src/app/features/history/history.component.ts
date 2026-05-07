import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { HistoryService } from '../../core/services/history.service';
import { TimeAgoPipe } from '../../core/pipes/time-ago.pipe';
import { DurationPipe } from '../../core/pipes/duration.pipe';
import { TuiLoader, tuiLoaderOptionsProvider, TuiIcon } from '@taiga-ui/core';
import { AppStore } from '../../core/store/app.store';
import { HistoryItem } from '../../core/services/indexed-db.service';


@Component({
  selector: 'app-history',
  imports: [TimeAgoPipe, DurationPipe, TuiLoader, TuiIcon],
  standalone: true,
  templateUrl: './history.component.html',
  providers: [
    tuiLoaderOptionsProvider({
      size: 'xxl',
      inheritColor: false,
      overlay: true,
    }),
  ],
})
export class HistoryComponent {
  private readonly historyService = inject(HistoryService);
  private readonly store = inject(AppStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly items = signal<HistoryItem[]>([]);
  readonly tick = signal(0);

  playtrack(track: HistoryItem): void {
    this.store.playTrackNow(track);
  }

  constructor() {
    effect(() => {
      this.historyService.version(); 
      if (this.items().length === 0) this.isLoading.set(true);
      this.historyService.getHistory().then((history) => {
        this.items.set(history);
        this.isLoading.set(false);
      });
    });

    const interval = setInterval(() => this.tick.update(t => t + 1), 5000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }
}
