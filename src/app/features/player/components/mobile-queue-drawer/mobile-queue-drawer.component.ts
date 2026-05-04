import { Component, inject } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { PlayerUiService } from '../../services/player-ui.service';

@Component({
  selector: 'app-mobile-queue-drawer',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './mobile-queue-drawer.component.html',
  host: {
    class: 'md:hidden fixed inset-0 z-[100] pointer-events-none',
  },
})
export class MobileQueueDrawerComponent {
  protected readonly playerUi = inject(PlayerUiService);
}
