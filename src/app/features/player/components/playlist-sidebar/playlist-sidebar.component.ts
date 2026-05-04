import { Component } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-playlist-sidebar',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './playlist-sidebar.component.html',
  host: {
    class: 'hidden xl:flex flex-col w-72 bg-[var(--tui-background-base)] border-l border-[var(--tui-border-normal)] shrink-0 overflow-y-auto',
  },
})
export class PlaylistSidebarComponent {}
