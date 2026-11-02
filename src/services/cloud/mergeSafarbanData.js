/**
 * Smart three-way merger for safar-ban storage data (trips, regions, locations, catalogs).
 */
export function mergeSafarbanData(localData, remoteData) {
  var local = localData || {}
  var remote = remoteData || {}
  var merged = {}

  // تمام کلیدهای موجود در هر دو طرف
  var allKeys = Array.from(new Set([...Object.keys(local), ...Object.keys(remote)]))

  allKeys.forEach((key) => {
    var localVal = local[key]
    var remoteVal = remote[key]

    if (localVal === undefined) {
      merged[key] = remoteVal
      return
    }
    if (remoteVal === undefined) {
      merged[key] = localVal
      return
    }

    if (key === 'trips') {
      merged[key] = mergeTrips(localVal, remoteVal)
    } else if (key === 'regions') {
      merged[key] = mergeRegions(localVal, remoteVal)
    } else if (key.startsWith('catalog-')) {
      merged[key] = mergeCatalogs(localVal, remoteVal)
    } else {
      merged[key] = remoteVal !== null ? remoteVal : localVal
    }
  })

  return merged
}

function mergeTrips(localTrips, remoteTrips) {
  var lTrips = Array.isArray(localTrips) ? localTrips : []
  var rTrips = Array.isArray(remoteTrips) ? remoteTrips : []
  var tripMap = new Map()

  lTrips.forEach((t) => {
    if (t && t.id) tripMap.set(t.id, JSON.parse(JSON.stringify(t)))
  })

  rTrips.forEach((remoteT) => {
    if (!remoteT || !remoteT.id) return
    if (!tripMap.has(remoteT.id)) {
      tripMap.set(remoteT.id, JSON.parse(JSON.stringify(remoteT)))
      return
    }

    var localT = tripMap.get(remoteT.id)

    // ادغام مقاصد روزانه (Destinations)
    var destMap = new Map()
    ;(localT.destinations || []).forEach((d) => destMap.set(d.id, d))
    ;(remoteT.destinations || []).forEach((d) => destMap.set(d.id, d))

    // ادغام اقامتگاه‌ها (Accommodations)
    var accomMap = new Map()
    ;(localT.accommodations || []).forEach((a) => accomMap.set(a.day, a))
    ;(remoteT.accommodations || []).forEach((a) => accomMap.set(a.day, a))

    // ادغام رویدادها (Events)
    var eventMap = new Map()
    ;(localT.events || []).forEach((e) => eventMap.set(e.id, e))
    ;(remoteT.events || []).forEach((e) => eventMap.set(e.id, e))

    tripMap.set(remoteT.id, {
      ...localT,
      title: remoteT.title || localT.title,
      description: remoteT.description || localT.description,
      startDateJalali: remoteT.startDateJalali || localT.startDateJalali,
      durationDays: Math.max(Number(localT.durationDays) || 1, Number(remoteT.durationDays) || 1),
      budget: Math.max(Number(localT.budget) || 0, Number(remoteT.budget) || 0),
      status: remoteT.status || localT.status,
      destinations: Array.from(destMap.values()),
      accommodations: Array.from(accomMap.values()),
      events: Array.from(eventMap.values()),
      vehicleIds: Array.from(new Set([...(localT.vehicleIds || []), ...(remoteT.vehicleIds || [])])),
      companionIds: Array.from(new Set([...(localT.companionIds || []), ...(remoteT.companionIds || [])])),
      documentIds: Array.from(new Set([...(localT.documentIds || []), ...(remoteT.documentIds || [])])),
      equipmentIds: Array.from(new Set([...(localT.equipmentIds || []), ...(remoteT.equipmentIds || [])]))
    })
  })

  return Array.from(tripMap.values())
}

function mergeRegions(localRegions, remoteRegions) {
  var lRegs = Array.isArray(localRegions) ? localRegions : []
  var rRegs = Array.isArray(remoteRegions) ? remoteRegions : []
  var regMap = new Map()

  lRegs.forEach((r) => {
    if (r && r.id) regMap.set(r.id, JSON.parse(JSON.stringify(r)))
  })

  rRegs.forEach((remoteR) => {
    if (!remoteR || !remoteR.id) return
    if (!regMap.has(remoteR.id)) {
      regMap.set(remoteR.id, JSON.parse(JSON.stringify(remoteR)))
      return
    }

    var localR = regMap.get(remoteR.id)

    // ادغام شهرها و لوکیشن‌ها
    var cityMap = new Map()
    ;(localR.cities || []).forEach((c) => cityMap.set(c.id, JSON.parse(JSON.stringify(c))))
    ;(remoteR.cities || []).forEach((remoteC) => {
      if (!cityMap.has(remoteC.id)) {
        cityMap.set(remoteC.id, JSON.parse(JSON.stringify(remoteC)))
        return
      }
      var localC = cityMap.get(remoteC.id)
      var locMap = new Map()
      ;(localC.locations || []).forEach((loc) => locMap.set(loc.id, JSON.parse(JSON.stringify(loc))))
      ;(remoteC.locations || []).forEach((remoteLoc) => {
        if (!locMap.has(remoteLoc.id)) {
          locMap.set(remoteLoc.id, JSON.parse(JSON.stringify(remoteLoc)))
        } else {
          var localLoc = locMap.get(remoteLoc.id)
          locMap.set(remoteLoc.id, {
            ...localLoc,
            name: remoteLoc.name || localLoc.name,
            isVisited: Boolean(localLoc.isVisited || remoteLoc.isVisited),
            visitRecordId: localLoc.visitRecordId || remoteLoc.visitRecordId,
            tags: Array.from(new Set([...(localLoc.tags || []), ...(remoteLoc.tags || [])]))
          })
        }
      })
      cityMap.set(remoteC.id, {
        ...localC,
        name: remoteC.name || localC.name,
        locations: Array.from(locMap.values())
      })
    })

    // ادغام سوابق بازدید (Visit Records)
    var recordMap = new Map()
    ;(localR.visitRecords || []).forEach((v) => recordMap.set(v.id, v))
    ;(remoteR.visitRecords || []).forEach((v) => recordMap.set(v.id, v))

    regMap.set(remoteR.id, {
      ...localR,
      isEnabled: Boolean(localR.isEnabled || remoteR.isEnabled),
      cities: Array.from(cityMap.values()),
      visitRecords: Array.from(recordMap.values())
    })
  })

  return Array.from(regMap.values())
}

function mergeCatalogs(localItems, remoteItems) {
  var lList = Array.isArray(localItems) ? localItems : []
  var rList = Array.isArray(remoteItems) ? remoteItems : []
  var map = new Map()

  lList.forEach((it) => {
    if (it && (it.id || it.name)) map.set(it.id || it.name, it)
  })
  rList.forEach((it) => {
    if (it && (it.id || it.name)) map.set(it.id || it.name, it)
  })

  return Array.from(map.values())
}
