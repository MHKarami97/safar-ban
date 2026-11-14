import { Stats } from '../../../utils/stats.js';

var TOP_LIMIT = 5;

export class RegionAnalyzer {
  get id() {
    return 'regions';
  }

  analyze(context) {
    var enabled = context.regions.filter(function (region) { return region.isEnabled; });
    var rows = enabled.map(function (region) {
      var visits = region.visitRecords || [];
      return {
        id: region.id,
        name: region.name,
        icon: region.icon,
        visited: region.visitedCount,
        total: region.totalCount,
        percent: region.progressPercent,
        visits: visits.length,
        days: Stats.sum(visits.map(function (v) { return Number(v.days) || 0; })),
        cost: Stats.sum(visits.map(function (v) { return Number(v.totalCost) || 0; })),
        km: Stats.sum(visits.map(function (v) { return Number(v.km) || 0; }))
      };
    });

    var visitedLocations = Stats.sum(rows.map(function (r) { return r.visited; }));
    var totalLocations = Stats.sum(rows.map(function (r) { return r.total; }));

    return {
      rows: rows,
      regionCount: rows.length,
      touchedCount: rows.filter(function (r) { return r.visited > 0; }).length,
      visitedLocations: visitedLocations,
      totalLocations: totalLocations,
      percent: totalLocations > 0 ? (visitedLocations / totalLocations) * 100 : 0,
      mostVisited: rows.filter(function (r) { return r.visits > 0; })
        .sort(function (a, b) { return b.visits - a.visits; }).slice(0, TOP_LIMIT),
      almostDone: rows.filter(function (r) { return r.percent >= 50 && r.percent < 100; })
        .sort(function (a, b) { return b.percent - a.percent; }).slice(0, 3),
      neverVisited: rows.filter(function (r) { return r.total > 0 && r.visited === 0; })
        .map(function (r) { return r.name; }),
      topCities: this.topCities(enabled)
    };
  }

  topCities(regions) {
    var cities = [];
    regions.forEach(function (region) {
      region.cities.forEach(function (city) {
        if (city.visitedCount > 0) {
          cities.push({ name: city.name, regionName: region.name, count: city.visitedCount });
        }
      });
    });
    return cities.sort(function (a, b) { return b.count - a.count; }).slice(0, TOP_LIMIT);
  }
}
