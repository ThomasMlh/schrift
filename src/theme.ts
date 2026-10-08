import { extendTheme } from '@chakra-ui/react'

// Thème du site : mode sombre par défaut, couleurs sémantiques et arrondis communs.
//
// Couleurs sémantiques : utiliser ces noms (bg="bg.card", color="text.muted"...) plutôt que
// useColorModeValue(...) avec des couleurs en dur, pour que tout le site reste cohérent entre
// le thème clair et le thème sombre. Les valeurs reprennent celles déjà utilisées partout.
//
// Arrondis : cartes et blocs en "xl", boutons et champs en "lg", pastilles en "full".

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const semanticTokens = {
  colors: {
    // Fonds
    'bg.page': { default: 'gray.50', _dark: 'gray.900' },
    'bg.card': { default: 'white', _dark: 'gray.800' },
    'bg.subtle': { default: 'gray.50', _dark: 'whiteAlpha.50' },
    'bg.muted': { default: 'gray.50', _dark: 'gray.700' },
    'bg.hover': { default: 'gray.100', _dark: 'whiteAlpha.100' },
    // Bordures
    'border.subtle': { default: 'gray.200', _dark: 'gray.700' },
    'border.default': { default: 'gray.200', _dark: 'gray.600' },
    'border.faint': { default: 'gray.200', _dark: 'whiteAlpha.200' },
    // Textes
    'text.strong': { default: 'gray.800', _dark: 'whiteAlpha.900' },
    'text.muted': { default: 'gray.500', _dark: 'gray.400' },
    // Accent de la marque (violet)
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
