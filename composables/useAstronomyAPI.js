export default function useAstronomyAPI() {
	const viewingData = ref(null)
	const isFetching = ref(false)
	const error = ref('')

	const fetchViewingData = async (params) => {
		error.value = ''
		viewingData.value = null
		isFetching.value = true

		try {
			const queryParams = new URLSearchParams({
				latitude: params.latitude,
				longitude: params.longitude,
				elevation: params.elevation,
				viewingLevel: params.viewingLevel,
				eveningStartHour: params.eveningStartHour.toString(),
				eveningEndHour: params.eveningEndHour.toString()
			})

			const response = await fetch(`https://rjlacount.dev/astronomy-buddy/viewing-data?${queryParams}`)

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status} ${response.statusText}`)
			}

			viewingData.value = await response.json()
		} catch (err) {
			error.value = `Failed to fetch viewing data: ${err.message}`
		} finally {
			isFetching.value = false
		}
	}

	return {
		viewingData,
		isFetching,
		error,
		fetchViewingData
	}
}
