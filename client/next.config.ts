import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		// Разрешаем localhost и 127.0.0.1
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '4000',
				pathname: '/uploads/**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '4000',
				pathname: '/uploads/**',
			},
		],
		// Добавляем deviceSizes для оптимизации
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		// Форматы изображений
		formats: ['image/webp'],
	},
}

export default nextConfig
