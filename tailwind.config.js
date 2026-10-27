/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Only apply hover styles on devices that can hover, so touch screens
  // never get a "stuck" hover state after a tap.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Instrument Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        paper: '#F2F5F4', // page background
        ink: '#0E1B2C', // text and headings
        'ink-2': '#33445A', // body copy
        mute: '#5B6779', // secondary text (5.2:1 on paper)
        line: '#D8DFE3', // hairlines and input borders
        action: {
          DEFAULT: '#2437D9', // buttons, links, focus
          dark: '#1A2AB0',
          soft: '#E6E9FB',
        },
        sun: '#FFC233', // highlights
        danger: '#C62F2F',
        ok: '#12805C',
      },
    },
  },
  plugins: [],
};
