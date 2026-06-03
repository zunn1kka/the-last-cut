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
		return [
			{
				source: '/:path*',
				destination: 'https://the-last-cut-production.up.railway.app/:path*',
			},
		]
	},
}

export default nextConfig
