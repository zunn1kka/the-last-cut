import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				'custom-dark': '#1A1A2E',
				'custom-darker': '#0F0F1A',
			},
			width: {
				'card-sm': '160px',
				'card-md': '180px',
				'card-lg': '200px',
			},
		},
	},
	plugins: [],
}

export default config
