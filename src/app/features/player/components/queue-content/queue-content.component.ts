import { Component, computed, inject } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { AppStore } from '../../../../core/store/app.store';
import { DurationPipe } from '../../../../core/pipes/duration.pipe';
import { TuiTiles } from '@taiga-ui/kit';

@Component({
  selector: 'app-queue-content',
  standalone: true,
  imports: [TuiIcon, DurationPipe, TuiTiles],
  templateUrl: './queue-content.component.html',
  styleUrl: './queue-content.component.less',
})
export class QueueContentComponent {
  protected readonly store = inject(AppStore);
  order = computed(() => { return new Map<number, number>(this.store.queue().map((_, index) => [index, index])) });
  onOrderChange(newOrder: Map<number, number>): void {

    const updatedTracks = new Array(this.store.queue().length);

    newOrder.forEach((newIndex, originalIndex) => {
      updatedTracks[newIndex] = this.store.queue()[originalIndex];
    });

    this.store.setQueue(updatedTracks);

  }
}