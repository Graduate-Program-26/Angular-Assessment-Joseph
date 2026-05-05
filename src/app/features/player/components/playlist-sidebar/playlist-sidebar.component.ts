import { Component, inject } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { AppStore } from '../../../../core/store/app.store';
import { PlayerUiService } from '../../services/player-ui.service';
import { DurationPipe } from '../../../../core/pipes/duration.pipe';

@Component({
  selector: 'app-playlist-sidebar',
  standalone: true,
  imports: [TuiIcon, DurationPipe],
  templateUrl: './playlist-sidebar.component.html',
  host: {
    class: 'hidden xl:flex flex-col w-72 bg-[var(--tui-background-base)] border-l border-[var(--tui-border-normal)] shrink-0 overflow-y-auto',
  },
})
export class PlaylistSidebarComponent {
  protected readonly store = inject(AppStore);
  protected readonly playerUi = inject(PlayerUiService);
}
