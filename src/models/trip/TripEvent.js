/**
 * A daily log entry recorded while the trip is happening: what was visited,
 * what was skipped, cost incurred that day, and free-form notes.
 */
export class TripEvent {
  constructor({ id, dateJalali = '', visitedDestinationIds = [], missedDestinationIds = [], cost = 0, vehicleUsed = '', locationNotes = '', accommodationNotes = '', description = '', createdAt = Date.now() }) {
    this.id = id
    this.dateJalali = dateJalali
    this.visitedDestinationIds = visitedDestinationIds
    this.missedDestinationIds = missedDestinationIds
    this.cost = cost
    this.vehicleUsed = vehicleUsed
    this.locationNotes = locationNotes
    this.accommodationNotes = accommodationNotes
    this.description = description
    this.createdAt = createdAt
  }

  toJSON() {
    return {
      id: this.id, dateJalali: this.dateJalali, visitedDestinationIds: this.visitedDestinationIds, missedDestinationIds: this.missedDestinationIds,
      cost: this.cost, vehicleUsed: this.vehicleUsed, locationNotes: this.locationNotes, accommodationNotes: this.accommodationNotes,
      description: this.description, createdAt: this.createdAt
    }
  }

  static fromJSON(json) { return new TripEvent(json) }
}
