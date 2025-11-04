<template>
	<div v-if="data" class="results">
		<h3>API Response:</h3>
		<pre><code>{{ JSON.stringify(data, null, 2) }}</code></pre>
	</div>
</template>

<script setup>
defineProps({
	data: {
		type: Object,
		default: null
	}
})
</script>

<style scoped>
.results {
	margin-top: 2rem;
	background: white;
	padding: 1rem;
	border-radius: 4px;
	border: 1px solid #ddd;
}

.results h3 {
	margin-top: 0;
	margin-bottom: 1rem;
}

.results pre {
	margin: 0;
	overflow-x: auto;
	background: #f8f9fa;
	padding: 1rem;
	border-radius: 4px;
}

.results code {
	font-family: 'Courier New', monospace;
	font-size: 0.9rem;
	line-height: 1.5;
}
</style>
