import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { AppStore } from '../../store/app.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TuiIcon],
  templateUrl: './header.component.html',
  host: {
    class: 'flex items-center justify-between px-4 md:px-8 h-16 bg-[var(--tui-background-elevation-1)] border-b border-[var(--tui-border-normal)] z-40',
  },
})
export class HeaderComponent {
  protected readonly store = inject(AppStore);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchTerm(value);
  }
}
