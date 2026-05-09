import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				base: "var(--bg)",
				surface: {
					"1": "var(--surface-1)",
					"2": "var(--surface-2)",
					"3": "var(--surface-3)",
				},
				border: {
					DEFAULT: "var(--border)",
					strong: "var(--border-strong)",
				},
				amber: {
					DEFAULT: "var(--amber)",
					dim: "var(--amber-dim)",
					bg: "var(--amber-bg)",
				},
				crimson: {
					DEFAULT: "var(--crimson)",
					bg: "var(--crimson-bg)",
				},
				sage: {
					DEFAULT: "var(--sage)",
					bg: "var(--sage-bg)",
				},
				sky: {
					DEFAULT: "var(--sky)",
					bg: "var(--sky-bg)",
				},
				data: "var(--data)",
				muted: "var(--muted)",
				dim: "var(--dim)",
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
		},
	},
	plugins: [],
};

export default config;
