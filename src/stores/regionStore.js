import { defineStore } from 'pinia'
import { regionRepository } from '../services/region/RegionRepository'
import { RegionFactory } from '../services/region/RegionFactory'
import { provinceDefinitions } from '../data/provinces'
import { countryDefinitions } from '../data/countries'

/**
 * Central reactive store for the region tree (province/country -> city -> location)
 * and the visit history for each region.
 */
export var useRegionStore = defineStore('region', {
  state: () => ({
    regions: [],
    activeRegionId: null,
    selectedLocationIds: [],
    saveTimeoutId: null
  }),

  getters: {
    provinces(state) { return state.regions.filter((region) => region.type === 'province') },
    countries(state) { return state.regions.filter((region) => region.type === 'country') },
    enabledProvinces() { return this.provinces.filter((region) => region.isEnabled) },
    activeRegion(state) { return state.regions.find((region) => region.id === state.activeRegionId) || null }
  },

  actions: {
    initialize() {
      if (regionRepository.exists()) {
        this.regions = regionRepository.getAll()
        this._ensureSeedRegions(provinceDefinitions)
        this._ensureSeedRegions(countryDefinitions)
      } else {
        this.regions = [
          ...provinceDefinitions.map((def) => RegionFactory.createFromDefinition(def)),
          ...countryDefinitions.map((def) => RegionFactory.createFromDefinition(def))
        ]
        this.persistAll()
      }
    },

    _ensureSeedRegions(definitions) {
      var changed = false
      definitions.forEach((def) => {
        if (!this.regions.some((region) => region.id === def.id)) {
          this.regions.push(RegionFactory.createFromDefinition(def))
          changed = true
        }
      })
      if (changed) this.persistAll()
    },

    persistAll() { regionRepository.saveAll(this.regions) },

    schedulePersist() {
      clearTimeout(this.saveTimeoutId)
      this.saveTimeoutId = setTimeout(() => this.persistAll(), 350)
    },

    selectRegion(regionId) {
      this.activeRegionId = regionId
      this.selectedLocationIds = []
    },

    toggleRegionEnabled(regionId) {
      var region = this.regions.find((r) => r.id === regionId)
      if (!region) return
      region.isEnabled = !region.isEnabled
      this.persistAll()
    },

    createCustomRegion(name, icon, type) {
      var region = RegionFactory.createCustomRegion(name, icon, type)
      this.regions.push(region)
      this.persistAll()
      return region
    },

    deleteCustomRegion(regionId) {
      this.regions = this.regions.filter((r) => r.id !== regionId || !r.isCustom)
      this.persistAll()
    },

    addCity(regionId, name) {
      var region = this.regions.find((r) => r.id === regionId)
      if (!region || !name.trim()) return
      region.addCity(RegionFactory.createCity(name.trim()))
      this.schedulePersist()
    },

    removeCity(regionId, cityId) {
      var region = this.regions.find((r) => r.id === regionId)
      if (!region) return
      region.removeCity(cityId)
      this.schedulePersist()
    },

    addLocation(regionId, cityId, name, description = '') {
      var region = this.regions.find((r) => r.id === regionId)
      var city = region?.findCity(cityId)
      if (!city || !name.trim()) return
      city.addLocation(RegionFactory.createLocation(name.trim(), description.trim()))
      this.schedulePersist()
    },

    removeLocation(regionId, locationId) {
      var region = this.regions.find((r) => r.id === regionId)
      if (!region) return
      var city = region.findCityOfLocation(locationId)
      if (city) city.removeLocation(locationId)
      this.schedulePersist()
    },

    toggleLocationSelection(locationId) {
      var index = this.selectedLocationIds.indexOf(locationId)
      if (index >= 0) this.selectedLocationIds.splice(index, 1)
      else this.selectedLocationIds.push(locationId)
    },

    clearSelection() { this.selectedLocationIds = [] },

    confirmVisit(regionId, details) {
      var region = this.regions.find((r) => r.id === regionId)
      if (!region || this.selectedLocationIds.length === 0) return
      region.markVisited([...this.selectedLocationIds], details)
      this.clearSelection()
      this.persistAll()
    },

    unmarkVisited(regionId, locationId) {
      var region = this.regions.find((r) => r.id === regionId)
      if (!region) return
      region.unmarkVisited(locationId)
      this.persistAll()
    },

    updateVisitRecord(regionId, recordId, patch) {
      var region = this.regions.find((r) => r.id === regionId)
      var record = region?.getVisitRecord(recordId)
      if (!record) return
      Object.assign(record, patch)
      this.persistAll()
    }
  }
})
