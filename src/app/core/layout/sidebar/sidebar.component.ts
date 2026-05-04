import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './sidebar.component.html',
  host: {
    class: 'hidden md:flex flex-col w-56 bg-[var(--tui-background-base)] border-r border-[var(--tui-border-normal)] py-4 gap-1 overflow-y-auto shrink-0',
  },
})
export class SidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Home', icon: '@tui.home', route: '/', exact: true },
    { label: 'Explore', icon: '@tui.compass', route: '/explore', exact: false },
    { label: 'Search', icon: '@tui.search', route: '/search', exact: false },
    { label: 'Library', icon: '@tui.library', route: '/library', exact: false },
    { label: 'Playlists', icon: '@tui.list-music', route: '/playlists', exact: false },
  ];
}
