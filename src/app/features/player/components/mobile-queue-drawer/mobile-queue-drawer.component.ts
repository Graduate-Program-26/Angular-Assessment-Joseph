import { Component, inject } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { PlayerUiService } from '../../services/player-ui.service';
import { QueueContentComponent } from "../queue-content/queue-content.component";


@Component({
  selector: 'app-mobile-queue-drawer',
  standalone: true,
  imports: [TuiIcon, QueueContentComponent],
  templateUrl: './mobile-queue-drawer.component.html',
  host: {
    class: 'md:hidden fixed inset-0 z-[100] pointer-events-none',
  },
})
export class MobileQueueDrawerComponent {
  protected readonly playerUi = inject(PlayerUiService);

}
