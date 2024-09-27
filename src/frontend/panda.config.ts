import pandaPreset from '@pandacss/preset-panda'
import {
  Config,
  Tokens,
  defineConfig,
  defineSemanticTokens,
  defineTextStyles,
  defineTokens,
} from '@pandacss/dev'

const spacing: Tokens['spacing'] = {
  0: { value: '0rem' },
  0.125: { value: '0.125rem' },
  0.25: { value: '0.25rem' },
  0.375: { value: '0.375rem' },
  0.5: { value: '0.5rem' },
  0.625: { value: '0.625rem' },
  0.75: { value: '0.75rem' },
  1: { value: '1rem' },
  1.25: { value: '1.25rem' },
  1.5: { value: '1.5rem' },
  1.75: { value: '1.75rem' },
  2: { value: '2rem' },
  2.25: { value: '2.25rem' },
  2.5: { value: '2.5rem' },
  2.75: { value: '2.75rem' },
  3: { value: '3rem' },
  3.5: { value: '3.5rem' },
  4: { value: '4rem' },
}

const config: Config = {
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  jsxFramework: 'react',
  outdir: 'src/styled-system',
  theme: {
    ...pandaPreset.theme,
    // media queries are defined in em so that zooming with text-only mode triggers breakpoints
    breakpoints: {
      xs: '22.6em', // 360px (we assume less than that are old/entry level mobile phones)
      sm: '40em', // 640px
      md: '48em', // 768px
      lg: '64em', // 1024px
      xl: '80em', // 1280px
      '2xl': '96em', // 1536px
    },
    keyframes: {
      slide: {
        from: {
          transform: 'var(--origin)',
          opacity: 0,
        },
        to: {
          transform: 'translateY(0)',
          opacity: 1,
        },
      },
      fade: { from: { opacity: 0 }, to: { opacity: 1 } },
      pulse: {
        '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
        '75%': { boxShadow: '0 0 0 30px rgba(255, 255, 255, 0)' },
        '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
      },
      active_speaker: {
        '0%': { height: '4px' },
        '25%': { height: '8px' },
        '50%': { height: '6px' },
        '100%': { height: '16px' },
      },
      active_speaker_small: {
        '0%': { height: '4px' },
        '25%': { height: '6px' },
        '50%': { height: '4px' },
        '100%': { height: '8px' },
      },
      wave_hand: {
        '0%': { transform: 'rotate(0deg)' },
        '20%': { transform: 'rotate(-20deg)' },
        '80%': { transform: 'rotate(20deg)' },
        '100%': { transform: 'rotate(0)' },
      },
      pulse_mic: {
        '0%': { color: 'primary', opacity: '1' },
        '50%': { color: 'primary', opacity: '0.8' },
        '100%': { color: 'primary', opacity: '1' },
      },
    },
    tokens: defineTokens({
      /* we take a few things from the panda preset but for now we clear out some stuff.
       * This way we'll only add the things we need step by step and prevent using lots of differents things.
       */
      ...pandaPreset.theme.tokens,
      animations: {},
      blurs: {},
      /* just directly use values as tokens. This allows us to follow a specific design scale,
       * without having to remember what 'sm' or '2xl' actually means.
       *
       * see semanticTokens for tokens targeting specific usages
       */
      fonts: {
        sans: {
          value: [
            'Source Sans',
            'Source Sans fallback',
            'ui-sans-serif',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            '"Noto Sans"',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
            '"Noto Color Emoji"',
          ],
        },
        serif: {
          value: [
            'ui-serif',
            'Georgia',
            'Cambria',
            '"Times New Roman"',
            'Times',
            'serif',
          ],
        },
        mono: {
          value: [
            'Source Code Pro',
            'ui-monospace',
            'SFMono-Regular',
            'Menlo',
            'Monaco',
            'Consolas',
            '"Liberation Mono"',
            '"Courier New"',
            'monospace',
          ],
        },
      },
      fontSizes: {
        10: { value: '0.625rem' },
        12: { value: '0.75rem' },
        14: { value: '0.875rem' },
        16: { value: '1rem' },
        20: { value: '1.25rem' },
        24: { value: '1.5rem' },
        28: { value: '1.75rem' },
        32: { value: '2rem' },
        40: { value: '2.375rem' },
        48: { value: '3rem' },
        64: { value: '4rem' },
      },
      letterSpacings: {},
      shadows: {
        sm: {
          value: [
            '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            '0 1px 2px -1px rgb(0 0 0 / 0.1)',
          ],
        },
      },
      lineHeights: {
        1: { value: '1' },
        1.25: { value: '1.25' },
        1.375: { value: '1.375' },
        1.5: { value: '1.5' },
        1.625: { value: '1.625' },
        2: { value: '2' },
      },
      radii: {
        4: { value: '0.25rem' },
        6: { value: '0.375rem' },
        8: { value: '0.5rem' },
        16: { value: '1rem' },
        full: { value: '9999px' },
      },
      sizes: {
        ...spacing,
        full: { value: '100%' },
        min: { value: 'min-content' },
        max: { value: 'max-content' },
        fit: { value: 'fit-content' },
      },
      spacing,
    }),
    semanticTokens: defineSemanticTokens({
      colors: {
        default: {
          text: { value: '{colors.gray.900}' },
          bg: { value: 'white' },
          subtle: { value: '{colors.gray.100}' },
          'subtle-text': { value: '{colors.gray.600}' },
        },
        box: {
          text: { value: '{colors.default.text}' },
          bg: { value: '{colors.white}' },
          border: { value: '{colors.gray.300}' },
        },
        control: {
          DEFAULT: { value: '{colors.gray.100}' },
          hover: { value: '{colors.gray.200}' },
          active: { value: '{colors.gray.300}' },
          text: { value: '{colors.default.text}' },
          border: { value: '{colors.gray.500}' },
          subtle: { value: '{colors.gray.400}' },
        },
        primary: {
          DEFAULT: { value: '{colors.blue.700}' },
          hover: { value: '{colors.blue.800}' },
          active: { value: '{colors.blue.900}' },
          text: { value: '{colors.white}' },
          warm: { value: '{colors.blue.300}' },
          subtle: { value: '{colors.blue.100}' },
          'subtle-text': { value: '{colors.blue.700}' },
        },
        danger: {
          DEFAULT: { value: '{colors.red.600}' },
          hover: { value: '{colors.red.700}' },
          active: { value: '{colors.red.800}' },
          text: { value: '{colors.white}' },
          subtle: { value: '{colors.red.100}' },
          'subtle-text': { value: '{colors.red.700}' },
          ...pandaPreset.theme.tokens.colors.red,
        },
        success: {
          DEFAULT: { value: '{colors.green.700}' },
          hover: { value: '{colors.green.800}' },
          active: { value: '{colors.green.900}' },
          text: { value: '{colors.white}' },
          subtle: { value: '{colors.green.100}' },
          'subtle-text': { value: '{colors.green.800}' },
          ...pandaPreset.theme.tokens.colors.green,
        },
        warning: {
          DEFAULT: { value: '{colors.amber.700}' },
          hover: { value: '{colors.amber.800}' },
          active: { value: '{colors.amber.900}' },
          text: { value: '{colors.white}' },
          subtle: { value: '{colors.amber.100}' },
          'subtle-text': { value: '{colors.amber.700}' },
        },
        focusRing: { value: 'rgb(74, 121, 199)' },
      },
      shadows: {
        box: { value: '{shadows.sm}' },
      },
      spacing: {
        boxPadding: {
          DEFAULT: { value: '{spacing.2}' },
          sm: { value: '{spacing.1}' },
          xs: { value: '{spacing.0.5}' },
        },
        boxMargin: {
          xs: { value: '{spacing.0.5}' },
          DEFAULT: { value: '{spacing.1}' },
          lg: { value: '{spacing.2}' },
        },
        paragraph: { value: '{spacing.0.5}' },
        heading: { value: '{spacing.1}' },
        gutter: { value: '{spacing.1}' },
        textfield: { value: '{spacing.1}' },
      },
    }),
    textStyles: defineTextStyles({
      display: {
        value: {
          fontSize: '3rem',
          lineHeight: '2rem',
          fontWeight: 700,
        },
      },
      h1: {
        value: {
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontWeight: 700,
        },
      },
      h2: {
        value: {
          fontSize: '1.25rem',
          lineHeight: '1.75rem',
          fontWeight: 700,
        },
      },
      h3: {
        value: {
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
        },
      },
      body: {
        value: {
          fontSize: '1rem',
          lineHeight: '1.5',
        },
      },
      sm: {
        value: {
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        },
      },
      badge: {
        value: {
          fontSize: '0.75rem',
          lineHeight: '1rem',
        },
      },
    }),
  },
}

export default defineConfig(config)
