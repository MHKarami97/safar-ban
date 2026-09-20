import { Location } from './Location'

/** Groups Location leaves under a city name inside a province/country. */
export class City {
  constructor({ id, name, locations = [] }) {
    this.id = id
    this.name = name
    this.locations = locations.map((loc) => (loc instanceof Location ? loc : new Location(loc)))
  }

  addLocation(location) { this.locations.push(location instanceof Location ? location : new Location(location)) }
  removeLocation(locationId) { this.locations = this.locations.filter((loc) => loc.id !== locationId) }
  findLocation(locationId) { return this.locations.find((loc) => loc.id === locationId) }
  get visitedCount() { return this.locations.filter((loc) => loc.isVisited).length }

  toJSON() { return { id: this.id, name: this.name, locations: this.locations.map((loc) => loc.toJSON()) } }
  static fromJSON(json) { return new City(json) }
}
