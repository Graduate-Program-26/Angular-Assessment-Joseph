import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TuiIcon],
  templateUrl: './header.component.html',
  host: {
    class: 'flex items-center justify-between px-4 md:px-8 h-16 bg-[var(--tui-background-elevation-1)] border-b border-[var(--tui-border-normal)] z-40',
  },
})
export class HeaderComponent {}
