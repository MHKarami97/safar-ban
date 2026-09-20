import { TripPlan } from '../../models/trip/TripPlan'
import { TripDestination } from '../../models/trip/TripDestination'
import { Accommodation } from '../../models/trip/Accommodation'
import { TripEvent } from '../../models/trip/TripEvent'
import { generateId } from '../../utils/id'

export class TripFactory {
  static createTrip(data) { return new TripPlan({ id: generateId('trip'), ...data }) }
  static createDestination(data) { return new TripDestination({ id: generateId('dest'), ...data }) }
  static createAccommodation(data) { return new Accommodation({ id: generateId('stay'), ...data }) }
  static createEvent(data) { return new TripEvent({ id: generateId('event'), ...data }) }
}
