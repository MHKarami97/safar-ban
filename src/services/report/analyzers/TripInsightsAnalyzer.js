import { Stats } from '../../../utils/stats.js';
import { RECORD_SOURCE } from '../../../models/report/TravelRecord.js';

var TOP_LIMIT = 5;

export class TripInsightsAnalyzer {
  get id() {
    return 'tripInsights';
  }

  analyze(context) {
    var plans = context.records
      .filter(function (r) { return r.source === RECORD_SOURCE.TRIP; })
      .map(function (r) { return r.plan; });
    var vehicleNames = this.nameMap(context.catalog.vehicles);
    var companionNames = this.nameMap(context.catalog.companions);

    return {
      tripCount: plans.length,
      vehicles: this.topUsage(plans, function (plan) { return TripInsightsAnalyzer.vehiclesOf(plan, vehicleNames); }),
      companions: this.topUsage(plans, function (plan) {
        return (plan.companionIds || []).map(function (id) { return companionNames.get(id); }).filter(Boolean);
      }),
      weatherCities: this.topUsage(plans, function (plan) { return plan.weatherCity ? [plan.weatherCity.trim()] : []; }),
      accommodations: this.accommodations(plans),
      execution: this.execution(plans),
      budget: this.budget(plans)
    };
  }

  nameMap(items) {
    return new Map((items || []).map(function (item) { return [item.id, item.name]; }));
  }

  static vehiclesOf(plan, vehicleNames) {
    var names = new Set();
    (plan.vehicleIds || []).forEach(function (id) {
      if (vehicleNames.has(id)) {
        names.add(vehicleNames.get(id));
      }
    });
    (plan.events || []).forEach(function (event) {
      if (event.vehicleUsed) {
        names.add(event.vehicleUsed);
      }
    });
    return Array.from(names);
  }

  topUsage(plans, namesOf) {
    var all = [];
    plans.forEach(function (plan) { all = all.concat(namesOf(plan)); });
    return Stats.topEntries(Stats.countBy(all), TOP_LIMIT);
  }

  accommodations(plans) {
    var names = [];
    var nights = 0;
    plans.forEach(function (plan) {
      (plan.accommodations || []).forEach(function (stay) {
        nights++;
        if (stay.name) {
          names.push(stay.name.trim());
        }
      });
    });
    return { nights: nights, top: Stats.topEntries(Stats.countBy(names), TOP_LIMIT) };
  }

  execution(plans) {
    var planned = 0;
    var visited = 0;
    var missed = 0;
    var events = 0;
    plans.forEach(function (plan) {
      planned += (plan.destinations || []).length;
      (plan.events || []).forEach(function (event) {
        events++;
        visited += (event.visitedDestinationIds || []).length;
        missed += (event.missedDestinationIds || []).length;
      });
    });
    var logged = visited + missed;
    return {
      planned: planned,
      visited: visited,
      missed: missed,
      events: events,
      avgEvents: plans.length > 0 ? events / plans.length : 0,
      completionRate: logged > 0 ? (visited / logged) * 100 : null
    };
  }

  budget(plans) {
    var rows = plans
      .filter(function (plan) { return Number(plan.budget) > 0; })
      .map(function (plan) {
        var spent = Stats.sum((plan.events || []).map(function (e) { return Number(e.cost) || 0; }));
        return { title: plan.title, budget: Number(plan.budget), spent: spent };
      })
      .filter(function (row) { return row.spent > 0; });

    var totalBudget = Stats.sum(rows.map(function (r) { return r.budget; }));
    var totalSpent = Stats.sum(rows.map(function (r) { return r.spent; }));
    return {
      count: rows.length,
      totalBudget: totalBudget,
      totalSpent: totalSpent,
      usagePercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : null,
      overCount: rows.filter(function (r) { return r.spent > r.budget; }).length,
      worstOverrun: Stats.maxBy(rows, function (r) { return r.spent - r.budget; })
    };
  }
}
