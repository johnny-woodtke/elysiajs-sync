import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	webpack: (config, { isServer }) => {
		// Exclude Node.js modules from client-side bundles
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				"fs/promises": false
			}
		}
		return config
	}
}

export default nextConfig
