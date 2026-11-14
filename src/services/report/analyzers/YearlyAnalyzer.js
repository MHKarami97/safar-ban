import { Stats } from '../../../utils/stats.js';
import { MONTH_NAMES, daysInJalaliYear } from '../../../utils/jalaliStats.js';

export class YearlyAnalyzer {
  get id() {
    return 'yearly';
  }

  analyze(context) {
    var self = this;
    var groups = Stats.groupBy(context.records, function (r) { return r.year; });
    var years = [];
    groups.forEach(function (list, year) {
      years.push(self.summarize(year, list));
    });
    years.sort(function (a, b) { return a.year - b.year; });

    var byYear = new Map(years.map(function (y) { return [y.year, y]; }));
    years.forEach(function (y) {
      var previous = byYear.get(y.year - 1);
      y.delta = previous ? {
        count: y.count - previous.count,
        days: y.totalDays - previous.totalDays,
        cost: y.totalCost - previous.totalCost
      } : null;
    });

    return Object.assign({ years: years }, this.averages(years, context.today.jy));
  }

  summarize(year, list) {
    var months = new Array(12).fill(0);
    list.forEach(function (r) { months[r.month - 1]++; });
    var busiest = Stats.maxBy(months.map(function (count, index) { return { index: index, count: count }; }),
      function (m) { return m.count; });
    var totalDays = Stats.sum(list.map(function (r) { return r.days; }));
    var totalCost = Stats.sum(list.map(function (r) { return r.cost; }));
    var costed = list.filter(function (r) { return r.cost > 0; });
    var longest = Stats.maxBy(list, function (r) { return r.days; });
    var costliest = Stats.maxBy(costed, function (r) { return r.cost; });
    var regionNames = list.map(function (r) { return r.regionName; }).filter(Boolean);

    return {
      year: year,
      count: list.length,
      totalDays: totalDays,
      totalCost: totalCost,
      totalKm: Stats.sum(list.map(function (r) { return r.km; })),
      avgDays: totalDays / list.length,
      avgCost: costed.length > 0 ? totalCost / costed.length : 0,
      daysShare: Math.min((totalDays / daysInJalaliYear(year)) * 100, 100),
      longest: longest ? longest.toSummary() : null,
      costliest: costliest ? costliest.toSummary() : null,
      months: months,
      busiestMonth: busiest && busiest.count > 0 ? { name: MONTH_NAMES[busiest.index], count: busiest.count } : null,
      topRegions: Stats.topEntries(Stats.countBy(regionNames), 3),
      delta: null
    };
  }

  averages(years, currentYear) {
    if (years.length === 0) {
      return { avgPerCalendarYear: 0, avgPerActiveYear: 0, avgPerCompletedYear: null, best: null, mostDays: null, mostExpensive: null };
    }
    var total = Stats.sum(years.map(function (y) { return y.count; }));
    var firstYear = years[0].year;
    var lastYear = years[years.length - 1].year;
    var span = Math.max(currentYear, lastYear) - firstYear + 1;
    var completedSpan = currentYear - firstYear;
    var completedTotal = Stats.sum(years.filter(function (y) { return y.year < currentYear; })
      .map(function (y) { return y.count; }));

    return {
      avgPerCalendarYear: total / span,
      avgPerActiveYear: total / years.length,
      avgPerCompletedYear: completedSpan > 0 ? completedTotal / completedSpan : null,
      best: Stats.maxBy(years, function (y) { return y.count; }),
      mostDays: Stats.maxBy(years, function (y) { return y.totalDays; }),
      mostExpensive: Stats.maxBy(years, function (y) { return y.totalCost; })
    };
  }
}
