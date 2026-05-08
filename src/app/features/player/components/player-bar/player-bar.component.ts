import { Component, inject, computed } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { AppStore } from '../../../../core/store/app.store';
import { AudioService } from '../../../../core/services/audio.service';
import { DurationPipe } from '../../../../core/pipes/duration.pipe';
import { PlayerUiService } from '../../services/player-ui.service';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [TuiIcon, DurationPipe],
  templateUrl: './player-bar.component.html',
  host: {
    class: 'relative flex flex-row items-center justify-between px-4 md:px-6 h-20 md:h-20 bg-[var(--tui-background-elevation-2)] shrink-0 z-50',
  },
})
export class PlayerBarComponent {
  protected readonly audioService = inject(AudioService);
  protected readonly store = inject(AppStore);
  protected readonly playerUi = inject(PlayerUiService);

  protected readonly progressPercent = computed(() => {
    const current = this.store.currentTime();
    const duration = this.store.duration();
    return duration > 0 ? (current / duration) * 100 : 0;
  });

  togglePlay(): void {
    this.store.togglePlay();
  }

  playNext(): void {
    this.audioService.playNext();
  }

  playPrevious(): void {
    this.audioService.playPrevious();
  }

  onSeek(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.audioService.seek(Number(value));
  }

  onVolumeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setVolume(Number(value));
  }
  toggleMute(){
    this.store.toggleMute();
  }

  toggleShuffle(): void {
    this.store.toggleShuffle();
  }

  toggleRepeat(): void {
    this.store.toggleRepeat();
  }
}
