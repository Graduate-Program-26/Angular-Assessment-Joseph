import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { PlayerBarComponent } from '../../../features/player/components/player-bar/player-bar.component';
import { MobileQueueDrawerComponent } from '../../../features/player/components/mobile-queue-drawer/mobile-queue-drawer.component';
import { QueueSidebarComponent } from '../../../features/player/components/queue-sidebar/queue-sidebar.component';
import { AppStore } from '../../../core/store/app.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    MobileNavComponent,
    PlayerBarComponent,
    MobileQueueDrawerComponent,
    QueueSidebarComponent,
  ],
  templateUrl: './main-layout.component.html',
  host: {
    class: 'flex flex-col h-full w-full overflow-hidden',
  },
})
export class MainLayoutComponent {
  protected readonly store = inject(AppStore);

  protected readonly contentPadding = computed(() => {
    const hasTrack = this.store.currentTrack();
    if (hasTrack) {
      return 'calc(6rem + env(safe-area-inset-bottom))';
    }
    return 'calc(4rem + env(safe-area-inset-bottom))';
  });
}
