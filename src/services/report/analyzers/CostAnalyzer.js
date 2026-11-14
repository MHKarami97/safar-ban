import { Stats } from '../../../utils/stats.js';

var TOP_LIMIT = 5;

export class CostAnalyzer {
  get id() {
    return 'cost';
  }

  analyze(context) {
    var costed = context.records.filter(function (r) { return r.cost > 0; });
    var withKm = costed.filter(function (r) { return r.km > 0; });
    var totalCost = Stats.sum(costed.map(function (r) { return r.cost; }));
    var totalDays = Stats.sum(costed.map(function (r) { return r.days; }));
    var kmCost = Stats.sum(withKm.map(function (r) { return r.cost; }));
    var kmTotal = Stats.sum(withKm.map(function (r) { return r.km; }));
    var ranked = costed.slice().sort(function (a, b) { return b.cost - a.cost; });

    return {
      tripCount: costed.length,
      totalCost: totalCost,
      avgPerTrip: costed.length > 0 ? totalCost / costed.length : 0,
      avgPerDay: totalDays > 0 ? totalCost / totalDays : 0,
      avgPerKm: kmTotal > 0 ? kmCost / kmTotal : 0,
      mostExpensive: ranked.slice(0, TOP_LIMIT).map(function (r) { return r.toSummary(); }),
      cheapest: ranked.slice(-TOP_LIMIT).reverse().map(function (r) { return r.toSummary(); }),
      dailyCostTop: costed.slice()
        .sort(function (a, b) { return b.cost / b.days - a.cost / a.days; })
        .slice(0, TOP_LIMIT)
        .map(function (r) { var s = r.toSummary(); s.costPerDay = r.cost / r.days; return s; })
    };
  }
}
