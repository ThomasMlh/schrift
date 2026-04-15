import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainRouter from './MainRouter'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import { APIProvider } from './providers/APIProvider'

// Configuration du thème avec mode sombre par défaut
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ 
  config,
  breakpoints: {
    sm: '30em',    // ~480px
    md: '48em',    // ~768px
    dm: '52em',   // ~832px
    lg: '62em',    // ~992px
    xl: '64.375em', // 1030px (1030/16 = 64.375)
    '2xl': '96em', // ~1536px
  },
  components: {
    Input: {
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
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <APIProvider>
          <MainRouter />
        </APIProvider>
      </ChakraProvider>
    </HelmetProvider>
  </StrictMode>,
)
