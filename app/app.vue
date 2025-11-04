<template>
	<div class="container">
		<NuxtRouteAnnouncer />
		<h1>Astronomy Buddy</h1>

		<LocationForm
			:is-fetching="isFetching"
			@submit="handleFormSubmit"
		/>

		<ViewingDataResults :data="viewingData" />
	</div>
</template>

<script setup>
import useAstronomyAPI from '../composables/useAstronomyAPI'

const { viewingData, isFetching, fetchViewingData } = useAstronomyAPI()

const handleFormSubmit = (formData) => {
	fetchViewingData(formData)
}
</script>

<style scoped>
.container {
	max-width: 600px;
	margin: 2rem auto;
	padding: 2rem;
}

h1 {
	text-align: center;
	margin-bottom: 2rem;
}
</style>
