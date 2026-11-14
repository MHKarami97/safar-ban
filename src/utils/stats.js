export class Stats {
  static sum(values) {
    var total = 0;
    for (var i = 0; i < values.length; i++) {
      total += values[i];
    }
    return total;
  }

  static mean(values) {
    return values.length > 0 ? Stats.sum(values) / values.length : 0;
  }

  static median(values) {
    if (values.length === 0) {
      return 0;
    }
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var middle = sorted.length >> 1;
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  static maxBy(items, selector) {
    var best = null;
    var bestValue = -Infinity;
    for (var i = 0; i < items.length; i++) {
      var value = selector(items[i]);
      if (value > bestValue) {
        bestValue = value;
        best = items[i];
      }
    }
    return best;
  }

  static minBy(items, selector) {
    return Stats.maxBy(items, function (item) { return -selector(item); });
  }

  static groupBy(items, keySelector) {
    var groups = new Map();
    for (var i = 0; i < items.length; i++) {
      var key = keySelector(items[i]);
      var bucket = groups.get(key);
      if (bucket) {
        bucket.push(items[i]);
      } else {
        groups.set(key, [items[i]]);
      }
    }
    return groups;
  }

  static countBy(values) {
    var counts = new Map();
    for (var i = 0; i < values.length; i++) {
      counts.set(values[i], (counts.get(values[i]) || 0) + 1);
    }
    return counts;
  }

  static topEntries(counts, limit) {
    return Array.from(counts.entries())
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, limit)
      .map(function (entry) { return { name: entry[0], count: entry[1] }; });
  }
}
