import { TRIP_STATUSES } from '../../models/trip/TripPlan'
import { jalaliDateToLabel } from '../../utils/jalali'

export class TripPrintService {
  static print(trip, catalogLookup) {
    var win = window.open('', '_blank')
    if (!win) return
    win.document.write(this._buildHtml(trip, catalogLookup))
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

  static _chips(ids, list) {
    var items = ids.map((id) => list.find((item) => item.id === id)?.name).filter(Boolean)
    if (!items.length) return '<span class="empty">ثبت نشده</span>'
    return `<div class="chip-list">${items.map((name) => `<span class="chip">${name}</span>`).join('')}</div>`
  }

  static _destinationName(trip, id) {
    return trip.destinations.find((d) => d.id === id)?.name || id
  }

  static _weatherSection(trip) {
    if (trip.weatherSnapshot) {
      var cards = trip.weatherSnapshot.daily
        .map((day) => `
          <div class="weather-card">
            <div class="weather-date">${day.date.slice(5)}</div>
            <div class="weather-temp"><b>${Math.round(day.max)}°</b> / ${Math.round(day.min)}°</div>
            <div class="weather-rain">☂ ${day.rainChance}٪</div>
          </div>`)
        .join('')
      var cityLabel = trip.weatherSnapshot.resolvedName || trip.weatherCity
      return `
        <section class="block">
          <h2>پیش‌بینی آب‌وهوا — ${cityLabel}</h2>
          <div class="weather-row">${cards}</div>
        </section>`
    }
    if (trip.weatherCity) {
      return `
        <section class="block">
          <h2>پیش‌بینی آب‌وهوا</h2>
          <p class="empty">پیش‌بینی آب‌وهوا برای «${trip.weatherCity}» ثبت نشده بود.</p>
        </section>`
    }
    return ''
  }

  static _dayCard(trip, day) {
    var destinations = trip.destinationsForDay(day)
    var stay = trip.accommodationForDay(day)

    var timelineHtml = destinations.length
      ? destinations
          .map((d) => `
            <li class="timeline-item">
              <div class="timeline-time">${d.startTime}<span class="timeline-sep">–</span>${d.endTime}</div>
              <div class="timeline-body">
                <p class="timeline-name">${d.name}</p>
                ${d.note ? `<p class="timeline-note">${d.note}</p>` : ''}
              </div>
            </li>`)
          .join('')
      : '<li class="timeline-item empty-item">مقصدی برای این روز ثبت نشده</li>'

    var stayHtml = stay
      ? `
        <div class="stay-box">
          <span class="stay-label">اقامتگاه</span>
          <p class="stay-name">${stay.name}</p>
          <p class="stay-meta">${stay.address} · ${stay.phone}</p>
        </div>`
      : ''

    return `
      <div class="day-card">
        <div class="day-header"><span class="day-badge">روز ${day}</span></div>
        <ul class="timeline">${timelineHtml}</ul>
        ${stayHtml}
      </div>`
  }

  static _eventCard(trip, e) {
    var visited = e.visitedDestinationIds?.length
      ? `<p class="event-line ok">رفتیم به: ${e.visitedDestinationIds.map((id) => this._destinationName(trip, id)).join('، ')}</p>`
      : ''
    var missed = e.missedDestinationIds?.length
      ? `<p class="event-line bad">نرسیدیم به: ${e.missedDestinationIds.map((id) => this._destinationName(trip, id)).join('، ')}</p>`
      : ''
    var locationNotes = e.locationNotes ? `<p class="event-line">وضعیت لوکیشن‌ها: ${e.locationNotes}</p>` : ''
    var accommodationNotes = e.accommodationNotes ? `<p class="event-line">وضعیت اقامتگاه: ${e.accommodationNotes}</p>` : ''
    var description = e.description ? `<p class="event-line muted">${e.description}</p>` : ''

    return `
      <div class="event-card">
        <div class="event-head">
          <span class="event-date">${jalaliDateToLabel(e.dateJalali)}</span>
          <span class="event-cost">${e.cost.toLocaleString('fa-IR')} تومان</span>
        </div>
        <p class="event-line muted">وسیله: ${e.vehicleUsed || '—'}</p>
        ${visited}${missed}${locationNotes}${accommodationNotes}${description}
      </div>`
  }

  static _buildHtml(trip, catalog) {
    var dayBlocks = []
    for (var day = 1; day <= trip.durationDays; day += 1) {
      dayBlocks.push(this._dayCard(trip, day))
    }

    var eventsHtml = trip.events.length
      ? trip.events.map((e) => this._eventCard(trip, e)).join('')
      : '<p class="empty">رویدادی ثبت نشده</p>'

    return `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${trip.title} | سفربان</title>
        <style>
          :root {
            --brand: #0e5f38;
            --brand-light: #eefbf3;
            --brand-mid: #127a48;
            --ink: #1e293b;
            --muted: #64748b;
            --faint: #94a3b8;
            --line: #e2e8f0;
          }
          html, body { margin: 0; }
          body {
            font-family: 'Vazirmatn', system-ui, sans-serif;
            color: var(--ink);
            direction: rtl;
            padding: 30px 34px;
            font-size: 13px;
            line-height: 1.55;
          }
          .print-table { width: 100%; border-collapse: collapse; }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid var(--brand);
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .header h1 { color: var(--brand); margin: 0 0 4px; font-size: 22px; }
          .header .subtitle { color: var(--muted); margin: 0; font-size: 12.5px; }
          .status-pill {
            background: var(--brand-light);
            color: var(--brand);
            border: 1px solid var(--brand);
            border-radius: 999px;
            padding: 5px 14px;
            font-size: 11.5px;
            font-weight: 600;
            white-space: nowrap;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px 20px;
            margin-bottom: 20px;
          }
          .meta-item {
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 8px 12px;
            background: #f8fafc;
          }
          .meta-item .label { display: block; color: var(--faint); font-size: 10.5px; margin-bottom: 2px; }
          .meta-item .value { font-weight: 600; }

          h2 {
            color: var(--brand);
            font-size: 14px;
            border-bottom: 2px solid var(--brand);
            padding-bottom: 5px;
            margin: 22px 0 12px;
          }
          .block { margin-bottom: 4px; }

          .catalog-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 6px;
          }
          .catalog-card {
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 10px 12px;
          }
          .catalog-card .cat-title { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
          .chip-list { display: flex; flex-wrap: wrap; gap: 6px; }
          .chip {
            display: inline-block;
            border: 1px solid var(--brand-mid);
            color: var(--brand-mid);
            background: var(--brand-light);
            border-radius: 999px;
            padding: 3px 10px;
            font-size: 11px;
          }
          .empty { color: var(--faint); font-size: 11.5px; }

          .weather-row { display: flex; gap: 8px; flex-wrap: wrap; }
          .weather-card {
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 8px 10px;
            text-align: center;
            min-width: 64px;
            background: #f8fafc;
          }
          .weather-date { font-size: 10.5px; color: var(--muted); margin-bottom: 3px; }
          .weather-temp { font-size: 12.5px; }
          .weather-rain { font-size: 10px; color: var(--faint); margin-top: 2px; }

          .day-card {
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 12px 14px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .day-header { margin-bottom: 8px; }
          .day-badge {
            display: inline-block;
            background: var(--brand);
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            border-radius: 999px;
            padding: 3px 12px;
          }
          .timeline { list-style: none; margin: 0; padding: 0; }
          .timeline-item {
            display: flex;
            gap: 12px;
            padding: 6px 0;
            border-bottom: 1px dashed var(--line);
          }
          .timeline-item:last-child { border-bottom: none; }
          .timeline-item.empty-item { color: var(--faint); font-size: 11.5px; border-bottom: none; }
          .timeline-time {
            flex-shrink: 0;
            min-width: 78px;
            font-size: 11px;
            font-weight: 700;
            color: var(--brand-mid);
            direction: ltr;
            text-align: center;
          }
          .timeline-sep { margin: 0 3px; color: var(--faint); }
          .timeline-name { margin: 0; font-weight: 600; font-size: 12.5px; }
          .timeline-note { margin: 2px 0 0; font-size: 11px; color: var(--faint); }
          .stay-box {
            margin-top: 10px;
            background: var(--brand-light);
            border-radius: 10px;
            padding: 8px 12px;
          }
          .stay-label { font-size: 10px; color: var(--brand-mid); font-weight: 700; }
          .stay-name { margin: 2px 0 0; font-weight: 600; font-size: 12px; }
          .stay-meta { margin: 2px 0 0; font-size: 10.5px; color: var(--muted); }

          .event-card {
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 10px 12px;
            margin-bottom: 8px;
            page-break-inside: avoid;
          }
          .event-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .event-date { font-weight: 700; font-size: 12px; }
          .event-cost { font-weight: 700; font-size: 12px; color: var(--brand-mid); }
          .event-line { margin: 2px 0; font-size: 11.5px; }
          .event-line.ok { color: var(--brand-mid); }
          .event-line.bad { color: #b91c1c; }
          .event-line.muted { color: var(--muted); }

          .cultural-list { margin: 0; padding-right: 18px; font-size: 12px; }

          .print-footer {
            text-align: left;
            direction: ltr;
            font-size: 10.5px;
            color: var(--faint);
            padding-top: 10px;
            border-top: 1px solid var(--line);
            margin-top: 6px;
          }

          @media print {
            body { padding: 14px 18px; }
            .day-card, .event-card, .catalog-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <table class="print-table">
          <tfoot>
            <tr><td><div class="print-footer">safar.mhkarami97.ir</div></td></tr>
          </tfoot>
          <tbody>
            <tr>
              <td>
                <div class="header">
                  <div>
                    <h1>${trip.title}</h1>
                    <p class="subtitle">${trip.description || ''}</p>
                  </div>
                  <span class="status-pill">${TRIP_STATUSES[trip.status]}</span>
                </div>

                <div class="meta-grid">
                  <div class="meta-item"><span class="label">تاریخ شروع</span><span class="value">${jalaliDateToLabel(trip.startDateJalali)}</span></div>
                  <div class="meta-item"><span class="label">تاریخ پایان</span><span class="value">${jalaliDateToLabel(trip.endDateJalali)}</span></div>
                  <div class="meta-item"><span class="label">تعداد روز</span><span class="value">${trip.durationDays}</span></div>
                  <div class="meta-item"><span class="label">هزینه در نظر گرفته‌شده</span><span class="value">${Number(trip.budget).toLocaleString('fa-IR')} تومان</span></div>
                </div>

                <section class="block">
                  <h2>وسایل نقلیه، همسفران، مدارک و تجهیزات</h2>
                  <div class="catalog-grid">
                    <div class="catalog-card"><div class="cat-title">وسایل نقلیه</div>${this._chips(trip.vehicleIds, catalog.vehicles)}</div>
                    <div class="catalog-card"><div class="cat-title">همسفران</div>${this._chips(trip.companionIds, catalog.companions)}</div>
                    <div class="catalog-card"><div class="cat-title">مدارک لازم</div>${this._chips(trip.documentIds, catalog.documents)}</div>
                    <div class="catalog-card"><div class="cat-title">تجهیزات</div>${this._chips(trip.equipmentIds, catalog.equipment)}</div>
                  </div>
                </section>

                ${this._weatherSection(trip)}

                ${trip.culturalNotes.length ? `
                <section class="block">
                  <h2>نکات فرهنگی</h2>
                  <ul class="cultural-list">${trip.culturalNotes.map((n) => `<li>${n}</li>`).join('')}</ul>
                </section>` : ''}

                <section class="block">
                  <h2>برنامه روزانه و اقامتگاه</h2>
                  ${dayBlocks.join('')}
                </section>

                <section class="block">
                  <h2>گزارش رویدادها</h2>
                  ${eventsHtml}
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `
  }
}