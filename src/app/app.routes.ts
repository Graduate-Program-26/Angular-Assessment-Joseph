import { Routes } from '@angular/router';

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
        loadComponent: () => import('./features/playlists/playlists.component').then(m => m.PlaylistsComponent),
      },
      {
        path: 'library',
        loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent),
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
      },
    ]
  }
];
