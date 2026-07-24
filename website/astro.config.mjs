// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distMusCss = path.resolve(__dirname, '../dist/mus.css')
const srcIndexTs = path.resolve(__dirname, '../src/index.ts')

export default defineConfig({
	site: 'https://mus.datachef.co',
	vite: {
		server: {
			fs: {
				// Allow serving files from the monorepo root (needed for /@fs/ access to ../src/)
				allow: [path.resolve(__dirname, '..')],
			},
		},
		resolve: {
			alias: [
				// Internal @/ path alias for the mus source package
				{ find: '@/', replacement: path.resolve(__dirname, '../src/') + '/' },
				// Force lucide-react to the root version — the website ships 1.23.0 which
				// dropped Youtube; the MUS source requires the root's 0.577.0 icons.
				{ find: 'lucide-react', replacement: path.resolve(__dirname, '../node_modules/lucide-react') },
			],
		},
		plugins: [
			{
				// Resolve @datachef/mus imports directly to source TS in both client and SSR.
				// Also redirects src/index.ts's raw CSS import to the pre-compiled dist/mus.css
				// (the source CSS contains @tailwind directives that require the Tailwind plugin).
				name: 'mus-resolve',
				enforce: 'pre',
				resolveId(id, importer) {
					if (id === '@datachef/mus/styles.css') return distMusCss
					if (id === '@datachef/mus') return srcIndexTs
					// Suppress the raw Tailwind source CSS from src/index.ts (no Tailwind plugin here)
					if (id === './styles/index.css' && importer?.includes('/src/index.ts')) return distMusCss
				},
			},
		],
	},
	integrations: [
		react(),
		starlight({
			title: 'MUS',
			description: 'Add a two-way feedback layer to any section of your product. Users react in context. Teams add explanations that stay.',
			head: [
				// Favicon — light/dark mode variants
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon-light.svg', type: 'image/svg+xml' } },
				// Open Graph
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:url', content: 'https://mus.datachef.co' } },
				{ tag: 'meta', attrs: { property: 'og:title', content: 'MUS — Feedback and context, right where your product speaks' } },
				{ tag: 'meta', attrs: { property: 'og:description', content: 'MUS adds a two-way feedback layer to any section of your product. Users react in context. Teams add explanations that stay. One component, no forms, no backend to write.' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://mus.datachef.co/og-image.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '2560' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '1424' } },
				// Twitter card
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'twitter:title', content: 'MUS — Feedback and context, right where your product speaks' } },
				{ tag: 'meta', attrs: { name: 'twitter:description', content: 'MUS adds a two-way feedback layer to any section of your product. Users react in context. Teams add explanations that stay.' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://mus.datachef.co/og-image.png' } },
				// Theme color
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#2d6a4f' } },
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/DataChefHQ/datachef-mus' },
				{ icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/@datachef/mus' },
			],
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Installation', slug: 'getting-started' },
						{ label: 'Configuration', slug: 'configuration' },
					],
				},
				{
					label: 'Server Setup',
					items: [
						{ label: 'Overview', slug: 'server/overview' },
						{ label: 'Next.js', slug: 'server/nextjs' },
						{ label: 'Express / Fastify / Hono', slug: 'server/express' },
						{ label: 'Vite SPA + Docker', slug: 'server/vite' },
					],
				},
				{
					label: 'Deployment',
					items: [
						{ label: 'Docker Compose', slug: 'deployment/docker' },
						{ label: 'nginx', slug: 'deployment/nginx' },
						{ label: 'Kubernetes', slug: 'deployment/kubernetes' },
					],
				},
				{
					label: 'Adapters',
					items: [
						{ label: 'Overview', slug: 'adapters/overview' },
						{ label: 'Slack', slug: 'adapters/slack' },
						{ label: 'Discord', slug: 'adapters/discord' },
						{ label: 'Microsoft Teams', slug: 'adapters/teams' },
						{ label: 'Webhook', slug: 'adapters/webhook' },
						{ label: 'Custom Adapters', slug: 'adapters/custom' },
					],
				},
				{
					label: 'User Resolvers',
					items: [
						{ label: 'Overview', slug: 'resolvers/overview' },
						{ label: 'Custom Resolvers', slug: 'resolvers/custom' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'MusConfig', slug: 'reference/config' },
						{ label: 'Event Types', slug: 'reference/events' },
						{ label: 'Package Exports', slug: 'reference/exports' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Theming & Icons', slug: 'guides/theming' },
						{ label: 'Customizing Actions', slug: 'guides/actions' },
						{ label: 'Message Formatting', slug: 'guides/formatting' },
						{ label: 'CLI (mus init)', slug: 'guides/cli' },
						{ label: 'Troubleshooting', slug: 'guides/troubleshooting' },
					],
				},
				{ label: 'Upgrade Guide', slug: 'migration' },
			],
			components: {
				Header: './src/components/Header.astro',
				Hero: './src/components/HeroSection.astro',
				Footer: './src/components/Footer.astro',
			},
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
