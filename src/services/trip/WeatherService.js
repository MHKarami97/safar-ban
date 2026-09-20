/**
 * Thin wrapper around Open-Meteo's free, key-less geocoding + forecast APIs.
 * Failures are swallowed and surfaced as `null` so the UI shows a graceful fallback.
 */
export class WeatherService {
  static async fetchForecast(cityName) {
    try {
      var geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=fa`)
      var geoJson = await geoRes.json()
      var place = geoJson?.results?.[0]
      if (!place) return null

      var forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`
      )
      var forecastJson = await forecastRes.json()

      return {
        resolvedName: place.name,
        fetchedAt: Date.now(),
        daily: (forecastJson?.daily?.time || []).map((date, i) => ({
          date, max: forecastJson.daily.temperature_2m_max[i], min: forecastJson.daily.temperature_2m_min[i], rainChance: forecastJson.daily.precipitation_probability_max[i]
        }))
      }
    } catch (error) {
      console.error('WeatherService.fetchForecast failed', error)
      return null
    }
  }
}
