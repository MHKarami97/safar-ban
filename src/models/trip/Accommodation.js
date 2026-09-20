export class Accommodation {
  constructor({ id, day = 1, name = '', address = '', phone = '' }) {
    this.id = id
    this.day = day
    this.name = name
    this.address = address
    this.phone = phone
  }

  toJSON() { return { id: this.id, day: this.day, name: this.name, address: this.address, phone: this.phone } }
  static fromJSON(json) { return new Accommodation(json) }
}
