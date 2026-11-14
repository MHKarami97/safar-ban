import { jalaliToDayNumber, formatJalaliLabel } from '../../utils/jalaliStats.js';

export var RECORD_SOURCE = { TRIP: 'trip', VISIT: 'visit' };

export class TravelRecord {
  constructor(data) {
    this.id = data.id;
    this.source = data.source;
    this.title = data.title || '';
    this.startJalali = data.startJalali;
    this.days = Math.max(Number(data.days) || 1, 1);
    this.cost = Number(data.cost) || 0;
    this.km = Number(data.km) || 0;
    this.regionName = data.regionName || '';
    this.locationCount = data.locationCount || 0;
    this.plan = data.plan || null;
    this.startDay = jalaliToDayNumber(this.startJalali.jy, this.startJalali.jm, this.startJalali.jd);
    this.endDay = this.startDay + this.days - 1;
  }

  get year() {
    return this.startJalali.jy;
  }

  get month() {
    return this.startJalali.jm;
  }

  toSummary() {
    return {
      id: this.id,
      source: this.source,
      title: this.title,
      dateLabel: formatJalaliLabel(this.startJalali),
      days: this.days,
      cost: this.cost,
      km: this.km,
      startDay: this.startDay,
      endDay: this.endDay
    };
  }
}
