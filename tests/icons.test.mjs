import test from 'node:test'
import assert from 'node:assert/strict'
import { ICON_PATHS } from '../src/data/iconPaths.js'

test('all icon paths are non-empty strings containing valid SVG elements', () => {
  var iconKeys = Object.keys(ICON_PATHS)
  assert.ok(iconKeys.length >= 25, 'should have rich set of icons')

  for (var key of iconKeys) {
    var markup = ICON_PATHS[key]
    assert.equal(typeof markup, 'string', `${key} markup must be string`)
    assert.ok(markup.length > 0, `${key} markup must not be empty`)
    assert.ok(markup.startsWith('<'), `${key} should start with <`)
    assert.ok(markup.endsWith('>'), `${key} should end with >`)
    assert.ok(!markup.includes('undefined'), `${key} should not contain undefined`)
  }
})

test('essential UI icons are present in ICON_PATHS', () => {
  var essential = [
    'home', 'pin', 'bag', 'chart', 'compass', 'sliders', 'sun', 'moon',
    'trash', 'cloud', 'refresh', 'link', 'lock', 'shield', 'warning',
    'calendar', 'calendarDays', 'money', 'hotel', 'building', 'car',
    'check', 'checkCircle', 'xCircle', 'printer', 'weather', 'fileText',
    'plus', 'globe', 'map', 'clock', 'hourglass', 'trophy', 'route', 'rocket'
  ]

  for (var name of essential) {
    assert.ok(ICON_PATHS[name], `missing essential icon: ${name}`)
  }
})
