/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F2ED',
        surface: '#FFFFFF',
        'surface-secondary': '#ECEAE4',
        'surface-tertiary': '#E5E2DA',
        border: '#D8D5CD',
        'border-strong': '#BCB8AD',
        text: '#20252B',
        'text-muted': '#68717C',
        accent: '#2457A6',
        'accent-dark': '#183B70',
        'accent-light': '#EBF1FA',
        success: '#287A52',
        'success-light': '#EBF4EF',
        warning: '#A66A16',
        'warning-light': '#FBF4EB',
        danger: '#B84242',
        'danger-light': '#F9ECEC',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'lg': ['16px', { lineHeight: '24px' }],
        'xl': ['18px', { lineHeight: '28px' }],
        '2xl': ['20px', { lineHeight: '30px' }],
        '3xl': ['24px', { lineHeight: '32px' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '18': '72px',
      },
      borderRadius: {
        DEFAULT: '6px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(32, 37, 43, 0.05)',
        'sm': '0 1px 3px 0 rgba(32, 37, 43, 0.08), 0 1px 2px -1px rgba(32, 37, 43, 0.04)',
        DEFAULT: '0 2px 6px 0 rgba(32, 37, 43, 0.08), 0 1px 2px 0 rgba(32, 37, 43, 0.04)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
