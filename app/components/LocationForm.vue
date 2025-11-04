<template>
	<div class="location-form">
		<h2>Enter Your Location</h2>

		<div class="form-group">
			<label for="latitude">Latitude:</label>
			<input
				id="latitude"
				v-model="formData.latitude"
				type="number"
				step="any"
				placeholder="e.g., 47.6062"
			/>
		</div>

		<div class="form-group">
			<label for="longitude">Longitude:</label>
			<input
				id="longitude"
				v-model="formData.longitude"
				type="number"
				step="any"
				placeholder="e.g., -122.3321"
			/>
		</div>

		<div class="form-group">
			<label for="elevation">Elevation (meters):</label>
			<input
				id="elevation"
				v-model="formData.elevation"
				type="number"
				step="any"
				placeholder="e.g., 50"
			/>
		</div>

		<h3>Optional Parameters</h3>

		<div class="form-group">
			<label for="viewingLevel">Viewing Level:</label>
			<select id="viewingLevel" v-model="formData.viewingLevel">
				<option value="naked-eye">Naked Eye</option>
				<option value="entry">Entry</option>
				<option value="intermediate">Intermediate</option>
				<option value="advanced">Advanced</option>
			</select>
		</div>

		<div class="form-group">
			<label for="eveningStartTime">Evening Start Time:</label>
			<input
				id="eveningStartTime"
				v-model="eveningStartTime"
				type="time"
			/>
		</div>

		<div class="form-group">
			<label for="eveningEndTime">Evening End Time:</label>
			<input
				id="eveningEndTime"
				v-model="eveningEndTime"
				type="time"
			/>
		</div>

		<button @click="handleFillLocation" :disabled="geolocationLoading">
			{{ geolocationLoading ? 'Getting location...' : 'Fill it for me' }}
		</button>

		<button @click="handleSubmit" :disabled="isFetching || !canSubmit" class="submit-btn">
			{{ isFetching ? 'Loading...' : 'Get Viewing Data' }}
		</button>

		<div v-if="error" class="error">{{ error }}</div>
	</div>
</template>

<script setup>
import useGeolocation from '../../composables/useGeolocation'

const props = defineProps({
	isFetching: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['submit'])

// Initialize geolocation composable
const { isLoading: geolocationLoading, error: geolocationError, getCurrentLocation } = useGeolocation()

const formData = ref({
	latitude: '',
	longitude: '',
	elevation: '',
	viewingLevel: 'naked-eye',
	eveningStartHour: 21,
	eveningEndHour: 2
})

// Time inputs in HH:MM format
const eveningStartTime = ref('21:00')
const eveningEndTime = ref('02:00')

// Watch time inputs and convert to 24-hour format
watch(eveningStartTime, (newTime) => {
	if (newTime) {
		const [hours] = newTime.split(':')
		formData.value.eveningStartHour = parseInt(hours, 10)
	}
})

watch(eveningEndTime, (newTime) => {
	if (newTime) {
		const [hours] = newTime.split(':')
		formData.value.eveningEndHour = parseInt(hours, 10)
	}
})

const canSubmit = computed(() => {
	return formData.value.latitude !== '' &&
		formData.value.longitude !== '' &&
		formData.value.elevation !== ''
})

const error = computed(() => {
	return geolocationError.value
})

const handleFillLocation = async () => {
	const location = await getCurrentLocation()
	if (location) {
		formData.value.latitude = location.latitude
		formData.value.longitude = location.longitude
		formData.value.elevation = location.elevation
	}
}

const handleSubmit = () => {
	emit('submit', formData.value)
}
</script>

<style scoped>
.location-form {
	background: #f5f5f5;
	padding: 2rem;
	border-radius: 8px;
}

h2 {
	margin-top: 0;
	margin-bottom: 1.5rem;
}

h3 {
	margin-top: 1.5rem;
	margin-bottom: 1rem;
	font-size: 1.1rem;
	color: #333;
}

.form-group {
	margin-bottom: 1rem;
}

label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 500;
}

input,
select {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ccc;
	border-radius: 4px;
	font-size: 1rem;
	box-sizing: border-box;
}

button {
	width: 100%;
	padding: 0.75rem;
	background: #0066cc;
	color: white;
	border: none;
	border-radius: 4px;
	font-size: 1rem;
	cursor: pointer;
	margin-top: 1rem;
}

button:hover:not(:disabled) {
	background: #0052a3;
}

button:disabled {
	background: #999;
	cursor: not-allowed;
}

.submit-btn {
	background: #28a745;
}

.submit-btn:hover:not(:disabled) {
	background: #218838;
}

.error {
	color: #d32f2f;
	margin-top: 1rem;
	padding: 0.5rem;
	background: #ffebee;
	border-radius: 4px;
}
</style>
