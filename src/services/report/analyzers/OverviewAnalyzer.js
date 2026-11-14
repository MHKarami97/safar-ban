import { Stats } from '../../../utils/stats.js';

export class OverviewAnalyzer {
  get id() {
    return 'overview';
  }

  analyze(context) {
    var records = context.records;
    var days = records.map(function (r) { return r.days; });
    var withCost = records.filter(function (r) { return r.cost > 0; });
    var withKm = records.filter(function (r) { return r.km > 0; });
    var totalCost = Stats.sum(records.map(function (r) { return r.cost; }));
    var totalKm = Stats.sum(records.map(function (r) { return r.km; }));
    var longest = Stats.maxBy(records, function (r) { return r.days; });
    var costliest = Stats.maxBy(withCost, function (r) { return r.cost; });
    var farthest = Stats.maxBy(withKm, function (r) { return r.km; });

    return {
      count: records.length,
      totalDays: Stats.sum(days),
      totalCost: totalCost,
      totalKm: totalKm,
      avgDays: Stats.mean(days),
      medianDays: Stats.median(days),
      avgCost: withCost.length > 0 ? totalCost / withCost.length : 0,
      avgKm: withKm.length > 0 ? totalKm / withKm.length : 0,
      first: records.length > 0 ? records[0].toSummary() : null,
      last: records.length > 0 ? records[records.length - 1].toSummary() : null,
      longest: longest ? longest.toSummary() : null,
      costliest: costliest ? costliest.toSummary() : null,
      farthest: farthest ? farthest.toSummary() : null
    };
  }
}
