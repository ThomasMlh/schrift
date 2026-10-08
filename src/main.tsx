import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import MainRouter from './MainRouter'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { theme } from './theme'
import { HelmetProvider } from 'react-helmet-async'
import { APIProvider } from './providers/APIProvider'

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
