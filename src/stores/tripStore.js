import { defineStore } from 'pinia'
import { tripRepository } from '../services/trip/TripRepository'
import { TripFactory } from '../services/trip/TripFactory'
import { TripPrintService } from '../services/trip/TripPrintService'
import { useCatalogStore } from './catalogStore'

/**
 * Central reactive store for trip plans: creation, day-by-day itinerary,
 * accommodations, event log, status lifecycle, filtering/search and print export.
 */
export var useTripStore = defineStore('trip', {
  state: () => ({ trips: [], activeTripId: null, filterStatus: 'all', searchQuery: '' }),

  getters: {
    activeTrip(state) { return state.trips.find((trip) => trip.id === state.activeTripId) || null },
    ongoingTrips(state) {
      var list = state.trips.filter((trip) => trip.status !== 'completed')
      if (state.filterStatus !== 'all') list = list.filter((trip) => trip.status === state.filterStatus)
      if (state.searchQuery.trim()) {
        var q = state.searchQuery.trim().toLowerCase()
        list = list.filter((trip) => trip.title.toLowerCase().includes(q))
      }
      return list.sort((a, b) => b.createdAt - a.createdAt)
    },
    completedTrips(state) {
      var list = state.trips.filter((trip) => trip.status === 'completed')
      if (state.searchQuery.trim()) {
        var q = state.searchQuery.trim().toLowerCase()
        list = list.filter((trip) => trip.title.toLowerCase().includes(q))
      }
      return list.sort((a, b) => b.createdAt - a.createdAt)
    }
  },

  actions: {
    initialize() { this.trips = tripRepository.getAll() },
    persistAll() { tripRepository.saveAll(this.trips) },

    createTrip(data) {
      var trip = TripFactory.createTrip(data)
      this.trips.push(trip)
      this.persistAll()
      return trip
    },

    updateTrip(tripId, patch) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return
      Object.assign(trip, patch)
      this.persistAll()
    },

    deleteTrip(tripId) {
      this.trips = this.trips.filter((t) => t.id !== tripId)
      this.persistAll()
    },

    setStatus(tripId, status) { this.updateTrip(tripId, { status }) },

    /** Returns { destination, overlaps } — caller decides whether to warn the user; insertion is not blocked. */
    addDestination(tripId, data) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return { destination: null, overlaps: false }
      var overlaps = trip.hasOverlapOnDay(data.day, data.startTime, data.durationHours)
      var destination = TripFactory.createDestination(data)
      trip.addDestination(destination)
      this.persistAll()
      return { destination, overlaps }
    },

    removeDestination(tripId, destinationId) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return
      trip.removeDestination(destinationId)
      this.persistAll()
    },

    setAccommodation(tripId, data) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return
      trip.setAccommodationForDay(TripFactory.createAccommodation(data))
      this.persistAll()
    },

    addEvent(tripId, data) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return
      trip.addEvent(TripFactory.createEvent(data))
      this.persistAll()
    },

    updateEvent(tripId, eventId, patch) {
      var trip = this.trips.find((t) => t.id === tripId)
      var event = trip?.events.find((e) => e.id === eventId)
      if (!event) return
      Object.assign(event, patch)
      this.persistAll()
    },

    removeEvent(tripId, eventId) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return
      trip.removeEvent(eventId)
      this.persistAll()
    },

    setFilterStatus(status) { this.filterStatus = status },
    setSearchQuery(query) { this.searchQuery = query },

    printTrip(tripId) {
      var trip = this.trips.find((t) => t.id === tripId)
      if (!trip) return
      var catalog = useCatalogStore()
      TripPrintService.print(trip, catalog)
    }
  }
})
