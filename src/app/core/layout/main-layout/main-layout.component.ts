import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { PlayerBarComponent } from '../../../features/player/components/player-bar/player-bar.component';
import { PlaylistSidebarComponent } from '../../../features/player/components/playlist-sidebar/playlist-sidebar.component';
import { MobileQueueDrawerComponent } from '../../../features/player/components/mobile-queue-drawer/mobile-queue-drawer.component';

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
export class MainLayoutComponent {}
