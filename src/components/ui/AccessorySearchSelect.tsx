import {
  Box,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Flex,
  Spinner,
  FormControl,
  FormLabel,
  Badge,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { useAccessories, useAccessoriesSubeffects } from "../../hooks/useAPI";
import { bucketUrl } from "../../utils/apiRequest";

interface AccessorySearchSelectProps {
  value?: { id_accessory: string; id_subeffect?: string };
  onChange: (accessory: { id_accessory: string; id_subeffect?: string }) => void;
  placeholder?: string;
  excludeIds?: string[]; // IDs des accessoires déjà sélectionnés pour ce personnage
}

export const AccessorySearchSelect = ({
  value,
  onChange,
  placeholder = "Rechercher un accessoire...",
  excludeIds = [],
}: AccessorySearchSelectProps) => {
  const [accessorySearch, setAccessorySearch] = useState("");
  const [subeffectSearch, setSubeffectSearch] = useState("");
  const [isAccessoryOpen, setIsAccessoryOpen] = useState(false);
  const [isSubeffectOpen, setIsSubeffectOpen] = useState(false);
  const accessoryMenuRef = useRef<HTMLDivElement>(null);
  const subeffectMenuRef = useRef<HTMLDivElement>(null);

  const { accessories, isLoading } = useAccessories(accessorySearch);
  const { subeffects, isLoading: isLoadingSubeffects } = useAccessoriesSubeffects(subeffectSearch);

  const bgColor = "bg.elevated";
  const borderColor = "border.default";
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const menuBg = "bg.card";

  // Filtrer les accessoires disponibles (exclure ceux déjà sélectionnés)
  const availableAccessories = accessories.filter(
    (acc) => !excludeIds.includes(acc._id) || acc._id === value?.id_accessory
  );

  const selectedAccessory = accessories.find((a) => a._id === value?.id_accessory);
  const selectedSubeffect = subeffects.find((s) => s._id === value?.id_subeffect);

  // Gérer le clic en dehors pour l'accessoire
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accessoryMenuRef.current && !accessoryMenuRef.current.contains(event.target as Node)) {
        setIsAccessoryOpen(false);
        setAccessorySearch("");
      }
    };

    if (isAccessoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccessoryOpen]);

  // Gérer le clic en dehors pour le sous-effet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subeffectMenuRef.current && !subeffectMenuRef.current.contains(event.target as Node)) {
        setIsSubeffectOpen(false);
        setSubeffectSearch("");
      }
    };

    if (isSubeffectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSubeffectOpen]);

  const handleAccessorySelect = (accessoryId: string) => {
    onChange({ id_accessory: accessoryId, id_subeffect: value?.id_subeffect });
    setIsAccessoryOpen(false);
    setAccessorySearch("");
  };

  const handleSubeffectSelect = (subeffectId: string) => {
    if (!value?.id_accessory) return;
    onChange({ 
      id_accessory: value.id_accessory, 
      id_subeffect: subeffectId 
    });
    setIsSubeffectOpen(false);
    setSubeffectSearch("");
  };

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {/* Sélection de l'accessoire principal */}
      <FormControl>
        <FormLabel fontSize="sm">Accessoire</FormLabel>
        <Box position="relative" ref={accessoryMenuRef} w="100%">
          {/* Affichage quand un accessoire est sélectionné */}
          {selectedAccessory && !isAccessoryOpen ? (
            <HStack
              p={2}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              bg={bgColor}
              cursor="pointer"
              onClick={() => setIsAccessoryOpen(true)}
              spacing={2}
              _hover={{ borderColor: "gray.300" }}
            >
              {selectedAccessory.code && (
                <Image
                  src={`${bucketUrl}/accessories/${selectedAccessory.code}/thumb.png`}
                  alt={selectedAccessory.name}
                  boxSize="20px"
                  borderRadius="sm"
                  objectFit="contain"
                  fallback={<Box w="20px" />}
                />
              )}
              <Badge colorScheme="cyan" fontSize="xs" px={2} py={1}>
                {selectedAccessory.name}
              </Badge>
            </HStack>
          ) : (
            /* Input de recherche */
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                {isLoading ? <Spinner size="sm" /> : <SearchIcon color="gray.400" />}
              </InputLeftElement>
              <Input
                placeholder={placeholder}
                value={accessorySearch}
                onChange={(e) => setAccessorySearch(e.target.value)}
                onFocus={() => setIsAccessoryOpen(true)}
                bg={bgColor}
              />
            </InputGroup>
          )}

          {/* Menu déroulant */}
          {isAccessoryOpen && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={1000}
              bg={menuBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="lg"
              maxH="300px"
              overflowY="auto"
              mt={1}
            >
              {isLoading ? (
                <Flex justify="center" p={4}>
                  <Spinner size="sm" />
                </Flex>
              ) : availableAccessories.length === 0 ? (
                <Text p={4} textAlign="center" color="gray.500" fontSize="sm">
                  Aucun accessoire trouvé
                </Text>
              ) : (
                <VStack spacing={0} align="stretch">
                  {availableAccessories.map((accessory) => (
                    <HStack
                      key={accessory._id}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => handleAccessorySelect(accessory._id)}
                      spacing={2}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      _last={{ borderBottom: "none" }}
                    >
                      {accessory.code && (
                        <Image
                          src={`${bucketUrl}/accessories/${accessory.code}/thumb.png`}
                          alt={accessory.name}
                          boxSize="22px"
                          borderRadius="sm"
                          objectFit="contain"
                          fallback={<Box w="22px" />}
                        />
                      )}
                      <Text fontSize="sm">{accessory.name}</Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          )}
        </Box>
      </FormControl>

      {/* Sélection du sous-effet (optionnel) */}
      {value?.id_accessory && (
        <FormControl>
          <FormLabel fontSize="sm">Sous-effet (optionnel)</FormLabel>
          <Box position="relative" ref={subeffectMenuRef} w="100%">
            {/* Affichage quand un sous-effet est sélectionné */}
            {selectedSubeffect && !isSubeffectOpen ? (
              <HStack
                p={2}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                bg={bgColor}
                cursor="pointer"
                onClick={() => setIsSubeffectOpen(true)}
                spacing={2}
                _hover={{ borderColor: "gray.300" }}
              >
                <Badge colorScheme="teal" fontSize="xs" px={2} py={1}>
                  {selectedSubeffect.name}
                </Badge>
              </HStack>
            ) : (
              /* Input de recherche */
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  {isLoadingSubeffects ? <Spinner size="sm" /> : <SearchIcon color="gray.400" />}
                </InputLeftElement>
                <Input
                  placeholder="Rechercher un sous-effet..."
                  value={subeffectSearch}
                  onChange={(e) => setSubeffectSearch(e.target.value)}
                  onFocus={() => setIsSubeffectOpen(true)}
                  bg={bgColor}
                />
              </InputGroup>
            )}

            {/* Menu déroulant */}
            {isSubeffectOpen && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                zIndex={1000}
                bg={menuBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="lg"
                maxH="300px"
                overflowY="auto"
                mt={1}
              >
                {isLoadingSubeffects ? (
                  <Flex justify="center" p={4}>
                    <Spinner size="sm" />
                  </Flex>
                ) : subeffects.length === 0 ? (
                  <Text p={4} textAlign="center" color="gray.500" fontSize="sm">
                    Aucun sous-effet trouvé
                  </Text>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {subeffects.map((subeffect) => (
                      <HStack
                        key={subeffect._id}
                        p={3}
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        onClick={() => handleSubeffectSelect(subeffect._id)}
                        spacing={2}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        _last={{ borderBottom: "none" }}
                      >
                        <Text fontSize="sm">{subeffect.name}</Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            )}
          </Box>
        </FormControl>
      )}
    </VStack>
  );
};
