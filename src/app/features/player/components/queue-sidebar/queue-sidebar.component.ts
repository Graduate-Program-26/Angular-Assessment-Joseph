import { Component, inject } from '@angular/core';
import { PlayerUiService } from '../../services/player-ui.service';
import { QueueContentComponent } from '../queue-content/queue-content.component';
import { AppStore } from '../../../../core/store/app.store';

@Component({
  selector: 'app-queue-sidebar',
  standalone: true,
  imports: [QueueContentComponent],
  templateUrl: './queue-sidebar.component.html',
  host: {
    class: 'hidden xl:flex flex-col w-72 bg-[var(--tui-background-base)] border-l border-[var(--tui-border-normal)] shrink-0 overflow-y-auto',
  },
})
export class QueueSidebarComponent {
 protected readonly store = inject(AppStore);
  protected readonly playerUi = inject(PlayerUiService);
}
