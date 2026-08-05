<template>
	<Transition name="fade">
		<div v-if="data" class="results">
			<!-- Weather Assessment -->
			<div class="weather-card" :class="weatherClass">
				<h2>{{ weatherEmoji }} {{ weatherTitle }}</h2>
				<p class="weather-verdict">{{ weatherVerdict }}</p>
				<div class="weather-details">
					<p v-if="clearSummary" class="clear-summary">{{ clearSummary }}</p>
					<p v-if="data.weather.reasons?.length"><strong>Conditions:</strong> {{ data.weather.reasons.join(', ') }}</p>

					<!-- What the aerosols cost you optically, kept separate from
					     whether the air is healthy to stand around in. -->
					<p v-if="aerosolImpact" class="air-notice air-notice--optical">
						<span aria-hidden="true">🌫️</span> {{ aerosolImpact }}
					</p>
					<p v-if="healthAdvisory" class="air-notice air-notice--health">
						<span aria-hidden="true">⚠️</span> {{ healthAdvisory }}
					</p>

					<div class="weather-stats">
						<span>Cloud Cover: {{ cloudCoverPct }}</span>
						<span>Seeing: {{ capitalize(data.weather.seeingText) }}</span>
						<span>Transparency: {{ capitalize(data.weather.transparencyText) }}</span>
						<span v-if="airQuality?.usAqi != null">Air: AQI {{ airQuality.usAqi }}</span>
					</div>
				</div>
			</div>

			<!--
				Viewing Windows (for partial conditions). Hidden when smoke is the
				limiting factor: the sky can be cloudless all night while only the
				part overhead is usable, so a "clear window" spanning the whole night
				reads as good news when it is not.
			-->
			<div v-if="data.weather.viewingWindows?.length && !smokeDominates" class="viewing-windows">
				<h3>⏰ Clear Viewing Windows</h3>
				<p class="windows-intro">Take advantage of these clear periods for the best stargazing:</p>

				<div class="window-cards">
					<div
						v-for="(window, index) in data.weather.viewingWindows"
						:key="index"
						class="window-card"
						:class="{ 'best-window': isBestWindow(window) }"
					>
						<div class="window-header">
							<span class="window-time">{{ window.startTime }} - {{ window.endTime }}</span>
							<span v-if="isBestWindow(window)" class="best-badge">Best</span>
						</div>
						<div class="window-stats">
							<span>{{ window.duration }}h duration</span>
							<span>Cloud: {{ cloudPct(window.avgCloudCover) }}</span>
							<span>Seeing: {{ capitalize(indexWord(window.avgSeeing)) }}</span>
							<span>Transparency: {{ capitalize(indexWord(window.avgTransparency)) }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Viewing Targets -->
			<div v-if="hasTargets" class="targets-section">
				<h3>🔭 {{ targetsTitle }}</h3>

				<!-- Excellent Targets -->
				<div v-if="data.targets.excellent?.length" class="target-group">
					<h4 class="rating-excellent">⭐ Excellent Viewing</h4>
					<div v-for="target in data.targets.excellent" :key="target.name" class="target-card">
						<div class="target-header">
							<div class="target-title">
								<img v-if="getPlanetImage(target.name)" :src="getPlanetImage(target.name)" :alt="target.name" class="planet-icon">
								<h5>{{ target.name }}</h5>
							</div>
							<span class="light-distance">{{ target.lightDistance?.string }}</span>
						</div>
						<p class="target-reason">{{ target.reason }}</p>
						<div class="target-details">
							<span>Peak at {{ formatHour(target.peakHour) }}</span>
							<span>{{ target.peakAltitude.toFixed(1) }}° altitude ({{ target.peakDirection }})</span>
							<span>Visible for {{ target.visibleHours }}h</span>
						</div>
						<div v-if="getTargetWindows(target)" class="target-windows">
							<span class="window-hint">🌟 {{ getTargetWindows(target) }}</span>
						</div>
					</div>
				</div>

				<!-- Good Targets -->
				<div v-if="data.targets.good?.length" class="target-group">
					<h4 class="rating-good">✨ Good Viewing</h4>
					<div v-for="target in data.targets.good" :key="target.name" class="target-card">
						<div class="target-header">
							<div class="target-title">
								<img v-if="getPlanetImage(target.name)" :src="getPlanetImage(target.name)" :alt="target.name" class="planet-icon">
								<h5>{{ target.name }}</h5>
							</div>
							<span class="light-distance">{{ target.lightDistance?.string }}</span>
						</div>
						<p class="target-reason">{{ target.reason }}</p>
						<div class="target-details">
							<span>Peak at {{ formatHour(target.peakHour) }}</span>
							<span>{{ target.peakAltitude.toFixed(1) }}° altitude ({{ target.peakDirection }})</span>
							<span>Visible for {{ target.visibleHours }}h</span>
						</div>
						<div v-if="getTargetWindows(target)" class="target-windows">
							<span class="window-hint">🌟 {{ getTargetWindows(target) }}</span>
						</div>
					</div>
				</div>

				<!-- Fair Targets -->
				<div v-if="data.targets.fair?.length" class="target-group">
					<h4 class="rating-fair">💫 Fair Viewing</h4>
					<div v-for="target in data.targets.fair" :key="target.name" class="target-card">
						<div class="target-header">
							<div class="target-title">
								<img v-if="getPlanetImage(target.name)" :src="getPlanetImage(target.name)" :alt="target.name" class="planet-icon">
								<h5>{{ target.name }}</h5>
							</div>
							<span class="light-distance">{{ target.lightDistance?.string }}</span>
						</div>
						<p class="target-reason">{{ target.reason }}</p>
						<div class="target-details">
							<span>Peak at {{ formatHour(target.peakHour) }}</span>
							<span>{{ target.peakAltitude.toFixed(1) }}° altitude ({{ target.peakDirection }})</span>
							<span>Visible for {{ target.visibleHours }}h</span>
						</div>
						<div v-if="getTargetWindows(target)" class="target-windows">
							<span class="window-hint">🌟 {{ getTargetWindows(target) }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Equipment Info -->
			<div class="equipment-info">
				<p><strong>Your Equipment:</strong> {{ data.viewingCapabilities.description }}</p>
				<p class="equipment-details">Max magnitude: {{ data.viewingCapabilities.maxMagnitude }} | Min altitude: {{ data.viewingCapabilities.minAltitude }}°</p>
			</div>
		</div>
	</Transition>
</template>

<script setup>
	const props = defineProps({
		data: {
			type: Object,
			default: null
		}
	})

	// Log the response for debugging
	watch(() => props.data, (newData) => {
		if (newData) {
			console.log('API Response:', newData)
		}
	}, { immediate: true })

	const weatherClass = computed(() => {
		if (!props.data?.weather) return ''
		const quality = props.data.weather.quality
		// The API can legitimately call a smoke-hazed night "good" -- bright
		// planets really are fine -- but a green card above a smoke warning
		// undercuts the message, so the styling follows the air.
		if (smokeDominates.value) return 'weather-smoky'
		if (quality === 'partial') return 'weather-partial'
		return props.data.weather.worthObserving ? 'weather-good' : 'weather-poor'
	})

	// True once aerosols, not cloud, are the limiting factor for the night.
	const smokeDominates = computed(() => {
		const level = props.data?.weather?.airQuality?.level
		return level === 'significant' || level === 'heavy'
	})

	const weatherEmoji = computed(() => {
		if (!props.data?.weather) return '🌤️'
		const quality = props.data.weather.quality
		if (smokeDominates.value) return '🌫️'
		if (quality === 'partial') return '⛅'
		return props.data.weather.worthObserving ? '🌟' : '☁️'
	})

	const weatherTitle = computed(() => {
		if (!props.data?.weather) return 'Checking Conditions'
		const quality = props.data.weather.quality
		return quality.charAt(0).toUpperCase() + quality.slice(1) + ' Conditions'
	})

	// Verdict + summary copy is produced by the API so all surfaces stay in sync.
	const weatherVerdict = computed(() => props.data?.weather?.verdict ?? '')

	const cloudCoverPct = computed(() => {
		const pct = props.data?.weather?.cloudCoverPct
		return pct === undefined || pct === null ? '—' : `${pct}%`
	})

	const clearSummary = computed(() => props.data?.weather?.summary ?? '')

	// Absent when the API could not reach its air quality upstream, or when it
	// predates aerosol support -- every read here is optional.
	const airQuality = computed(() => props.data?.weather?.airQuality ?? null)

	const aerosolImpact = computed(() => {
		const air = airQuality.value
		return air?.dimsView ? (air.transparencyImpact ?? '') : ''
	})

	const healthAdvisory = computed(() => airQuality.value?.healthAdvisory ?? '')

	const capitalize = (text) => {
		if (!text) return ''
		return text.charAt(0).toUpperCase() + text.slice(1)
	}

	// 7timer indices: cloud 1-9, seeing/transparency 1-8 (lower is better).
	const cloudPct = (index) => `${Math.max(0, Math.min(100, Math.round(((index - 1) / 8) * 100)))}%`

	const indexWord = (index) => {
		if (index <= 2) return 'excellent'
		if (index <= 4) return 'good'
		if (index <= 6) return 'fair'
		return 'poor'
	}

	const targetsTitle = computed(() => {
		const quality = props.data?.weather?.quality
		const worth = props.data?.weather?.worthObserving

		// Significant smoke produces `partial`, but on a cloudless smoky night
		// "During Clear Windows" is wrong -- the sky is clear the whole time and it
		// is altitude, not timing, that limits you.
		if (smokeDominates.value) {
			return worth
				? 'What to Look For High Overhead'
				: 'Best Positioned Objects (Despite the Smoke)'
		}

		if (quality === 'partial') {
			return 'What to Look For During Clear Windows'
		}

		return worth
			? 'What to Look For Tonight'
			: 'Best Positioned Objects (Despite Conditions)'
	})

	const hasTargets = computed(() => {
		if (!props.data?.targets) return false
		return (props.data.targets.excellent?.length || 0) +
			(props.data.targets.good?.length || 0) +
			(props.data.targets.fair?.length || 0) > 0
	})

	const isBestWindow = (window) => {
		if (!props.data?.weather?.bestWindow) return false
		return window.startHour === props.data.weather.bestWindow.startHour &&
			window.endHour === props.data.weather.bestWindow.endHour
	}

	const getTargetWindows = (target) => {
		// If there are viewing windows, check if target's peak hour falls within any
		if (!props.data?.weather?.viewingWindows?.length) return null

		const peakHour = target.peakHour
		const windows = props.data.weather.viewingWindows

		const matchingWindow = windows.find(window => {
			// Handle window that crosses midnight
			if (window.endHour < window.startHour) {
				return peakHour >= window.startHour || peakHour <= window.endHour
			}
			return peakHour >= window.startHour && peakHour <= window.endHour
		})

		if (matchingWindow) {
			const isBest = isBestWindow(matchingWindow)
			return `Best viewed ${matchingWindow.startTime} - ${matchingWindow.endTime}${isBest ? ' (optimal window)' : ''}`
		}

		return null
	}

	const formatHour = (hour) => {
		if (hour === 0) return '12:00 AM'
		if (hour < 12) return `${hour}:00 AM`
		if (hour === 12) return '12:00 PM'
		return `${hour - 12}:00 PM`
	}

	const getPlanetImage = (targetName) => {
		// Map target names to planet image filenames
		const planetMap = {
			'Moon': 'moon',
			'Mercury': 'mercury',
			'Venus': 'venus',
			'Mars': 'mars',
			'Jupiter': 'jupiter',
			'Saturn': 'saturn',
			'Uranus': 'uranus',
			'Neptune': 'neptune'
		}

		const planetKey = planetMap[targetName]
		if (planetKey) {
			return `/planets/${planetKey}.png`
		}
		return null
	}
</script>

<style scoped>
	.results {
		margin-top: 2rem;
	}

	.weather-card {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--glass-border);
		box-shadow: var(--glass-shadow);
		margin-bottom: 1.5rem;
	}

	.weather-card.weather-good {
		border-color: rgba(40, 167, 69, 0.6);
		background: linear-gradient(135deg, rgba(40, 167, 69, 0.22) 0%, var(--glass-bg) 70%);
	}

	.weather-card.weather-partial {
		border-color: rgba(251, 191, 36, 0.6);
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, var(--glass-bg) 70%);
	}

	.weather-card.weather-poor {
		border-color: rgba(220, 53, 69, 0.6);
		background: linear-gradient(135deg, rgba(220, 53, 69, 0.2) 0%, var(--glass-bg) 70%);
	}

	.weather-card.weather-smoky {
		border-color: rgba(214, 137, 16, 0.6);
		background: linear-gradient(135deg, rgba(214, 137, 16, 0.2) 0%, var(--glass-bg) 70%);
	}

	.weather-card h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		color: #f4f4f8;
	}

	.air-notice {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border-radius: 10px;
		line-height: 1.45;
	}

	.air-notice--optical {
		background: rgba(214, 137, 16, 0.14);
		border: 1px solid rgba(214, 137, 16, 0.3);
		color: #e8ddc8;
	}

	.air-notice--health {
		background: rgba(220, 53, 69, 0.14);
		border: 1px solid rgba(220, 53, 69, 0.3);
		color: #f0d4d7;
	}

	.weather-verdict {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #d0d0da;
	}

	.weather-details {
		font-size: 0.95rem;
		color: #b0b0be;
	}

	.weather-details p {
		margin: 0.5rem 0;
	}

	.clear-summary {
		font-weight: 600;
		color: #f4f4f8;
	}

	.weather-stats {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	.weather-stats span {
		padding: 0.25rem 0.75rem;
		background: var(--glass-bg-light);
		border: 1px solid var(--glass-border);
		border-radius: 8px;
		color: #d0d0da;
	}

	/* Viewing Windows Section */
	.viewing-windows {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid rgba(251, 191, 36, 0.5);
		box-shadow: var(--glass-shadow);
		margin-bottom: 1.5rem;
	}

	.viewing-windows h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.3rem;
		color: #f4f4f8;
	}

	.windows-intro {
		margin: 0 0 1rem 0;
		color: #d0d0da;
		font-size: 0.95rem;
	}

	.window-cards {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.window-card {
		background: var(--glass-bg-light);
		padding: 1rem;
		border-radius: 12px;
		border: 1px solid var(--glass-border);
		transition: all 0.2s ease;
	}

	.window-card.best-window {
		border-color: rgba(251, 191, 36, 0.7);
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.18) 0%, var(--glass-bg-light) 100%);
	}

	.window-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.window-time {
		font-size: 1.1rem;
		font-weight: 600;
		color: #f4f4f8;
	}

	.best-badge {
		background: #fbbf24;
		color: #1a1a1a;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.window-stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: #b0b0be;
	}

	.window-stats span {
		padding: 0.25rem 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		border: 1px solid var(--glass-border);
	}

	.targets-section {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--glass-border);
		box-shadow: var(--glass-shadow);
		margin-bottom: 1.5rem;
	}

	.targets-section > h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.3rem;
		color: #f4f4f8;
	}

	.target-group {
		margin-bottom: 1.5rem;
	}

	.target-group:last-child {
		margin-bottom: 0;
	}

	.target-group h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--glass-border);
	}

	.rating-excellent {
		color: #4ade80;
	}

	.rating-good {
		color: #60a5fa;
	}

	.rating-fair {
		color: #fbbf24;
	}

	.target-card {
		background: var(--glass-bg-light);
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 0.75rem;
		border: 1px solid var(--glass-border);
	}

	.target-card:last-child {
		margin-bottom: 0;
	}

	.target-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.target-header h5 {
		margin: 0;
		font-size: 1.1rem;
		color: #f4f4f8;
	}

	.target-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.planet-icon {
		width: 1.5em;
		height: 1.5em;
		object-fit: contain;
	}

	.light-distance {
		font-size: 0.85rem;
		color: #b8b8c4;
		font-style: italic;
		text-align: right;
	}

	.target-reason {
		margin: 0 0 0.75rem 0;
		color: #d0d0da;
		font-size: 0.95rem;
	}

	.target-details {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.85rem;
		color: #b0b0be;
	}

	.target-details span {
		padding: 0.25rem 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		border: 1px solid var(--glass-border);
	}

	.target-windows {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--glass-border);
	}

	.window-hint {
		display: inline-block;
		padding: 0.4rem 0.75rem;
		background: rgba(251, 191, 36, 0.14);
		border: 1px solid rgba(251, 191, 36, 0.6);
		border-radius: 8px;
		color: #fcd34d;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.equipment-info {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		padding: 1rem;
		border-radius: 16px;
		font-size: 0.9rem;
		color: #d0d0da;
		border: 1px solid var(--glass-border);
		box-shadow: var(--glass-shadow);
	}

	.equipment-info p {
		margin: 0.25rem 0;
	}

	.equipment-details {
		color: #999;
		font-size: 0.85rem;
	}

	.fade-enter-active {
		transition: all 0.3s ease-out;
	}

	.fade-leave-active {
		transition: all 0.2s ease-in;
	}

	.fade-enter-from {
		opacity: 0;
		transform: translateY(10px);
	}

	.fade-leave-to {
		opacity: 0;
		transform: translateY(-10px);
	}
</style>
