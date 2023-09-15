import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'var(--border)',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				green: {
					DEFAULT: 'var(--green)',
					border: 'var(--green-border)',
				},
				blue: {
					DEFAULT: 'var(--blue)',
					border: 'var(--blue-border)',
				},
				purple: {
					DEFAULT: 'var(--purple)',
					border: 'var(--purple-border)',
				},
				backgroundGrey: 'var(--background-grey)',
				grey: 'var(--grey)',
				profileBackgroundGrey: 'var(--profile-background-grey)',
				lightGrey: 'var(--light-grey)',
				textPrimary: 'var(--font-colors-primary)',
				textSecondary: 'var(--font-colors-secondary)',
				textTertiary: 'var(--font-colors-tertiary)',
				textRed: 'var(--font-colors-red)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius))',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			fontFamily: {
				sans: ['Inter var', ...defaultTheme.fontFamily.sans],
			},
		},
		theme: {
			screens: {
				sm: '640px',
				// => @media (min-width: 640px) { ... }

				md: '768px',
				// => @media (min-width: 768px) { ... }
				mob: '840px',

				lg: '1024px',
				// => @media (min-width: 1024px) { ... }

				xl: '1280px',
				// => @media (min-width: 1280px) { ... }
			},
		},
	},
	plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar')],
};
