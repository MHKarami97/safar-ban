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

  static _names(ids, list) {
    return ids.map((id) => list.find((item) => item.id === id)?.name).filter(Boolean).join('، ') || '—'
  }

  static _buildHtml(trip, catalog) {
    var dayBlocks = []
    for (var day = 1; day <= trip.durationDays; day += 1) {
      var stay = trip.accommodationForDay(day)
      var destinationsHtml = trip
        .destinationsForDay(day)
        .map((d) => `<li><b>${d.startTime} - ${d.endTime}</b> — ${d.name}${d.note ? ` <span class="muted">(${d.note})</span>` : ''}</li>`)
        .join('') || '<li class="muted">مقصدی ثبت نشده</li>'

      dayBlocks.push(`
        <section class="day">
          <h3>روز ${day}</h3>
          <ul>${destinationsHtml}</ul>
          ${stay ? `<p class="stay"><b>اقامتگاه:</b> ${stay.name} — ${stay.address} — ${stay.phone}</p>` : ''}
        </section>
      `)
    }

    var eventsHtml = trip.events
      .map((e) => `
        <div class="event">
          <p><b>${jalaliDateToLabel(e.dateJalali)}</b> — هزینه: ${e.cost.toLocaleString('fa-IR')} تومان — وسیله: ${e.vehicleUsed || '—'}</p>
          <p class="muted">${e.description || ''}</p>
        </div>`)
      .join('') || '<p class="muted">رویدادی ثبت نشده</p>'

    return `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${trip.title} | سفربان</title>
        <style>
          html, body {
            margin: 0;
          }
          body {
            font-family: 'Vazirmatn', system-ui, sans-serif;
            color: #1e293b;
            direction: rtl;
            padding: 32px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          h1 { color: #0e5f38; margin-bottom: 4px; }
          .subtitle { color: #64748b; margin-bottom: 24px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; }
          .meta-grid div { border-bottom: 1px solid #e2e8f0; padding: 6px 0; }
          h2 { color: #0e5f38; border-bottom: 2px solid #0e5f38; padding-bottom: 4px; margin-top: 28px; }
          .day { margin-bottom: 14px; }
          .day h3 { margin: 0 0 6px; color: #127a48; }
          ul { margin: 0; padding-right: 20px; }
          .muted { color: #94a3b8; font-size: 0.9em; }
          .stay { background: #eefbf3; padding: 8px; border-radius: 8px; }
          .event { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
          .print-footer {
            text-align: left;
            direction: ltr;
            font-size: 0.75em;
            color: #94a3b8;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
          }
          @media print {
            body { padding: 16px; }
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
                <h1>${trip.title}</h1>
                <p class="subtitle">${trip.description || ''}</p>
                <div class="meta-grid">
                  <div>تاریخ شروع: ${jalaliDateToLabel(trip.startDateJalali)}</div>
                  <div>تاریخ پایان: ${jalaliDateToLabel(trip.endDateJalali)}</div>
                  <div>تعداد روز: ${trip.durationDays}</div>
                  <div>هزینه در نظر گرفته‌شده: ${Number(trip.budget).toLocaleString('fa-IR')} تومان</div>
                  <div>وضعیت: ${TRIP_STATUSES[trip.status]}</div>
                  <div>وسایل نقلیه: ${this._names(trip.vehicleIds, catalog.vehicles)}</div>
                  <div>همسفران: ${this._names(trip.companionIds, catalog.companions)}</div>
                  <div>مدارک لازم: ${this._names(trip.documentIds, catalog.documents)}</div>
                  <div>تجهیزات: ${this._names(trip.equipmentIds, catalog.equipment)}</div>
                </div>

                ${trip.culturalNotes.length ? `<h2>نکات فرهنگی</h2><ul>${trip.culturalNotes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}

                <h2>برنامه روزانه و اقامتگاه</h2>
                ${dayBlocks.join('')}

                <h2>گزارش رویدادها</h2>
                ${eventsHtml}
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `
  }
}