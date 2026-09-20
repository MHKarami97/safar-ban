/**
 * Details captured once a set of locations is marked as "gone to".
 * A single record can be shared by several locations that were visited
 * together on the same trip (e.g. سعدی و حافظ در یک سفر).
 */
export class VisitRecord {
  constructor({ id, dateJalali = '', totalCost = 0, days = 1, km = 0, description = '', locationIds = [], createdAt = Date.now() }) {
    this.id = id
    this.dateJalali = dateJalali
    this.totalCost = totalCost
    this.days = days
    this.km = km
    this.description = description
    this.locationIds = locationIds
    this.createdAt = createdAt
  }

  toJSON() {
    return { id: this.id, dateJalali: this.dateJalali, totalCost: this.totalCost, days: this.days, km: this.km, description: this.description, locationIds: this.locationIds, createdAt: this.createdAt }
  }

  static fromJSON(json) { return new VisitRecord(json) }
}
