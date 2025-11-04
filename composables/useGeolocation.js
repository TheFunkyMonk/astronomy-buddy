export default function useGeolocation() {
	const isLoading = ref(false)
	const error = ref('')

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

			return {
				latitude: position.coords.latitude.toFixed(6),
				longitude: position.coords.longitude.toFixed(6),
				elevation: position.coords.altitude !== null ? position.coords.altitude.toFixed(2) : ''
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
