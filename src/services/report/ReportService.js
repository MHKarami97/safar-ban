import { TravelRecordCollector } from './TravelRecordCollector.js';
import { OverviewAnalyzer } from './analyzers/OverviewAnalyzer.js';
import { GapAnalyzer } from './analyzers/GapAnalyzer.js';
import { YearlyAnalyzer } from './analyzers/YearlyAnalyzer.js';
import { DurationAnalyzer } from './analyzers/DurationAnalyzer.js';
import { SeasonalAnalyzer } from './analyzers/SeasonalAnalyzer.js';
import { CostAnalyzer } from './analyzers/CostAnalyzer.js';
import { RegionAnalyzer } from './analyzers/RegionAnalyzer.js';
import { TripInsightsAnalyzer } from './analyzers/TripInsightsAnalyzer.js';
import { jalaliToDayNumber } from '../../utils/jalaliStats.js';

function createDefaultAnalyzers() {
  return [
    new OverviewAnalyzer(),
    new GapAnalyzer(),
    new YearlyAnalyzer(),
    new DurationAnalyzer(),
    new SeasonalAnalyzer(),
    new CostAnalyzer(),
    new RegionAnalyzer(),
    new TripInsightsAnalyzer()
  ];
}

export class ReportService {
  constructor(analyzers) {
    this.analyzers = analyzers || createDefaultAnalyzers();
  }

  build(input) {
    var records = TravelRecordCollector.collect(input);
    var context = {
      records: records,
      regions: input.regions || [],
      catalog: input.catalog,
      today: input.today,
      todayDay: jalaliToDayNumber(input.today.jy, input.today.jm, input.today.jd)
    };

    var report = {};
    this.analyzers.forEach(function (analyzer) {
      report[analyzer.id] = analyzer.analyze(context);
    });
    return report;
  }
}

export var reportService = new ReportService();
