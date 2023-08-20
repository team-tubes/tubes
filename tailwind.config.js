/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				'space-mono': ['Space Mono', 'monospace'],
			},
			zIndex: {
				'300': '300',
				'400': '400',
			}
		},
	},
	plugins: [],
	important: true,
};
