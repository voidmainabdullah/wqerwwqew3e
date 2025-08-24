import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				file: {
					pdf: 'hsl(var(--file-pdf))',
					image: 'hsl(var(--file-image))',
					video: 'hsl(var(--file-video))',
					audio: 'hsl(var(--file-audio))',
					document: 'hsl(var(--file-document))',
					archive: 'hsl(var(--file-archive))',
					code: 'hsl(var(--file-code))',
					default: 'hsl(var(--file-default))'
				},
				cosmic: {
					dark: 'hsl(var(--cosmic-dark))',
					medium: 'hsl(var(--cosmic-medium))',
					light: 'hsl(var(--cosmic-light))',
					grey1: 'hsl(var(--cosmic-grey-1))',
					grey2: 'hsl(var(--cosmic-grey-2))'
				},
				glass: {
					border: 'hsl(var(--glass-border))',
					bg: 'hsl(var(--glass-bg))'
				},
				functions: {
					upload: 'hsl(var(--function-upload))',
					uploadGlow: 'hsl(var(--function-upload-glow))',
					share: 'hsl(var(--function-share))',
					shareGlow: 'hsl(var(--function-share-glow))',
					download: 'hsl(var(--function-download))',
					downloadGlow: 'hsl(var(--function-download-glow))',
					delete: 'hsl(var(--function-delete))',
					deleteGlow: 'hsl(var(--function-delete-glow))',
					success: 'hsl(var(--function-success))',
					successGlow: 'hsl(var(--function-success-glow))',
					processing: 'hsl(var(--function-processing))',
					processingGlow: 'hsl(var(--function-processing-glow))'
				}
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem'
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1.2' }]
			},
			letterSpacing: {
				'wider': '0.05em',
				'widest': '0.1em'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-surface': 'var(--gradient-surface)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				'professional': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'professional-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)'
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(0.95)',
						opacity: '0'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-down': {
					'0%': {
						transform: 'translateY(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'glow': {
					'0%': {
						boxShadow: '0 0 5px currentColor'
					},
					'100%': {
						boxShadow: '0 0 20px currentColor, 0 0 30px currentColor'
					}
				},
				'bounce-subtle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-4px)'
					}
				},
				'particle-float': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px)',
						opacity: '0.3'
					},
					'25%': {
						transform: 'translateY(-8px) translateX(4px)',
						opacity: '0.6'
					},
					'50%': {
						transform: 'translateY(-4px) translateX(-4px)',
						opacity: '0.8'
					},
					'75%': {
						transform: 'translateY(-12px) translateX(2px)',
						opacity: '0.4'
					}
				},
				'gentle-bounce': {
					'0%, 100%': {
						transform: 'translateY(0px) scale(1)'
					},
					'50%': {
						transform: 'translateY(-6px) scale(1.05)'
					}
				},
				'soft-glow': {
					'0%, 100%': {
						filter: 'drop-shadow(0 0 4px currentColor)',
						opacity: '0.4'
					},
					'50%': {
						filter: 'drop-shadow(0 0 12px currentColor)',
						opacity: '0.7'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scan-horizontal': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'scan-vertical': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'particle': {
					'0%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.3' },
					'50%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.8' },
					'100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.3' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'bounce-subtle': 'bounce-subtle 0.6s ease-out',
				'particle-float': 'particle-float 4s ease-in-out infinite',
				'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
				'soft-glow': 'soft-glow 3s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'scan-horizontal': 'scan-horizontal 3s linear infinite',
				'scan-vertical': 'scan-vertical 4s linear infinite',
				'particle': 'particle 8s ease-in-out infinite',
				'card-hover': 'card-hover 0.3s ease-out forwards',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'scale-hover': 'scale-hover 0.2s ease-out forwards',
				'skeleton-wave': 'skeleton-wave 2s ease-in-out infinite',
				'button-glow': 'button-glow 1.5s ease-out'
			}
		},
		scrollbar: {
			thin: {
				width: '6px',
				height: '6px'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: any) {
			const newUtilities = {
				'.scrollbar-thin': {
					'scrollbar-width': 'thin',
				},
				'.scrollbar-track-background': {
					'scrollbar-color': 'hsl(var(--muted)) hsl(var(--background))',
				},
				'.scrollbar-thumb-muted-foreground\\/30': {
					'&::-webkit-scrollbar': {
						width: '6px',
						height: '6px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'hsl(var(--background))',
						borderRadius: '3px',
					},
					'&::-webkit-scrollbar-thumb': {
						background: 'hsl(var(--muted-foreground) / 0.3)',
						borderRadius: '3px',
						border: '1px solid hsl(var(--background))',
					},
				},
				'.hover\\:scrollbar-thumb-muted-foreground\\/50:hover': {
					'&::-webkit-scrollbar-thumb': {
						background: 'hsl(var(--muted-foreground) / 0.5)',
					},
				},
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
