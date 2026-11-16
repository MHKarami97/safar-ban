import test from 'node:test'
import assert from 'node:assert/strict'
import { NAV_ITEMS, HOME_CARDS, TONES, isNavActive } from '../src/data/appNav.js'
import { ICON_PATHS } from '../src/data/iconPaths.js'

test('nav items are unique, with existing icons and tones', () => {
  assert.equal(new Set(NAV_ITEMS.map((item) => item.id)).size, NAV_ITEMS.length)
  assert.equal(new Set(NAV_ITEMS.map((item) => item.to)).size, NAV_ITEMS.length)
  NAV_ITEMS.forEach((item) => {
    assert.ok(ICON_PATHS[item.icon], `missing icon ${item.icon}`)
    assert.ok(TONES[item.tone], `missing tone ${item.tone}`)
  })
})

test('bottom bar keeps four destinations (grid-cols-4) and home cards skip home', () => {
  assert.equal(NAV_ITEMS.length, 4)
  assert.equal(HOME_CARDS.length, 3)
  assert.ok(!HOME_CARDS.some((card) => card.id === 'home'))
})

test('nested routes keep their parent tab active without leaking', () => {
  var byId = Object.fromEntries(NAV_ITEMS.map((item) => [item.id, item]))
  assert.equal(isNavActive(byId.regions, 'region-detail'), true)
  assert.equal(isNavActive(byId.trips, 'trip-destinations'), true)
  assert.equal(isNavActive(byId.trips, 'region-detail'), false)
  assert.equal(isNavActive(byId.home, 'trip-list'), false)
  assert.equal(isNavActive(byId.reports, undefined), false)
})
