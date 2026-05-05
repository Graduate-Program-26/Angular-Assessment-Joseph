import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (!value) return '0:00';
    const minutes: number = Math.floor(value / 60);
    const seconds: number = value % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
