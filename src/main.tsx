import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainRouter from './MainRouter'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'

// Configuration du thème avec mode sombre par défaut
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <MainRouter />
    </ChakraProvider>
  </StrictMode>,
)
