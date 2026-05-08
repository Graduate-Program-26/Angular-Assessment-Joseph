import { Injectable, signal } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class PlayerUiService {
  readonly isQueueOpen = signal(false);

  toggleQueue(): void {
    this.isQueueOpen.update(open => !open);
  }

  closeQueue(): void {
    this.isQueueOpen.set(false);
  }
}
