<template>
	<Transition name="fade">
		<div v-if="data" class="results">
			<!-- Weather Assessment -->
			<div class="weather-card" :class="weatherClass">
				<h2>{{ weatherEmoji }} {{ weatherTitle }}</h2>
				<p class="weather-verdict">{{ data.weather.worthObserving ? 'Great night for stargazing!' : 'Not ideal for stargazing tonight.' }}</p>
				<div class="weather-details">
					<p><strong>Conditions:</strong> {{ data.weather.reasons.join(', ') }}</p>
					<div class="weather-stats">
						<span>Cloud Cover: {{ data.weather.avgCloudCover }}/10</span>
						<span>Seeing: {{ data.weather.avgSeeing }}/10</span>
						<span>Transparency: {{ data.weather.avgTransparency }}/10</span>
					</div>
				</div>
			</div>

			<!-- Viewing Targets -->
			<div v-if="hasTargets" class="targets-section">
				<h3>🔭 {{ data.weather.worthObserving ? 'What to Look For Tonight' : 'Best Positioned Objects (Despite Conditions)' }}</h3>

				<!-- Excellent Targets -->
				<div v-if="data.targets.excellent?.length" class="target-group">
					<h4 class="rating-excellent">⭐ Excellent Viewing</h4>
					<div v-for="target in data.targets.excellent" :key="target.name" class="target-card">
						<div class="target-header">
							<h5>{{ target.name }}</h5>
							<span class="constellation">{{ target.constellation }}</span>
						</div>
						<p class="target-reason">{{ target.reason }}</p>
						<div class="target-details">
							<span>Peak at {{ formatHour(target.peakHour) }}</span>
							<span>{{ target.peakAltitude.toFixed(1) }}° altitude ({{ target.peakDirection }})</span>
							<span>Visible for {{ target.visibleHours }}h</span>
						</div>
					</div>
				</div>

				<!-- Good Targets -->
				<div v-if="data.targets.good?.length" class="target-group">
					<h4 class="rating-good">✨ Good Viewing</h4>
					<div v-for="target in data.targets.good" :key="target.name" class="target-card">
						<div class="target-header">
							<h5>{{ target.name }}</h5>
							<span class="constellation">{{ target.constellation }}</span>
						</div>
						<p class="target-reason">{{ target.reason }}</p>
						<div class="target-details">
							<span>Peak at {{ formatHour(target.peakHour) }}</span>
							<span>{{ target.peakAltitude.toFixed(1) }}° altitude ({{ target.peakDirection }})</span>
							<span>Visible for {{ target.visibleHours }}h</span>
						</div>
					</div>
				</div>

				<!-- Fair Targets -->
				<div v-if="data.targets.fair?.length" class="target-group">
					<h4 class="rating-fair">💫 Fair Viewing</h4>
					<div v-for="target in data.targets.fair" :key="target.name" class="target-card">
						<div class="target-header">
							<h5>{{ target.name }}</h5>
							<span class="constellation">{{ target.constellation }}</span>
						</div>
						<p class="target-reason">{{ target.reason }}</p>
						<div class="target-details">
							<span>Peak at {{ formatHour(target.peakHour) }}</span>
							<span>{{ target.peakAltitude.toFixed(1) }}° altitude ({{ target.peakDirection }})</span>
							<span>Visible for {{ target.visibleHours }}h</span>
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
	return props.data.weather.worthObserving ? 'weather-good' : 'weather-poor'
})

const weatherEmoji = computed(() => {
	if (!props.data?.weather) return '🌤️'
	return props.data.weather.worthObserving ? '🌟' : '☁️'
})

const weatherTitle = computed(() => {
	if (!props.data?.weather) return 'Checking Conditions'
	const quality = props.data.weather.quality
	return quality.charAt(0).toUpperCase() + quality.slice(1) + ' Conditions'
})

const hasTargets = computed(() => {
	if (!props.data?.targets) return false
	return (props.data.targets.excellent?.length || 0) +
	       (props.data.targets.good?.length || 0) +
	       (props.data.targets.fair?.length || 0) > 0
})

const formatHour = (hour) => {
	if (hour === 0) return '12:00 AM'
	if (hour < 12) return `${hour}:00 AM`
	if (hour === 12) return '12:00 PM'
	return `${hour - 12}:00 PM`
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
