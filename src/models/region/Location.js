/**
 * Leaf node of the region tree: a single place someone wants to visit
 * (e.g. "آرامگاه حافظ" inside city "شیراز" inside province "فارس").
 */
export class Location {
  constructor({ id, name, description = '', isVisited = false, visitRecordId = null, createdAt = Date.now() }) {
    this.id = id
    this.name = name
    this.description = description
    this.isVisited = isVisited
    this.visitRecordId = visitRecordId
    this.createdAt = createdAt
  }

  toJSON() {
    return { id: this.id, name: this.name, description: this.description, isVisited: this.isVisited, visitRecordId: this.visitRecordId, createdAt: this.createdAt }
  }

  static fromJSON(json) { return new Location(json) }
}
