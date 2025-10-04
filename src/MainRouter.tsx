import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {  useColorMode, Button, Box, Flex, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerBody, useDisclosure, VStack, HStack } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import App from "./App";
import AdminPage from "./pages/AdminPage";
import DiscordCallback from "./pages/DiscordCallback";


function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode} variant="ghost" ml={2}>
      {colorMode === "light" ? "🌙" : "☀️"}
    </Button>
  );
}

export default function MainRouter() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const placement = "left";
  return (
    <Router>
      <Box
        as="nav"
        w="100%"
        px={4}
        py={2}
        id="main-navbar"
        boxShadow={{ base: "none", md: "lg" }}
        zIndex={10}
        position="sticky"
        top={0}
        bg="inherit"
      >
        <Flex display={{ base: "none", md: "flex" }} gap={4} justify="center" align="center">
          <Button as={Link} to="/" colorScheme="blue" variant="ghost">
            Accueil
          </Button>
          <Button as={Link} to="/admin" colorScheme="orange" variant="ghost">
            Admin
          </Button>
          <ColorModeSwitcher />
        </Flex>
        <Flex display={{ base: "flex", md: "none" }} align="center" justify="space-between">
          <Box fontWeight="bold">Schrift</Box>
          <HStack>
            <ColorModeSwitcher />
            <IconButton
              aria-label="Ouvrir le menu"
              icon={<HamburgerIcon />}
              variant="outline"
              onClick={onOpen}
            />
          </HStack>
        </Flex>
        <Drawer placement={placement} onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody p={0}>
              <Flex justify="flex-end" p={2}>
                <IconButton
                  aria-label="Fermer le menu"
                  icon={<CloseIcon />}
                  variant="ghost"
                  onClick={onClose}
                />
              </Flex>
              <VStack spacing={4} align="stretch" p={4}>
                <Button as={Link} to="/" colorScheme="blue" variant="ghost" onClick={onClose}>
                  Accueil
                </Button>
                <Button as={Link} to="/admin" colorScheme="orange" variant="ghost" onClick={onClose}>
                  Admin
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
      <Box h="calc(100dvh - var(--navbar-height, 60px))" px={4} py={2} overflow="auto">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/discord-callback" element={<DiscordCallback />} />
        </Routes>
      </Box>
    </Router>
  );
}
