import { extendTheme } from '@chakra-ui/react'

// Site theme: dark mode by default, semantic colors and shared radii.
//
// Semantic colors: use these names (bg="bg.card", color="text.muted"…) rather than
// useColorModeValue(...) with hardcoded colors, so the light and dark themes stay consistent.
//
// Radii: cards and blocks "xl", buttons and fields "lg", chips "full".

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const semanticTokens = {
  colors: {
    // Backgrounds
    'bg.page': { default: 'gray.50', _dark: 'gray.900' },
    'bg.card': { default: 'white', _dark: 'gray.800' },
    'bg.subtle': { default: 'gray.50', _dark: 'whiteAlpha.50' },
    'bg.muted': { default: 'gray.50', _dark: 'gray.700' },
    'bg.hover': { default: 'gray.100', _dark: 'whiteAlpha.100' },
    'bg.inset': { default: 'gray.100', _dark: 'gray.700' },
    'bg.elevated': { default: 'white', _dark: 'gray.700' },
    // Translucent card over a decorated background (gradients, banners)
    'bg.glass': { default: 'white', _dark: 'rgba(26,32,44,0.7)' },
    // Borders
    'border.subtle': { default: 'gray.200', _dark: 'gray.700' },
    'border.default': { default: 'gray.200', _dark: 'gray.600' },
    'border.faint': { default: 'gray.200', _dark: 'whiteAlpha.200' },
    'border.strong': { default: 'gray.300', _dark: 'whiteAlpha.300' },
    // Text
    'text.strong': { default: 'gray.800', _dark: 'whiteAlpha.900' },
    'text.body': { default: 'gray.700', _dark: 'gray.200' },
    'text.secondary': { default: 'gray.600', _dark: 'gray.300' },
    'text.muted': { default: 'gray.500', _dark: 'gray.400' },
    // Brand accent (purple)
    'accent': { default: 'purple.600', _dark: 'purple.300' },
  },
}

const fieldRadius = { field: { borderRadius: 'lg' } }

export const theme = extendTheme({
  config,
  semanticTokens,
  breakpoints: {
    sm: '30em',    // ~480px
    md: '48em',    // ~768px
    dm: '52em',   // ~832px
    lg: '62em',    // ~992px
    xl: '64.375em', // 1030px (1030/16 = 64.375)
    '2xl': '96em', // ~1536px
  },
  components: {
    Button: { baseStyle: { borderRadius: 'lg' } },
    Input: {
      baseStyle: fieldRadius,
      defaultProps: {
        variant: 'outline',
      },
      variants: {
        outline: (props: Record<string, unknown>) => ({
          field: {
            borderColor: props.colorMode === 'light' ? 'gray.200' : 'gray.600',
            bg: props.colorMode === 'light' ? 'white' : 'gray.800',
            _hover: {
              borderColor: 'gray.300',
            },
            _focus: {
              boxShadow: 'outline',
              borderColor: 'blue.500',
            },
          },
        }),
      },
    },
    NumberInput: { baseStyle: fieldRadius },
    Select: { baseStyle: fieldRadius },
    Textarea: { baseStyle: { borderRadius: 'lg' } },
    Modal: { baseStyle: { dialog: { borderRadius: 'xl' } } },
  },
})
