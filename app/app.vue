<template>
	<div class="container">
		<h1>Astronomy Buddy</h1>

		<button v-if="viewingData && !showForm" class="toggle-form-btn" @click="showForm = true">
			📍 Change Location or Parameters
		</button>

		<LocationForm
			v-show="showForm || !viewingData"
			:is-fetching="isFetching"
			@submit="handleFormSubmit"
		/>

		<ViewingDataResults :data="viewingData" />
	</div>
</template>

<script setup>
import useAstronomyAPI from '../composables/useAstronomyAPI'

const { viewingData, isFetching, fetchViewingData } = useAstronomyAPI()
const showForm = ref(true)

const handleFormSubmit = (formData) => {
	fetchViewingData(formData)
	showForm.value = false
}
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

.toggle-form-btn {
	width: 100%;
	padding: 0.75rem;
	background: #3a3a3a;
	color: #e8e8e8;
	border: 1px solid #4a4a4a;
	border-radius: 4px;
	font-size: 1rem;
	cursor: pointer;
	margin-bottom: 1.5rem;
}

.toggle-form-btn:hover {
	background: #444;
}
</style>
