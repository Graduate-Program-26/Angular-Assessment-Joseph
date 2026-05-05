import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
  pure: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (!value) return '0:00';
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    const seconds: number = value % 60;
    const minutesString = minutes.toString().padStart(2, '0');
    const secondsString = seconds.toFixed(0).toString().padStart(2, '0');

    return hours > 0
      ? `${hours}:${minutesString}:${secondsString}`
      : `${minutes}:${secondsString}`;
  }
}
