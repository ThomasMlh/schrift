'use client';

import { ChakraProvider, ColorModeScript, extendTheme, Box, Flex } from '@chakra-ui/react';
import { AuthProvider } from '@/providers/AuthProvider';
import { APIProvider } from '@/providers/APIProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import '@/i18n';
import type { ReactNode } from 'react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  breakpoints: {
    sm: '30em',
    md: '48em',
    dm: '52em',
    lg: '62em',
    xl: '64.375em',
    '2xl': '96em',
  },
  components: {
    Input: {
      defaultProps: { variant: 'outline' },
      variants: {
        outline: (props: Record<string, unknown>) => ({
          field: {
            borderColor: props.colorMode === 'light' ? 'gray.200' : 'gray.600',
            bg: props.colorMode === 'light' ? 'white' : 'gray.800',
            _hover: { borderColor: 'gray.300' },
            _focus: { boxShadow: 'outline', borderColor: 'blue.500' },
          },
        }),
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <APIProvider>
          <AuthProvider>
            <Flex direction="column" minH="100vh">
              <Header />
              <Box as="main" flex="1" px={4} overflow="auto">
                {children}
              </Box>
              <Footer />
            </Flex>
          </AuthProvider>
        </APIProvider>
      </ChakraProvider>
    </>
  );
}
