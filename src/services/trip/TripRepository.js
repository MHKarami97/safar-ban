import { TripPlan } from '../../models/trip/TripPlan'
import { storageService } from '../StorageService'

const STORAGE_KEY = 'trips'

export class TripRepository {
  constructor(storage = storageService) { this.storage = storage }
  getAll() { return this.storage.get(STORAGE_KEY, []).map((json) => TripPlan.fromJSON(json)) }
  saveAll(trips) { return this.storage.set(STORAGE_KEY, trips.map((trip) => trip.toJSON())) }
}

export const tripRepository = new TripRepository()
