export default function useGeolocation() {
	const isLoading = ref(false)
	const error = ref('')

	const getElevationFromCoords = async (lat, lon) => {
		try {
			// Using Open-Elevation API (free, no auth required)
			const response = await fetch(
				`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
			)

			if (!response.ok) {
				throw new Error('Elevation API failed')
			}

			const data = await response.json()
			return data.results[0]?.elevation || null
		} catch (err) {
			console.warn('Could not fetch elevation:', err)
			return null
		}
	}

	const getCurrentLocation = async () => {
		if (!navigator.geolocation) {
			error.value = 'Geolocation is not supported by your browser'
			return null
		}

		error.value = ''
		isLoading.value = true

		try {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true
				})
			})

			const lat = position.coords.latitude.toFixed(6)
			const lon = position.coords.longitude.toFixed(6)

			// Try to get elevation from browser first, fall back to API
			let elevation = position.coords.altitude !== null
				? position.coords.altitude.toFixed(2)
				: null

			// If browser doesn't provide elevation, fetch it from API
			if (elevation === null) {
				const apiElevation = await getElevationFromCoords(lat, lon)
				elevation = apiElevation !== null ? apiElevation.toFixed(2) : ''
			}

			return {
				latitude: lat,
				longitude: lon,
				elevation: elevation
			}
		} catch (err) {
			if (err.code === 1) {
				error.value = 'Location access denied. Please enable location permissions.'
			} else if (err.code === 2) {
				error.value = 'Location unavailable. Please try again.'
			} else if (err.code === 3) {
				error.value = 'Location request timeout. Please try again.'
			} else {
				error.value = 'An error occurred while getting your location.'
			}
			return null
		} finally {
			isLoading.value = false
		}
	}

	return {
		isLoading,
		error,
		getCurrentLocation
	}
}
