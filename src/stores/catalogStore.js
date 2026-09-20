import { defineStore } from 'pinia'
import { CatalogItem } from '../models/trip/CatalogItem'
import { generateId } from '../utils/id'
import { vehicleRepository, companionRepository, documentRepository, equipmentRepository } from '../services/trip/CatalogRepository'

var REPOS = { vehicles: vehicleRepository, companions: companionRepository, documents: documentRepository, equipment: equipmentRepository }

/** Manages the four shared "pick from list or add new" catalogs used across every trip plan. */
export var useCatalogStore = defineStore('catalog', {
  state: () => ({ vehicles: [], companions: [], documents: [], equipment: [] }),

  actions: {
    initialize() {
      Object.keys(REPOS).forEach((kind) => { this[kind] = REPOS[kind].getAll() })
    },

    addCustom(kind, name, note = '') {
      if (!name.trim()) return null
      var item = new CatalogItem({ id: generateId(kind), name: name.trim(), note, isCustom: true })
      this[kind].push(item)
      REPOS[kind].saveAll(this[kind])
      return item
    }
  }
})
