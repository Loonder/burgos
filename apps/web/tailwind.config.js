/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                burgos: {
                    primary: '#FF9F1C', // Vibrant Orange (CTA)
                    secondary: '#0F1C36', // Lighter Navy (Cards)
                    accent: '#F5F7FA', // Text/Icons
                    dark: '#051125', // Deep Navy (Background)
                    gold: {
                        50: '#FFF8E6',
                        100: '#FFECC2',
                        200: '#FFD580',
                        300: '#FFBD3D',
                        400: '#FF9F1C',
                        500: '#E68600',
                        600: '#BF6D00',
                        700: '#8C5000',
                        800: '#593300',
                        900: '#331D00',
                    },
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                display: ['var(--font-outfit)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
