/** @type {import('next').NextConfig} */
const nextConfig = {
	// node:sqlite is a Node 22+ built-in; tell webpack not to bundle it
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = [...(config.externals || []), "node:sqlite"];
		}
		return config;
	},
};

export default nextConfig;
