import { createSystem, defaultConfig, defineConfig, defineRecipe } from '@chakra-ui/react';

const buttonRecipe = defineRecipe({
  base: {
    fontWeight: '600',
    borderRadius: 'full',
  },
  variants: {
    variant: {
      solid: {
        bg: 'brand.800',
        color: 'white',
        _hover: { bg: 'brand.700' },
        _active: { bg: 'brand.900' },
      },
      subtle: {
        bg: 'brand.800',
        color: 'white',
        _hover: { bg: 'brand.700' },
      },
      outline: {
        borderColor: 'gray.300',
        color: 'gray.700',
        bg: 'white',
        _hover: { bg: 'gray.50', borderColor: 'brand.800', color: 'brand.800' },
      },
      ghost: {
        color: 'gray.600',
        _hover: { bg: 'gray.100', color: 'gray.900' },
      },
    },
  },
});

const inputRecipe = defineRecipe({
  base: {
    borderRadius: 'full',
  },
});

const textareaRecipe = defineRecipe({
  base: {
    borderRadius: 'lg',
  },
});

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#E9EEF8' },
          100: { value: '#C7D3EB' },
          200: { value: '#A2B6DD' },
          300: { value: '#7C99CF' },
          400: { value: '#5B80C2' },
          500: { value: '#3F67B0' },
          600: { value: '#2F4F96' },
          700: { value: '#243E7A' },
          800: { value: '#1A3470' },
          900: { value: '#122550' },
        },
        accent: {
          red: { value: '#E50914' },
          yellow: { value: '#F4C300' },
        },
      },
      fonts: {
        heading: { value: 'Inter, system-ui, -apple-system, sans-serif' },
        body: { value: 'Inter, system-ui, -apple-system, sans-serif' },
      },
      radii: {
        none: { value: '0' },
        sm: { value: '0.25rem' },
        base: { value: '0.375rem' },
        md: { value: '0.5rem' },
        lg: { value: '0.75rem' },
        xl: { value: '1rem' },
        '2xl': { value: '1.5rem' },
        '3xl': { value: '2rem' },
        full: { value: '9999px' },
      },
      shadows: {
        card: { value: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)' },
        cardHover: { value: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)' },
      },
    },
    semanticTokens: {
      colors: {
        focusRing: { value: '{colors.brand.800}' },
        border: {
          DEFAULT: { value: { _light: '{colors.gray.100}', _dark: '{colors.gray.700}' } },
        },
        fg: {
          DEFAULT: { value: { _light: '{colors.gray.900}', _dark: '{colors.gray.50}' } },
          muted: { value: { _light: '{colors.gray.500}', _dark: '{colors.gray.400}' } },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      textarea: textareaRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
