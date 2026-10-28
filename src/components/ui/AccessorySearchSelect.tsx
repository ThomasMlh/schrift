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
import { FloatingMenu } from "./FloatingMenu";
import { useAccessories, useAccessoriesSubeffects } from "../../hooks/useAPI";
import { useTranslation } from "react-i18next";
import { bucketUrl } from "../../utils/apiRequest";
import { gameText } from "../../utils/gameText";
import { subeffectLabel } from "../../utils/accessoryText";
import type { IAccessory } from "../../interfaces";

interface AccessorySearchSelectProps {
  value?: { id_accessory: string; id_subeffect?: string };
  onChange: (accessory: { id_accessory: string; id_subeffect?: string }) => void;
  placeholder?: string;
  excludeIds?: string[]; // Ids of the accessories already selected for this character
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
  const accessoryFloatingRef = useRef<HTMLDivElement>(null);
  const subeffectFloatingRef = useRef<HTMLDivElement>(null);

  const { i18n } = useTranslation();
  const { accessories, isLoading } = useAccessories(accessorySearch);
  const label = (item: IAccessory) => gameText(item.names, i18n.language) || item.name;
  const effectText = (accessory: IAccessory) => gameText(accessory.effect?.text, i18n.language);
  const { subeffects, isLoading: isLoadingSubeffects } = useAccessoriesSubeffects(subeffectSearch);

  const bgColor = "bg.elevated";
  const borderColor = "border.default";
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  const availableAccessories = accessories.filter(
    (acc) => !excludeIds.includes(acc._id) || acc._id === value?.id_accessory
  );

  const selectedAccessory = accessories.find((a) => a._id === value?.id_accessory);
  const selectedSubeffect = subeffects.find((s) => s._id === value?.id_subeffect);

  // Close the accessory menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accessoryMenuRef.current && !accessoryMenuRef.current.contains(target) && !accessoryFloatingRef.current?.contains(target)) {
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

  // Close the sub-effect menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (subeffectMenuRef.current && !subeffectMenuRef.current.contains(target) && !subeffectFloatingRef.current?.contains(target)) {
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
      <FormControl>
        <FormLabel fontSize="sm">Accessoire</FormLabel>
        <Box position="relative" ref={accessoryMenuRef} w="100%">
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
                {label(selectedAccessory)}
              </Badge>
              {effectText(selectedAccessory) && (
                <Text fontSize="xs" color="text.secondary" noOfLines={1}>{effectText(selectedAccessory)}</Text>
              )}
            </HStack>
          ) : (
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

          {isAccessoryOpen && (
            <FloatingMenu anchorRef={accessoryMenuRef} menuRef={accessoryFloatingRef} maxH={300}>
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
                      <Box minW={0}>
                        <Text fontSize="sm">{label(accessory)}</Text>
                        {effectText(accessory) && <Text fontSize="xs" color="text.secondary">{effectText(accessory)}</Text>}
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              )}
            </FloatingMenu>
          )}
        </Box>
      </FormControl>

      {/* Sub-effect (optional) */}
      {value?.id_accessory && (
        <FormControl>
          <FormLabel fontSize="sm">Sous-effet (optionnel)</FormLabel>
          <Box position="relative" ref={subeffectMenuRef} w="100%">
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
                  {subeffectLabel(selectedSubeffect, selectedAccessory, i18n.language)}
                </Badge>
              </HStack>
            ) : (
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

            {isSubeffectOpen && (
              <FloatingMenu anchorRef={subeffectMenuRef} menuRef={subeffectFloatingRef} maxH={300}>
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
                        <Text fontSize="sm">{subeffectLabel(subeffect, selectedAccessory, i18n.language)}</Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </FloatingMenu>
            )}
          </Box>
        </FormControl>
      )}
    </VStack>
  );
};
