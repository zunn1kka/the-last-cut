import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '4000',
				pathname: '/uploads/**',
			},
			{
				protocol: 'https',
				hostname: '**',
			},
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		formats: ['image/webp'],
	},
	async rewrites() {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL
		if (!apiUrl) {
			console.warn('NEXT_PUBLIC_API_URL is not defined')
			return []
		}
		return [
			{
				source: '/api/:path*',
				destination: `${apiUrl}/:path*`,
			},
		]
	},
}

export default nextConfig
