import { CatalogItem } from '../../models/trip/CatalogItem'
import { storageService } from '../StorageService'
import { generateId } from '../../utils/id'

var SEEDS = {
  vehicles: ['ماشین شخصی', 'هواپیما', 'قطار', 'اتوبوس', 'موتور', 'وسیله کرایه‌ای در مقصد'],
  companions: [],
  documents: ['کارت ملی', 'شناسنامه', 'گواهینامه', 'پاسپورت', 'بیمه‌نامه مسافرتی', 'بیمه بدنه خودرو'],
  equipment: ['چادر', 'کیف کمک‌های اولیه', 'پاوربانک', 'نقشه آفلاین', 'کلمن و یخ', 'چراق‌قوه']
}

/** Repository Pattern for the four "pick from list or add new" catalogs used by trip planning. */
export class CatalogRepository {
  constructor(kind, storage = storageService) {
    this.kind = kind
    this.storage = storage
    this.key = `catalog-${kind}`
  }

  getAll() {
    if (!this.storage.get(this.key, null)) {
      var seeded = (SEEDS[this.kind] || []).map((name) => new CatalogItem({ id: generateId(this.kind), name, isCustom: false }))
      this.saveAll(seeded)
      return seeded
    }
    return this.storage.get(this.key, []).map((json) => CatalogItem.fromJSON(json))
  }

  saveAll(items) { return this.storage.set(this.key, items.map((item) => item.toJSON())) }
}

export const vehicleRepository = new CatalogRepository('vehicles')
export const companionRepository = new CatalogRepository('companions')
export const documentRepository = new CatalogRepository('documents')
export const equipmentRepository = new CatalogRepository('equipment')
