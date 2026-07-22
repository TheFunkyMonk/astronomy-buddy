<template>
	<div class="container">
		<h1>Astronomy Buddy</h1>

		<div v-if="viewingData && !showForm" class="current-params">
			<p class="current-location">📍 {{ locationLabel }}</p>
			<p class="current-details">{{ paramsSummary }}</p>
			<button class="toggle-form-btn" @click="showForm = true">
				Change Location or Parameters
			</button>
		</div>

		<LocationForm
			v-show="showForm || !viewingData"
			:is-fetching="isFetching"
			:initial="savedParams"
			@submit="handleFormSubmit"
		/>

		<ViewingDataResults :data="viewingData" />
	</div>
</template>

<script setup>
	import useAstronomyAPI from '../composables/useAstronomyAPI'
	import useSavedParams from '../composables/useSavedParams'

	const { viewingData, isFetching, fetchViewingData } = useAstronomyAPI()
	const { load, save } = useSavedParams()

	const showForm = ref(true)
	const savedParams = ref(null)
	const savedLocationName = ref('')

	const VIEWING_LEVEL_LABELS = {
		'naked-eye': 'Naked eye',
		entry: 'Entry-level telescope',
		intermediate: 'Intermediate telescope',
		advanced: 'Advanced telescope'
	}

	const handleFormSubmit = (formData) => {
		// Keep a plain copy (strip any reactivity) and persist it
		const params = { ...formData }
		savedParams.value = params
		save(params)

		fetchViewingData(params)
		showForm.value = false
	}

	// On the client, restore the last-used params and fetch immediately so a
	// returning visitor sees results without re-entering anything.
	onMounted(() => {
		const stored = load()
		if (stored) {
			savedParams.value = stored
			savedLocationName.value = stored.locationName || ''
			fetchViewingData(stored)
			showForm.value = false
		}
	})

	watch(viewingData, (newData) => {
		if (!newData) return

		// Scroll to top when viewing data is loaded
		window.scrollTo({ top: 0, behavior: 'smooth' })

		// Capture the API-resolved friendly location name and persist it so it
		// shows instantly on the next visit (before the fresh fetch resolves).
		const name = newData.location?.name
		if (name && name !== 'Unknown Location' && savedParams.value) {
			savedLocationName.value = name
			if (savedParams.value.locationName !== name) {
				const updated = { ...savedParams.value, locationName: name }
				savedParams.value = updated
				save(updated)
			}
		}
	})

	const formatHour12 = (hour) => {
		const h = ((hour % 24) + 24) % 24
		const period = h >= 12 ? 'PM' : 'AM'
		const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h)
		return `${h12} ${period}`
	}

	const locationLabel = computed(() => {
		const apiName = viewingData.value?.location?.name
		if (apiName && apiName !== 'Unknown Location') return apiName
		if (savedLocationName.value) return savedLocationName.value

		const p = savedParams.value
		if (p?.latitude && p?.longitude) {
			return `${Number(p.latitude).toFixed(2)}, ${Number(p.longitude).toFixed(2)}`
		}

		return 'Your location'
	})

	const paramsSummary = computed(() => {
		const p = savedParams.value
		if (!p) return ''

		const level = VIEWING_LEVEL_LABELS[p.viewingLevel] || p.viewingLevel
		const start = formatHour12(p.eveningStartHour)
		const end = formatHour12(p.eveningEndHour)

		return `${level} · ${start} – ${end}`
	})
</script>

<style>
	body {
		background: #212121;
		margin: 0;
		padding: 0;
	}
</style>

<style scoped>
	.container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		min-height: 100vh;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
		color: #e8e8e8;
	}

	.current-params {
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.current-location {
		margin: 0 0 0.25rem 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: #e8e8e8;
	}

	.current-details {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		color: #999;
	}

	.toggle-form-btn {
		width: 100%;
		padding: 0.75rem;
		background: #3a3a3a;
		color: #e8e8e8;
		border: 1px solid #4a4a4a;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
	}

	.toggle-form-btn:hover {
		background: #444;
	}
</style>
