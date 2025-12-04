import '@/styles/globals.css'

import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'
import siteContent from '@/config/site-content.json'

const {
	meta: { title, description },
	theme
} = siteContent

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

const htmlStyle = {
	cursor: 'url(/images/cursor.svg) 2 1, auto'
}

const DARK_THEME = {
	colorBrand: '#2a48f3',
	colorPrimary: '#e6e8e8',
	colorSecondary: '#acadae',
	colorBrandSecondary: '#51d0b9',
	colorBg: '#0a051f',
	colorBorder: '#8a8a8a5e',
	colorCard: '#ffffff0e',
	colorArticle: '#6f6f6f33'
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const themeCss = `
		:root {
			--color-brand: ${theme.colorBrand};
			--color-primary: ${theme.colorPrimary};
			--color-secondary: ${theme.colorSecondary};
			--color-brand-secondary: ${theme.colorBrandSecondary};
			--color-bg: ${theme.colorBg};
			--color-border: ${theme.colorBorder};
			--color-card: ${theme.colorCard};
			--color-article: ${theme.colorArticle};
		}
		@media (prefers-color-scheme: dark) {
			:root {
				--color-brand: ${DARK_THEME.colorBrand};
				--color-primary: ${DARK_THEME.colorPrimary};
				--color-secondary: ${DARK_THEME.colorSecondary};
				--color-brand-secondary: ${DARK_THEME.colorBrandSecondary};
				--color-bg: ${DARK_THEME.colorBg};
				--color-border: ${DARK_THEME.colorBorder};
				--color-card: ${DARK_THEME.colorCard};
				--color-article: ${DARK_THEME.colorArticle};
			}
		}
	`

	return (
		<html lang='en' suppressHydrationWarning style={htmlStyle}>
			<Head />

			<body>
				<style dangerouslySetInnerHTML={{ __html: themeCss }} />
				<script
					dangerouslySetInnerHTML={{
						__html: `
					if (/windows|win32/i.test(navigator.userAgent)) {
						document.documentElement.classList.add('windows');
					}
		      `
					}}
				/>

				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
