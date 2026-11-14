import { Stats } from '../../../utils/stats.js';
import { MONTH_NAMES, SEASON_NAMES, WEEKDAY_NAMES, seasonIndex, weekdayIndex } from '../../../utils/jalaliStats.js';

export class SeasonalAnalyzer {
  get id() {
    return 'seasonal';
  }

  analyze(context) {
    var months = new Array(12).fill(0);
    var seasons = new Array(4).fill(0);
    var weekdays = new Array(7).fill(0);

    context.records.forEach(function (r) {
      months[r.month - 1]++;
      seasons[seasonIndex(r.month)]++;
      weekdays[weekdayIndex(r.startDay)]++;
    });

    return {
      months: this.toItems(months, MONTH_NAMES),
      seasons: this.toItems(seasons, SEASON_NAMES),
      weekdays: this.toItems(weekdays, WEEKDAY_NAMES),
      favoriteMonth: this.favorite(months, MONTH_NAMES),
      favoriteSeason: this.favorite(seasons, SEASON_NAMES),
      favoriteWeekday: this.favorite(weekdays, WEEKDAY_NAMES)
    };
  }

  toItems(counts, names) {
    return counts.map(function (count, index) { return { label: names[index], value: count }; });
  }

  favorite(counts, names) {
    var best = Stats.maxBy(counts.map(function (count, index) { return { index: index, count: count }; }),
      function (item) { return item.count; });
    return best && best.count > 0 ? { name: names[best.index], count: best.count } : null;
  }
}
