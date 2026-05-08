import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TuiIcon, TuiDropdown, TuiDropdownOpen, TuiDataList, TuiButton } from '@taiga-ui/core';
import { AppStore } from '../../store/app.store';
import { AuthService } from '../../services/auth.service';
import { TuiAvatar } from '@taiga-ui/kit';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TuiIcon, TuiDropdown, TuiDropdownOpen, TuiDataList, TuiButton, TuiAvatar],
  templateUrl: './header.component.html',
  host: {
    class: 'flex items-center justify-between px-4 md:px-8 h-16 bg-[var(--tui-background-elevation-1)] border-b border-[var(--tui-border-normal)] z-40',
  },
})
export class HeaderComponent {
  protected readonly store = inject(AppStore);
  protected readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected open = false;

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
    this.open = false;
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchTerm(value);
    this.goToSearch()
  }
  goToSearch() {
    if (this.router.url !== '/search') {
      this.router.navigate(['/search']);
    }
  }

  getInitials(name: string | null): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
