/**
 * Generic reusable list entry: a vehicle, a companion, a required document
 * or a piece of equipment. Kept simple/shared so the four catalog lists
 * reuse one model + one repository implementation.
 */
export class CatalogItem {
  constructor({ id, name, note = '', isCustom = true, createdAt = Date.now() }) {
    this.id = id
    this.name = name
    this.note = note
    this.isCustom = isCustom
    this.createdAt = createdAt
  }

  toJSON() { return { id: this.id, name: this.name, note: this.note, isCustom: this.isCustom, createdAt: this.createdAt } }
  static fromJSON(json) { return new CatalogItem(json) }
}
