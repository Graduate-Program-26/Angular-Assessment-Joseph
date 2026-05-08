import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/services/indexed-db.service';
import { TuiButton, TuiDialogService, TuiLabel, TuiTextfield, TuiIcon } from '@taiga-ui/core';
import { TuiResponsiveDialogService, type TuiResponsiveDialogOptions } from '@taiga-ui/addon-mobile';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { CreatePlaylistDialogComponent } from './create-playlist-dialog/create-playlist-dialog.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    TuiButton,
    ReactiveFormsModule,
    TuiTextfield, 
    TuiIcon,
  ],
  templateUrl: './playlists.component.html',
})
export class PlaylistsComponent implements OnInit {
  private readonly playlistService = inject(PlaylistService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiResponsiveDialogService);

  readonly playlists = signal<Playlist[]>([]);
  
  protected readonly options: Partial<TuiResponsiveDialogOptions> = {
    label: 'Create Playlist',
    size: 's',
  };

  constructor() {
    effect(() => {
      this.playlistService.version();
      this.loadPlaylists();
    });
  }

  ngOnInit() {
    this.loadPlaylists();
  }

  async loadPlaylists() {
    const p = await this.playlistService.getPlaylists();
    this.playlists.set(p);
  }

  createNew() {
    this.dialogs
      .open<string>(new PolymorpheusComponent(CreatePlaylistDialogComponent), this.options)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async name => {
        if (name) {
          await this.playlistService.createPlaylist(name);
        }
      });
  }
}
