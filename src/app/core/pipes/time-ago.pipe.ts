import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from "luxon";

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string, _tick?: number): string {
    if (!value) return "0";

    const date = DateTime.fromISO(value);
    if (!date.isValid) return "0";
    if (DateTime.now().diff(date, 'seconds').seconds < 10) {
      return "Just now";
    }
    return date.toRelative() ?? "";
  }
}