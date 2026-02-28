/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'slate-950': '#0F172A',
                'hacker-bg': '#0D1526',
                accent: '#38BDF8',
                'accent-muted': '#0EA5E9',
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
