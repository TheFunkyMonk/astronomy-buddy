<template>
	<div class="starfield" aria-hidden="true">
		<NuxtImg
			src="/stars.jpg"
			alt=""
			class="starfield__img"
			loading="lazy"
			format="webp"
			quality="80"
		/>
	</div>

	<div class="container">
		<h1>Astronomy Buddy</h1>

		<div v-if="savedParams && !showForm" class="current-params">
			<p class="current-location">📍 {{ locationLabel }}</p>
			<p class="current-details">{{ paramsSummary }}</p>
			<button class="toggle-form-btn" :disabled="isFetching" @click="showForm = true">
				Change Location or Parameters
			</button>
		</div>

		<LocationForm
			v-show="showForm || !savedParams"
			:is-fetching="isFetching"
			:initial="savedParams"
			@submit="handleFormSubmit"
		/>

		<div v-if="isFetching" class="loading-indicator">
			<span class="spinner" />
			<span>Checking tonight's sky…</span>
		</div>

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
	:root {
		/* Shared "liquid glass" tokens used across components */
		--glass-bg: rgba(18, 18, 28, 0.12);
		--glass-bg-strong: rgba(18, 18, 28, 0.22);
		--glass-bg-light: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.14);
		--glass-blur: blur(8px) saturate(150%);
		--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	body {
		/* Dark base shown behind the starfield while it lazy-loads */
		background: #06060c;
		margin: 0;
		padding: 0;
	}

	/* Full-viewport starfield background */
	.starfield {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
	}

	.starfield__img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Subtle vignette so foreground text keeps contrast without hiding the stars */
	.starfield::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at 50% 30%, rgba(6, 6, 12, 0) 0%, rgba(6, 6, 12, 0.45) 100%),
			linear-gradient(180deg, rgba(6, 6, 12, 0.15) 0%, rgba(6, 6, 12, 0.3) 100%);
		pointer-events: none;
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
		font-family: 'Cause', sans-serif;
		font-weight: 700;
		font-size: 2.75rem;
		letter-spacing: 0.02em;
		color: #f4f4f8;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
	}

	.current-params {
		margin-bottom: 1.5rem;
		padding: 1.25rem;
		text-align: center;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		box-shadow: var(--glass-shadow);
	}

	.current-location {
		margin: 0 0 0.25rem 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: #f4f4f8;
	}

	.current-details {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		color: #b8b8c4;
	}

	.toggle-form-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--glass-bg-light);
		color: #f4f4f8;
		border: 1px solid var(--glass-border);
		border-radius: 10px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.toggle-form-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.toggle-form-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.12);
	}

	.loading-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin: 0 auto 1.5rem;
		padding: 1rem 1.5rem;
		width: fit-content;
		color: #e8e8ee;
		font-size: 1rem;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--glass-border);
		border-radius: 999px;
		box-shadow: var(--glass-shadow);
	}

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid rgba(255, 255, 255, 0.25);
		border-top-color: #7aa2ff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
