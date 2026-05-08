import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'explore',
        loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent),
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
      },
      {
        path: 'playlists',
        canActivate: [authGuard],
        loadComponent: () => import('./features/playlists/playlists.component').then(m => m.PlaylistsComponent),
      },
      {
        path: 'playlists/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./features/playlists/playlist-detail/playlist-detail.component').then(m => m.PlaylistDetailComponent),
      },
      {
        path: 'albums/:id',
        loadComponent: () => import('./features/albums/album-detail/album-detail.component').then(m => m.AlbumDetailComponent),
      },
      {
        path: 'artists/:id',
        loadComponent: () => import('./features/artists/artist-detail/artist-detail.component').then(m => m.ArtistDetailComponent),
      },
      {
        path: 'history',
        canActivate: [authGuard],
        loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
      },
    ]
  }
];
