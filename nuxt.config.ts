// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },

	modules: [
		'@nuxt/eslint',
		'@nuxt/image',
		'@nuxt/scripts',
		'@nuxt/ui'
	],

	app: {
		head: {
			title: 'Astronomy Buddy',
			meta: [
				{ name: 'description', content: 'Discover what planets, stars, and celestial objects are visible from your location. Get personalized viewing recommendations based on your equipment and local conditions.' },
				{ property: 'og:title', content: 'Astronomy Buddy' },
				{ property: 'og:description', content: 'Your personal guide to tonight\'s best astronomical viewing opportunities' }
			]
		}
	}
})
