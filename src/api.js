const API_BASE_URL = 'https://api-ugi2pflmha-ew.a.run.app'

export async function getCityInfo(cityId, apiKey) {
  const response = await fetch(`${API_BASE_URL}/cities/${cityId}/insights?apiKey=${apiKey}`)
  if (response.status === 404) {
    throw new Error('City not found')
  }
  if (!response.ok) {
    throw new Error('Failed to fetch city info')
  }
  return response.json()
}

export async function getWeatherPredictions(cityId, apiKey) {
  const response = await fetch(`${API_BASE_URL}/weather-predictions?cityId=${cityId}&apiKey=${apiKey}`)
  if (!response.ok) {
    throw new Error('Failed to fetch weather predictions')
  }
  const data = await response.json()
  return data[0]?.predictions || []
}
