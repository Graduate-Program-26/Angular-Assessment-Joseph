import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiTextfield, TuiLabel } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-create-playlist-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiTextfield, TuiLabel, TuiButton],
  template: `
    <form class="flex flex-col h-full" (submit)="submit($event)">
      <div class="flex-1 pb-6">
        <p class="text-sm text-[var(--tui-text-secondary)] mb-6">
          Create a new collection for your favorite tracks.
        </p>
        
        <tui-textfield>
          <label tuiLabel>Playlist Name</label>
          <input
            tuiTextfield
            [formControl]="nameControl"
            placeholder="e.g. Summer Hits 2026"
            autoFocus
          />
        </tui-textfield>
      </div>

      <footer class="flex justify-end gap-3 pt-6 border-t border-[var(--tui-border-normal)]">
        <button
          tuiButton
          type="button"
          appearance="secondary"
          size="m"
          (click)="context.completeWith(null)"
        >
          Cancel
        </button>
        <button
          tuiButton
          type="submit"
          size="m"
          [disabled]="nameControl.invalid"
        >
          Create Playlist
        </button>
      </footer>
    </form>
  `,
})
export class CreatePlaylistDialogComponent {
  protected readonly context = inject<TuiDialogContext<string | null, void>>(POLYMORPHEUS_CONTEXT);
  
  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(1)],
  });

  submit(event: Event) {
    event.preventDefault();
    if (this.nameControl.valid) {
      this.context.completeWith(this.nameControl.value);
    }
  }
}
