import { Stats } from '../../../utils/stats.js';
import { dayNumberToJalali, formatJalaliLabel } from '../../../utils/jalaliStats.js';

export class GapAnalyzer {
  get id() {
    return 'gaps';
  }

  analyze(context) {
    var records = context.records;
    var gaps = [];
    var startIntervals = [];

    for (var i = 1; i < records.length; i++) {
      var previous = records[i - 1];
      var current = records[i];
      var rawGap = current.startDay - previous.endDay;
      gaps.push({
        from: previous.toSummary(),
        to: current.toSummary(),
        days: Math.max(rawGap, 0),
        isOverlap: rawGap < 0
      });
      startIntervals.push(current.startDay - previous.startDay);
    }

    var values = gaps.map(function (gap) { return gap.days; });
    var last = records.length > 0 ? records[records.length - 1] : null;
    var avgStartInterval = Stats.mean(startIntervals);

    return {
      gaps: gaps,
      count: gaps.length,
      avg: Stats.mean(values),
      median: Stats.median(values),
      longest: Stats.maxBy(gaps, function (gap) { return gap.days; }),
      shortest: Stats.minBy(gaps, function (gap) { return gap.days; }),
      sinceLast: last ? Math.max(context.todayDay - last.endDay, 0) : null,
      avgStartInterval: avgStartInterval,
      nextEstimate: this.estimateNext(last, avgStartInterval, context.todayDay, gaps.length)
    };
  }

  estimateNext(last, avgStartInterval, todayDay, gapCount) {
    if (!last || gapCount === 0) {
      return null;
    }
    var estimatedDay = last.startDay + Math.round(avgStartInterval);
    return {
      label: formatJalaliLabel(dayNumberToJalali(estimatedDay)),
      daysLeft: estimatedDay - todayDay
    };
  }
}
