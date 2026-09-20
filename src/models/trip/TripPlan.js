import { TripDestination } from './TripDestination'
import { Accommodation } from './Accommodation'
import { TripEvent } from './TripEvent'
import { addDaysJalali, formatJalali, parseJalali } from '../../utils/jalali'

export var TRIP_STATUSES = {
  planning: 'در حال برنامه‌ریزی',
  upcoming: 'پیش رو',
  ongoing: 'در حال انجام',
  completed: 'پایان یافته'
}

/**
 * Aggregate Root for a trip plan: metadata, catalog references, the
 * day-by-day itinerary, accommodations, and the event log.
 */
export class TripPlan {
  constructor({
    id, title, description = '', startDateJalali, durationDays = 1, budget = 0, weatherCity = '', weatherSnapshot = null,
    vehicleIds = [], companionIds = [], culturalNotes = [], documentIds = [], equipmentIds = [],
    destinations = [], accommodations = [], events = [], status = 'planning', createdAt = Date.now()
  }) {
    this.id = id
    this.title = title
    this.description = description
    this.startDateJalali = startDateJalali
    this.durationDays = durationDays
    this.budget = budget
    this.weatherCity = weatherCity
    this.weatherSnapshot = weatherSnapshot
    this.vehicleIds = vehicleIds
    this.companionIds = companionIds
    this.culturalNotes = culturalNotes
    this.documentIds = documentIds
    this.equipmentIds = equipmentIds
    this.destinations = destinations.map((d) => (d instanceof TripDestination ? d : new TripDestination(d)))
    this.accommodations = accommodations.map((a) => (a instanceof Accommodation ? a : new Accommodation(a)))
    this.events = events.map((e) => (e instanceof TripEvent ? e : new TripEvent(e)))
    this.status = status
    this.createdAt = createdAt
  }

  get endDateJalali() {
    var start = parseJalali(this.startDateJalali)
    if (!start) return ''
    var end = addDaysJalali(start.jy, start.jm, start.jd, Math.max(this.durationDays - 1, 0))
    return formatJalali(end.jy, end.jm, end.jd)
  }

  destinationsForDay(day) { return this.destinations.filter((d) => d.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)) }
  accommodationForDay(day) { return this.accommodations.find((a) => a.day === day) || null }

  /** Checks whether a new time window overlaps any existing destination already scheduled that day. */
  hasOverlapOnDay(day, startTime, durationHours, excludeId = null) {
    var toMinutes = (t) => { var [h, m] = t.split(':').map(Number); return h * 60 + m }
    var newStart = toMinutes(startTime)
    var newEnd = newStart + Math.round(durationHours * 60)

    return this.destinationsForDay(day).some((dest) => {
      if (dest.id === excludeId) return false
      var existingStart = toMinutes(dest.startTime)
      var existingEnd = toMinutes(dest.endTime)
      return newStart < existingEnd && existingStart < newEnd
    })
  }

  addDestination(destination) { this.destinations.push(destination instanceof TripDestination ? destination : new TripDestination(destination)) }
  removeDestination(destinationId) { this.destinations = this.destinations.filter((d) => d.id !== destinationId) }

  setAccommodationForDay(accommodation) {
    this.accommodations = this.accommodations.filter((a) => a.day !== accommodation.day)
    this.accommodations.push(accommodation instanceof Accommodation ? accommodation : new Accommodation(accommodation))
  }

  addEvent(event) { this.events.push(event instanceof TripEvent ? event : new TripEvent(event)) }
  removeEvent(eventId) { this.events = this.events.filter((e) => e.id !== eventId) }

  toJSON() {
    return {
      id: this.id, title: this.title, description: this.description, startDateJalali: this.startDateJalali, durationDays: this.durationDays,
      budget: this.budget, weatherCity: this.weatherCity, weatherSnapshot: this.weatherSnapshot, vehicleIds: this.vehicleIds, companionIds: this.companionIds,
      culturalNotes: this.culturalNotes, documentIds: this.documentIds, equipmentIds: this.equipmentIds,
      destinations: this.destinations.map((d) => d.toJSON()), accommodations: this.accommodations.map((a) => a.toJSON()), events: this.events.map((e) => e.toJSON()),
      status: this.status, createdAt: this.createdAt
    }
  }

  static fromJSON(json) { return new TripPlan(json) }
}
