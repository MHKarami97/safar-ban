import { Stats } from '../../../utils/stats.js';

var BUCKETS = [
  { label: 'یک‌روزه', min: 1, max: 1 },
  { label: '۲ تا ۳ روز', min: 2, max: 3 },
  { label: '۴ تا ۷ روز', min: 4, max: 7 },
  { label: '۸ تا ۱۴ روز', min: 8, max: 14 },
  { label: 'بیش از ۱۴ روز', min: 15, max: Infinity }
];

export class DurationAnalyzer {
  get id() {
    return 'duration';
  }

  analyze(context) {
    var days = context.records.map(function (r) { return r.days; });
    var buckets = BUCKETS.map(function (bucket) {
      var count = days.filter(function (d) { return d >= bucket.min && d <= bucket.max; }).length;
      return { label: bucket.label, value: count };
    });
    var shortest = Stats.minBy(context.records, function (r) { return r.days; });

    return {
      buckets: buckets,
      shortest: shortest ? shortest.toSummary() : null,
      avg: Stats.mean(days),
      median: Stats.median(days)
    };
  }
}
