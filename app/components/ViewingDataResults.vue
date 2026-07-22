<template>
	<Transition name="fade">
		<div v-if="data" class="results">
			<!-- Weather Assessment -->
			<div class="weather-card" :class="weatherClass">
				<h2>{{ weatherEmoji }} {{ weatherTitle }}</h2>
				<p class="weather-verdict">{{ weatherVerdict }}</p>
				<div class="weather-details">
					<p><strong>Conditions:</strong> {{ data.weather.reasons.join(', ') }}</p>
					<p v-if="clearSummary" class="clear-summary">{{ clearSummary }}</p>
					<div class="weather-stats">
						<span>Cloud Cover: {{ cloudCoverPct }}</span>
						<span>Seeing: {{ capitalize(data.weather.seeingText) }}</span>
						<span>Transparency: {{ capitalize(data.weather.transparencyText) }}</span>
					</div>
				</div>
			</div>

			<!-- Viewing Windows (for partial conditions) -->
			<div v-if="data.weather.viewingWindows?.length" class="viewing-windows">
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
							<span class="constellation">{{ target.constellation }}</span>
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
							<span class="constellation">{{ target.constellation }}</span>
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
							<span class="constellation">{{ target.constellation }}</span>
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
		if (quality === 'partial') return 'weather-partial'
		return props.data.weather.worthObserving ? 'weather-good' : 'weather-poor'
	})

	const weatherEmoji = computed(() => {
		if (!props.data?.weather) return '🌤️'
		const quality = props.data.weather.quality
		if (quality === 'partial') return '⛅'
		return props.data.weather.worthObserving ? '🌟' : '☁️'
	})

	const weatherTitle = computed(() => {
		if (!props.data?.weather) return 'Checking Conditions'
		const quality = props.data.weather.quality
		return quality.charAt(0).toUpperCase() + quality.slice(1) + ' Conditions'
	})

	const weatherVerdict = computed(() => {
		if (!props.data?.weather) return ''
		const quality = props.data.weather.quality

		if (quality === 'partial') {
			const best = props.data.weather.bestWindow
			if (best) {
				return `Only a short clear window tonight (${best.startTime}–${best.endTime}) — mostly cloudy otherwise.`
			}
			return 'Only a short clear window tonight — mostly cloudy otherwise.'
		}

		if (quality === 'excellent') return 'Great night for stargazing!'
		if (quality === 'good') return 'Good night for stargazing.'
		if (quality === 'unsuitable') {
			return props.data.weather.hasRain
				? 'Precipitation expected — not worth setting up tonight.'
				: 'Clouded out — not worth setting up tonight.'
		}
		return 'Mostly cloudy tonight — not ideal for stargazing.'
	})

	const cloudCoverPct = computed(() => {
		const pct = props.data?.weather?.cloudCoverPct
		return pct === undefined || pct === null ? '—' : `${pct}%`
	})

	const clearSummary = computed(() => {
		const weather = props.data?.weather
		if (!weather || weather.clearHours === undefined || !weather.nightHours) return ''
		if (weather.clearHours <= 0) return 'No clear sky expected during your viewing window.'
		const pct = Math.round((weather.clearFraction ?? 0) * 100)
		return `Clear for about ${weather.clearHours}h of your ~${weather.nightHours}h window (${pct}% of the night).`
	})

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

		if (quality === 'partial') {
			return 'What to Look For During Clear Windows'
		}

		return props.data?.weather?.worthObserving
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
		background: #2f2f2f;
		padding: 1.5rem;
		border-radius: 8px;
		border: 2px solid #3a3a3a;
		margin-bottom: 1.5rem;
	}

	.weather-card.weather-good {
		border-color: #28a745;
		background: linear-gradient(135deg, #2a3a2f 0%, #2f2f2f 100%);
	}

	.weather-card.weather-partial {
		border-color: #fbbf24;
		background: linear-gradient(135deg, #3a362a 0%, #2f2f2f 100%);
	}

	.weather-card.weather-poor {
		border-color: #dc3545;
		background: linear-gradient(135deg, #3a2a2f 0%, #2f2f2f 100%);
	}

	.weather-card h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		color: #e8e8e8;
	}

	.weather-verdict {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #c0c0c0;
	}

	.weather-details {
		font-size: 0.95rem;
		color: #a0a0a0;
	}

	.weather-details p {
		margin: 0.5rem 0;
	}

	.clear-summary {
		font-weight: 600;
		color: #e8e8e8;
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
		background: #3a3a3a;
		border-radius: 4px;
		color: #c0c0c0;
	}

	/* Viewing Windows Section */
	.viewing-windows {
		background: #2f2f2f;
		padding: 1.5rem;
		border-radius: 8px;
		border: 2px solid #fbbf24;
		margin-bottom: 1.5rem;
	}

	.viewing-windows h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.3rem;
		color: #e8e8e8;
	}

	.windows-intro {
		margin: 0 0 1rem 0;
		color: #c0c0c0;
		font-size: 0.95rem;
	}

	.window-cards {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.window-card {
		background: #3a3a3a;
		padding: 1rem;
		border-radius: 6px;
		border: 2px solid #4a4a4a;
		transition: all 0.2s ease;
	}

	.window-card.best-window {
		border-color: #fbbf24;
		background: linear-gradient(135deg, #3a362a 0%, #3a3a3a 100%);
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
		color: #e8e8e8;
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
		color: #a0a0a0;
	}

	.window-stats span {
		padding: 0.25rem 0.5rem;
		background: #2f2f2f;
		border-radius: 3px;
		border: 1px solid #4a4a4a;
	}

	.targets-section {
		background: #2f2f2f;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #3a3a3a;
		margin-bottom: 1.5rem;
	}

	.targets-section > h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.3rem;
		color: #e8e8e8;
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
		border-bottom: 2px solid #3a3a3a;
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
		background: #3a3a3a;
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 0.75rem;
		border: 1px solid #4a4a4a;
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
		color: #e8e8e8;
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

	.constellation {
		font-size: 0.85rem;
		color: #999;
		font-style: italic;
	}

	.target-reason {
		margin: 0 0 0.75rem 0;
		color: #c0c0c0;
		font-size: 0.95rem;
	}

	.target-details {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.85rem;
		color: #999;
	}

	.target-details span {
		padding: 0.25rem 0.5rem;
		background: #2f2f2f;
		border-radius: 3px;
		border: 1px solid #4a4a4a;
	}

	.target-windows {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #4a4a4a;
	}

	.window-hint {
		display: inline-block;
		padding: 0.4rem 0.75rem;
		background: linear-gradient(135deg, #3a362a 0%, #2f2f2f 100%);
		border: 1px solid #fbbf24;
		border-radius: 4px;
		color: #fbbf24;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.equipment-info {
		background: #2f2f2f;
		padding: 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		color: #c0c0c0;
		border: 1px solid #3a3a3a;
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
