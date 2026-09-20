import { City } from './City'
import { VisitRecord } from './VisitRecord'

/**
 * Aggregate Root for a province or a country: a tree of cities -> locations,
 * plus the visit history for that region. `type` distinguishes provinces
 * (shown by default) from countries (hidden by default, opt-in).
 */
export class Region {
  constructor({ id, name, icon = '📍', type = 'province', isEnabled = true, isCustom = false, cities = [], visitRecords = [], createdAt = Date.now() }) {
    this.id = id
    this.name = name
    this.icon = icon
    this.type = type
    this.isEnabled = isEnabled
    this.isCustom = isCustom
    this.createdAt = createdAt
    this.cities = cities.map((city) => (city instanceof City ? city : new City(city)))
    this.visitRecords = visitRecords.map((rec) => (rec instanceof VisitRecord ? rec : new VisitRecord(rec)))
  }

  get allLocations() { return this.cities.flatMap((city) => city.locations) }
  get totalCount() { return this.allLocations.length }
  get visitedCount() { return this.allLocations.filter((loc) => loc.isVisited).length }
  get progressPercent() { return this.totalCount === 0 ? 0 : Math.round((this.visitedCount / this.totalCount) * 100) }

  addCity(city) { this.cities.push(city instanceof City ? city : new City(city)) }
  removeCity(cityId) { this.cities = this.cities.filter((city) => city.id !== cityId) }
  findCity(cityId) { return this.cities.find((city) => city.id === cityId) }

  findLocation(locationId) {
    for (var city of this.cities) {
      var found = city.findLocation(locationId)
      if (found) return found
    }
    return null
  }

  findCityOfLocation(locationId) { return this.cities.find((city) => city.findLocation(locationId)) }

  /** Marks one or more locations (possibly across different cities) as visited together, sharing a single VisitRecord. */
  markVisited(locationIds, details) {
    var record = details instanceof VisitRecord ? details : new VisitRecord({ ...details, locationIds })
    this.visitRecords.push(record)
    locationIds.forEach((locationId) => {
      var location = this.findLocation(locationId)
      if (location) {
        location.isVisited = true
        location.visitRecordId = record.id
      }
    })
    return record
  }

  unmarkVisited(locationId) {
    var location = this.findLocation(locationId)
    if (!location) return
    var recordId = location.visitRecordId
    location.isVisited = false
    location.visitRecordId = null
    if (recordId) {
      var stillReferenced = this.allLocations.some((loc) => loc.visitRecordId === recordId)
      if (!stillReferenced) this.visitRecords = this.visitRecords.filter((rec) => rec.id !== recordId)
    }
  }

  getVisitRecord(recordId) { return this.visitRecords.find((rec) => rec.id === recordId) }

  toJSON() {
    return {
      id: this.id, name: this.name, icon: this.icon, type: this.type, isEnabled: this.isEnabled, isCustom: this.isCustom, createdAt: this.createdAt,
      cities: this.cities.map((city) => city.toJSON()), visitRecords: this.visitRecords.map((rec) => rec.toJSON())
    }
  }

  static fromJSON(json) { return new Region(json) }
}
