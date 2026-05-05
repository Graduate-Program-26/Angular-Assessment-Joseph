import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { PlayerBarComponent } from '../../../features/player/components/player-bar/player-bar.component';
import { PlaylistSidebarComponent } from '../../../features/player/components/playlist-sidebar/playlist-sidebar.component';
import { MobileQueueDrawerComponent } from '../../../features/player/components/mobile-queue-drawer/mobile-queue-drawer.component';
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
    PlaylistSidebarComponent,
    MobileQueueDrawerComponent,
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
    // No track: on mobile we still need space for mobile-nav (h-16 = 4rem)
    // On desktop, we want 0. We'll handle the desktop 0 using a Tailwind class in the template.
    return 'calc(4rem + env(safe-area-inset-bottom))';
  });
}
