import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class FormatService {

  compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const genreA = a.date;
    const genreB = b.date;

    if (genreA > genreB) {
      return -1;
    } else if (genreA < genreB) {
      return 1;
    }
    return 0;
  }

  compareField(a, b, field, direction = 'increase') {
    const genreA = a[field] && a[field].toUpperCase() || a[field];
    const genreB = b[field] && b[field].toUpperCase() || b[field];
    if (direction == 'increase') {
      if (genreA > genreB) {
        return 1;
      } else if (genreA < genreB) {
        return -1;
      }
    }
    else if (direction == 'decrease') {
      if (genreA < genreB) {
        return 1;
      } else if (genreA > genreB) {
        return -1;
      }
    }
    return 0;
  }
}
