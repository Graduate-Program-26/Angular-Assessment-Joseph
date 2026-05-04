import { Component, inject } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { PlayerUiService } from '../../services/player-ui.service';
import { AppStore } from '../../../../core/store/app.store';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './player-bar.component.html',
  host: {
    class: 'flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 h-28 md:h-20 bg-[var(--tui-background-elevation-2)] border-t border-[var(--tui-border-normal)] shrink-0 z-50 py-2 md:py-0',
  },
})
export class PlayerBarComponent {
  protected readonly playerUi = inject(PlayerUiService);
  protected readonly store = inject(AppStore);

  togglePlay(): void {
    this.store.togglePlay();
  }
}
