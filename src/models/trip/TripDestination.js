/**
 * A single stop planned for a given day of the trip, with a start time and
 * an expected duration. `endTime` is derived, not stored.
 */
export class TripDestination {
  constructor({ id, day = 1, name, startTime = '08:00', durationHours = 1, note = '', createdAt = Date.now() }) {
    this.id = id
    this.day = day
    this.name = name
    this.startTime = startTime
    this.durationHours = durationHours
    this.note = note
    this.createdAt = createdAt
  }

  get endTime() {
    var [h, m] = this.startTime.split(':').map(Number)
    var totalMinutes = h * 60 + m + Math.round(this.durationHours * 60)
    var endH = Math.floor(totalMinutes / 60) % 24
    var endM = totalMinutes % 60
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  }

  toJSON() {
    return { id: this.id, day: this.day, name: this.name, startTime: this.startTime, durationHours: this.durationHours, note: this.note, createdAt: this.createdAt }
  }

  static fromJSON(json) { return new TripDestination(json) }
}
