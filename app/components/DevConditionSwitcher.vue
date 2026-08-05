<template>
	<div class="dev-switcher" :class="{ 'is-collapsed': collapsed }">
		<button class="dev-switcher__toggle" @click="collapsed = !collapsed">
			🛠 Dev · Conditions {{ collapsed ? '▸' : '▾' }}
		</button>

		<div v-if="!collapsed" class="dev-switcher__body">
			<button
				v-for="scenario in scenarios"
				:key="scenario.id"
				class="dev-switcher__btn"
				:class="{ 'is-active': activeId === scenario.id }"
				@click="select(scenario)"
			>
				{{ scenario.label }}
			</button>
			<button
				class="dev-switcher__btn dev-switcher__btn--live"
				:class="{ 'is-active': activeId === null }"
				@click="goLive"
			>
				↺ Live data
			</button>
		</div>
	</div>
</template>

<script setup>
	const emit = defineEmits(['select', 'live'])

	const collapsed = ref(false)
	const activeId = ref(null)

	// --- Mock fixtures -------------------------------------------------------
	// Shaped to match the real /viewing-data response so ViewingDataResults
	// renders them exactly as it would live data.
	const capabilities = {
		description: 'Entry-level telescope (60-80mm aperture)',
		maxMagnitude: 10,
		minAltitude: 15
	}

	const ld = (string) => ({ string })

	const T = {
		jupiter: (rating, peakHour = 23) => ({ name: 'Jupiter', magnitude: -2.4, reason: reasonFor(rating), peakHour, peakTime: fmt(peakHour), peakAltitude: 58.3, peakDirection: 'S', visibleHours: 5, lightDistance: ld('43.21 light minutes away') }),
		saturn: (rating, peakHour = 1) => ({ name: 'Saturn', magnitude: 0.7, reason: reasonFor(rating), peakHour, peakTime: fmt(peakHour), peakAltitude: 47.8, peakDirection: 'SSE', visibleHours: 4, lightDistance: ld('1.27 light hours away') }),
		mars: (rating, peakHour = 22) => ({ name: 'Mars', magnitude: 0.9, reason: reasonFor(rating), peakHour, peakTime: fmt(peakHour), peakAltitude: 34.5, peakDirection: 'SE', visibleHours: 4, lightDistance: ld('4.35 light minutes away') }),
		venus: (rating, peakHour = 21) => ({ name: 'Venus', magnitude: -4.1, reason: reasonFor(rating), peakHour, peakTime: fmt(peakHour), peakAltitude: 18.2, peakDirection: 'W', visibleHours: 2, lightDistance: ld('7.24 light minutes away') }),
		neptune: (rating, peakHour = 1) => ({ name: 'Neptune', magnitude: 7.8, reason: reasonFor(rating), peakHour, peakTime: fmt(peakHour), peakAltitude: 25.1, peakDirection: 'ESE', visibleHours: 3, lightDistance: ld('4.08 light hours away') })
	}

	function reasonFor(rating) {
		if (rating === 'excellent') return 'High in sky, minimal atmospheric interference'
		if (rating === 'good') return 'Good viewing angle'
		return 'Viewable but lower in sky'
	}

	function fmt(hour) {
		if (hour === 0) return '12:00 AM'
		if (hour < 12) return `${hour}:00 AM`
		if (hour === 12) return '12:00 PM'
		return `${hour - 12}:00 PM`
	}

	const location = { name: 'Demo Sky, WA', latitude: 47.6062, longitude: -122.3321, elevation: 50 }

	const base = (weather, targets) => ({
		date: '2026-07-22',
		location,
		viewingLevel: 'entry',
		viewingCapabilities: capabilities,
		weather,
		targets
	})

	const partialWindow = {
		startHour: 21, endHour: 23, startTime: '9:00 PM', endTime: '11:00 PM',
		duration: 2, avgCloudCover: 2, avgSeeing: 3, avgTransparency: 3
	}

	const scenarios = [
		{
			id: 'excellent',
			label: '🌟 Excellent',
			data: base(
				{ quality: 'excellent', worthObserving: true, hasRain: false, cloudCoverPct: 4, seeingText: 'excellent', transparencyText: 'excellent', clearHours: 5, nightHours: 5, clearFraction: 1, reasons: ['clear skies', 'excellent atmospheric stability'] },
				{ excellent: [T.jupiter('excellent'), T.saturn('excellent')], good: [T.mars('good')], fair: [T.neptune('fair')] }
			)
		},
		{
			id: 'good',
			label: '✨ Good',
			data: base(
				{ quality: 'good', worthObserving: true, hasRain: false, cloudCoverPct: 28, seeingText: 'good', transparencyText: 'good', clearHours: 4, nightHours: 5, clearFraction: 0.8, reasons: ['some clouds', 'average atmospheric stability'] },
				{ excellent: [T.jupiter('excellent')], good: [T.saturn('good'), T.mars('good')], fair: [T.neptune('fair')] }
			)
		},
		{
			id: 'smoky',
			label: '🌫️ Smoky',
			data: base(
				{
					quality: 'good', worthObserving: true, hasRain: false, cloudCoverPct: 4,
					seeingText: 'good', transparencyText: 'poor', clearHours: 5, nightHours: 5, clearFraction: 1,
					reasons: ['steady atmosphere', 'heavy smoke haze'],
					verdict: 'Clear skies, but heavy smoke haze will wash out fainter stars — the Moon and bright planets still look good.',
					summary: 'Clear skies the entire night.',
					airQuality: {
						aod: 0.68, aodPeak: 0.73, level: 'significant', aerosolType: 'smoke',
						extinctionMagnitudes: 0.74, pm25: 45.2, dust: 0, usAqi: 130,
						healthCategory: 'sensitive',
						healthAdvisory: 'Air quality is unhealthy for sensitive groups (AQI 130) — go easy if smoke bothers you.',
						label: 'Heavy smoke haze',
						transparencyImpact: 'Heavy smoke haze is costing roughly 0.7 magnitudes at the zenith — expect fainter stars to be washed out, though the Moon and bright planets cut through fine.',
						dimsView: true
					}
				},
				{ excellent: [T.jupiter('excellent')], good: [T.saturn('good'), T.mars('good')], fair: [] }
			)
		},
		{
			id: 'heavy-smoke',
			label: '🔥 Heavy Smoke',
			data: base(
				{
					quality: 'poor', worthObserving: false, hasRain: false, cloudCoverPct: 6,
					seeingText: 'good', transparencyText: 'poor', clearHours: 5, nightHours: 5, clearFraction: 1,
					reasons: ['steady atmosphere', 'very heavy smoke'],
					verdict: 'Very heavy smoke tonight — the sky may be clear, but it is washed out. Worth waiting for cleaner air.',
					summary: 'Clear skies the entire night.',
					airQuality: {
						aod: 1.4, aodPeak: 1.55, level: 'heavy', aerosolType: 'smoke',
						extinctionMagnitudes: 1.52, pm25: 120, dust: 0, usAqi: 210,
						healthCategory: 'very-unhealthy',
						healthAdvisory: 'Air quality is very unhealthy (AQI 210) — better to sit this one out.',
						label: 'Very heavy smoke',
						transparencyImpact: 'Very heavy smoke is costing roughly 1.5 magnitudes at the zenith and more low in the sky, washing out all but the brightest objects.',
						dimsView: true
					}
				},
				{ excellent: [], good: [], fair: [T.jupiter('fair'), T.saturn('fair')] }
			)
		},
		{
			id: 'partial',
			label: '⛅ Partial',
			data: base(
				{ quality: 'partial', worthObserving: true, hasRain: false, cloudCoverPct: 63, seeingText: 'fair', transparencyText: 'fair', clearHours: 2, nightHours: 5, clearFraction: 0.4, reasons: ['clear viewing windows available (1 window)', 'moderate cloud cover during other times'], viewingWindows: [partialWindow], bestWindow: partialWindow },
				{ excellent: [], good: [T.jupiter('good', 22)], fair: [T.saturn('fair'), T.venus('fair')] }
			)
		},
		{
			id: 'poor',
			label: '☁️ Poor',
			data: base(
				{ quality: 'poor', worthObserving: false, hasRain: false, cloudCoverPct: 84, seeingText: 'poor', transparencyText: 'fair', clearHours: 0, nightHours: 5, clearFraction: 0, reasons: ['heavy cloud cover'] },
				{ excellent: [], good: [], fair: [T.jupiter('fair'), T.saturn('fair'), T.mars('fair')] }
			)
		},
		{
			id: 'unsuitable',
			label: '🌧 Rain / Unsuitable',
			data: base(
				{ quality: 'unsuitable', worthObserving: false, hasRain: true, cloudCoverPct: 100, seeingText: 'poor', transparencyText: 'poor', clearHours: 0, nightHours: 5, clearFraction: 0, reasons: ['precipitation expected'] },
				{ excellent: [], good: [], fair: [T.saturn('fair')] }
			)
		}
	]

	const select = (scenario) => {
		activeId.value = scenario.id
		emit('select', scenario.data)
	}

	const goLive = () => {
		activeId.value = null
		emit('live')
	}
</script>

<style scoped>
	.dev-switcher {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		z-index: 1000;
		width: 200px;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.8rem;
		background: rgba(20, 10, 25, 0.9);
		border: 1px solid #b45cff;
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.dev-switcher.is-collapsed {
		width: auto;
	}

	.dev-switcher__toggle {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: rgba(180, 92, 255, 0.18);
		color: #e9d5ff;
		border: none;
		font-family: inherit;
		font-size: inherit;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		white-space: nowrap;
	}

	.dev-switcher__toggle:hover {
		background: rgba(180, 92, 255, 0.3);
	}

	.dev-switcher__body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.6rem;
	}

	.dev-switcher__btn {
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.06);
		color: #e8e8ee;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.dev-switcher__btn:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.dev-switcher__btn.is-active {
		background: rgba(180, 92, 255, 0.35);
		border-color: #b45cff;
		color: #fff;
	}

	.dev-switcher__btn--live {
		margin-top: 0.25rem;
		border-style: dashed;
	}
</style>
