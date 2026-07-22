const STORAGE_KEY = 'astronomy-buddy:params:v1'

// Persists the last-used location/viewing parameters to localStorage so the
// user doesn't have to re-enter them on every visit. All access is guarded for
// SSR (localStorage only exists in the browser) and wrapped so private-mode /
// quota errors never break the app.
export default function useSavedParams() {
	const load = () => {
		if (!import.meta.client) return null

		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (!raw) return null

			const parsed = JSON.parse(raw)

			// Only treat it as valid if we have coordinates to work with
			if (parsed && parsed.latitude !== undefined && parsed.longitude !== undefined) {
				return parsed
			}

			return null
		} catch {
			return null
		}
	}

	const save = (params) => {
		if (!import.meta.client) return

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(params))
		} catch {
			// Ignore quota / private-mode write failures
		}
	}

	const clear = () => {
		if (!import.meta.client) return

		try {
			localStorage.removeItem(STORAGE_KEY)
		} catch {
			// Ignore
		}
	}

	return {
		load,
		save,
		clear
	}
}
