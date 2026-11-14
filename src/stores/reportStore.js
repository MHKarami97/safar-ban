import { defineStore } from 'pinia';
import { reportService } from '../services/report/ReportService.js';
import { REPORT_SOURCES } from '../services/report/TravelRecordCollector.js';
import { useTripStore } from './tripStore';
import { useRegionStore } from './regionStore';
import { useCatalogStore } from './catalogStore';
import { todayJalali } from '../utils/jalali.js';

export var useReportStore = defineStore('report', {
  state: function () {
    return {
      source: REPORT_SOURCES.ALL,
      includePlanned: false,
      selectedYear: null
    };
  },

  getters: {
    report: function (state) {
      return reportService.build({
        trips: useTripStore().trips,
        regions: useRegionStore().regions,
        catalog: useCatalogStore(),
        source: state.source,
        includePlanned: state.includePlanned,
        today: todayJalali()
      });
    },

    years: function () {
      return this.report.yearly.years.map(function (y) { return y.year; });
    },

    activeYear: function (state) {
      var years = this.years;
      if (years.length === 0) {
        return null;
      }
      return years.indexOf(state.selectedYear) >= 0 ? state.selectedYear : years[years.length - 1];
    },

    activeYearSummary: function () {
      var year = this.activeYear;
      return this.report.yearly.years.find(function (y) { return y.year === year; }) || null;
    }
  },

  actions: {
    setSource: function (source) {
      this.source = source;
    },

    setIncludePlanned: function (value) {
      this.includePlanned = Boolean(value);
    },

    selectYear: function (year) {
      this.selectedYear = year;
    }
  }
});
