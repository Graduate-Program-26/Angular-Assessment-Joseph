import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './mobile-nav.component.html',
  host: {
    class: 'md:hidden flex items-center justify-around bg-[var(--tui-background-elevation-1)] border-t border-[var(--tui-border-normal)] h-16 w-full shrink-0 z-50',
  },
})
export class MobileNavComponent {
  navItems = [
    { label: 'Home', icon: '@tui.home', route: '/' },
    { label: 'Search', icon: '@tui.search', route: '/search' },
    { label: 'Playlists', icon: '@tui.list', route: '/playlists' },
  ];
}
