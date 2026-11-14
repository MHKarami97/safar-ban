import { TravelRecord, RECORD_SOURCE } from '../../models/report/TravelRecord.js';
import { parseJalali } from '../../utils/jalali.js';
import { Stats } from '../../utils/stats.js';

export var REPORT_SOURCES = { ALL: 'all', TRIPS: 'trips', VISITS: 'visits' };

var FINISHED_STATUS = 'completed';

export class TravelRecordCollector {
  static collect(input) {
    var source = input.source || REPORT_SOURCES.ALL;
    var records = [];
    if (source !== REPORT_SOURCES.VISITS) {
      records = records.concat(TravelRecordCollector.fromTrips(input.trips || [], input.includePlanned));
    }
    if (source !== REPORT_SOURCES.TRIPS) {
      records = records.concat(TravelRecordCollector.fromRegions(input.regions || []));
    }
    return records.sort(function (a, b) { return a.startDay - b.startDay; });
  }

  static fromTrips(trips, includePlanned) {
    var records = [];
    trips.forEach(function (trip) {
      var start = parseJalali(trip.startDateJalali);
      var isIncluded = includePlanned || trip.status === FINISHED_STATUS;
      if (!start || !isIncluded) {
        return;
      }
      records.push(new TravelRecord({
        id: trip.id,
        source: RECORD_SOURCE.TRIP,
        title: trip.title,
        startJalali: start,
        days: trip.durationDays,
        cost: Stats.sum((trip.events || []).map(function (event) { return Number(event.cost) || 0; })),
        locationCount: (trip.destinations || []).length,
        plan: trip
      }));
    });
    return records;
  }

  static fromRegions(regions) {
    var records = [];
    regions.forEach(function (region) {
      (region.visitRecords || []).forEach(function (visit) {
        var start = parseJalali(visit.dateJalali);
        if (!start) {
          return;
        }
        records.push(new TravelRecord({
          id: visit.id,
          source: RECORD_SOURCE.VISIT,
          title: TravelRecordCollector.visitTitle(region, visit),
          startJalali: start,
          days: visit.days,
          cost: visit.totalCost,
          km: visit.km,
          regionName: region.name,
          locationCount: (visit.locationIds || []).length
        }));
      });
    });
    return records;
  }

  static visitTitle(region, visit) {
    var names = (visit.locationIds || [])
      .map(function (id) { return region.findLocation(id); })
      .filter(Boolean)
      .map(function (location) { return location.name; });
    if (names.length === 0) {
      return region.name;
    }
    var title = names.slice(0, 2).join('، ');
    return names.length > 2 ? title + ' و ...' : title;
  }
}
