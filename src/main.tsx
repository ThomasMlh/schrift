import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainRouter from './MainRouter'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'

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
    lg: '62em',    // ~992px
    xl: '64.375em', // 1030px (1030/16 = 64.375)
    '2xl': '96em', // ~1536px
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <MainRouter />
      </ChakraProvider>
    </HelmetProvider>
  </StrictMode>,
)
