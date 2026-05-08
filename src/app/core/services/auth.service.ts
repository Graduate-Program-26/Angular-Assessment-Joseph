import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  
  readonly currentUser = signal<User | null>(null);

  constructor() {
    this.checkSession();
  }

  async checkSession(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<User>('/api/auth/me', { withCredentials: true }));
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(): Promise<void> {
    window.location.href = '/api/auth/login';
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {}, { withCredentials: true }));
    this.currentUser.set(null);
  }
}


