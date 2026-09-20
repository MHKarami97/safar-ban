import { Region } from '../../models/region/Region'
import { storageService } from '../StorageService'

const STORAGE_KEY = 'regions'

/** Repository Pattern implementation for Region aggregates (provinces and countries share persistence). */
export class RegionRepository {
  constructor(storage = storageService) { this.storage = storage }

  getAll() { return this.storage.get(STORAGE_KEY, []).map((json) => Region.fromJSON(json)) }
  saveAll(regions) { return this.storage.set(STORAGE_KEY, regions.map((region) => region.toJSON())) }
  exists() { return this.storage.get(STORAGE_KEY, null) !== null }
}

export const regionRepository = new RegionRepository()
