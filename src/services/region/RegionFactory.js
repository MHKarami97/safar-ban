import { Region } from '../../models/region/Region'
import { City } from '../../models/region/City'
import { Location } from '../../models/region/Location'
import { generateId } from '../../utils/id'

/** Factory Pattern: builds Region aggregates from static seed definitions or user input. */
export class RegionFactory {
  static createFromDefinition(definition) {
    return new Region({ id: definition.id, name: definition.name, icon: definition.icon, type: definition.type, isEnabled: definition.isEnabled, isCustom: false, cities: [] })
  }

  static createCustomRegion(name, icon = '📍', type = 'province') {
    return new Region({ id: generateId('region'), name, icon, type, isEnabled: true, isCustom: true, cities: [] })
  }

  static createCity(name) { return new City({ id: generateId('city'), name, locations: [] }) }
  static createLocation(name, description = '') { return new Location({ id: generateId('loc'), name, description }) }
}
