import {
    Box, Button, Text, Flex,
    useColorModeValue, IconButton, Input
} from "@chakra-ui/react";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface SelectOption {
    value: string;
    label: string;
    content?: ReactNode; // Pour afficher du contenu personnalisé
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    allowDeselect?: boolean;
    isDisabled?: boolean;
    renderSelected?: (option: SelectOption) => ReactNode; // Pour personnaliser l'affichage de l'option sélectionnée
    bg?: string; // Couleur de fond personnalisée
    enableSearch?: boolean; // Activer la recherche
    onSearchChange?: (search: string) => void; // Callback pour la recherche (pour API)
    isLoading?: boolean; // État de chargement
}

export const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder = "Sélectionnez une option",
    allowDeselect = true,
    isDisabled = false,
    renderSelected,
    bg,
    enableSearch = false,
    onSearchChange,
    isLoading = false
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(option => option.value === value);

    // Gérer le clic en dehors du composant
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus sur l'input de recherche quand le menu s'ouvre
    useEffect(() => {
        if (isOpen && enableSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, enableSearch]);

    // Réinitialiser la recherche quand on ferme le menu
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            if (onSearchChange) {
                onSearchChange("");
            }
        }
    }, [isOpen, onSearchChange]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleDeselect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        if (onSearchChange) {
            onSearchChange(newSearchTerm);
        }
    };

    // Filtrer les options localement si pas de callback API
    const filteredOptions = enableSearch && !onSearchChange
        ? options.filter(option => 
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    const defaultBgColor = useColorModeValue('white', 'gray.800');
    const bgColor = bg || defaultBgColor;
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.600');
    const menuBg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.900', 'white');
    const placeholderColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box position="relative" ref={menuRef}>
            {selectedOption ? (
                // Affichage quand une option est sélectionnée
                <Flex
                    w="100%"
                    p={3}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={bgColor}
                    align="center"
                    justify="space-between"
                    cursor={isDisabled ? "not-allowed" : "pointer"}
                    opacity={isDisabled ? 0.6 : 1}
                    _hover={!isDisabled ? { borderColor: "gray.300" } : {}}
                    color={textColor}
                    minH="56px"
                >
                    <Box 
                        flex={1} 
                        cursor={isDisabled ? "not-allowed" : "pointer"} 
                        onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    >
                        {renderSelected ? renderSelected(selectedOption) : (
                            <Text fontWeight="medium">
                                {selectedOption.label}
                            </Text>
                        )}
                    </Box>
                    <Flex gap={1}>
                        <IconButton
                            aria-label="Changer l'option"
                            icon={<ChevronDownIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => !isDisabled && setIsOpen(!isOpen)}
                            isDisabled={isDisabled}
                        />
                        {allowDeselect && (
                            <IconButton
                                aria-label="Désélectionner"
                                icon={<CloseIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={handleDeselect}
                                colorScheme="red"
                                isDisabled={isDisabled}
                            />
                        )}
                    </Flex>
                </Flex>
            ) : (
                // Bouton par défaut quand aucune option n'est sélectionnée
                <Button
                    w="100%"
                    justifyContent="space-between"
                    variant="outline"
                    rightIcon={<ChevronDownIcon />}
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    bg={bgColor}
                    borderColor={borderColor}
                    textAlign="left"
                    fontWeight="normal"
                    px={3}
                    py={4}
                    h="auto"
                    minH="56px"
                    isDisabled={isDisabled}
                    color={textColor}
                    _hover={!isDisabled ? { borderColor: "gray.300", bg: hoverBg } : {}}
                >
                    <Text color={placeholderColor}>{placeholder}</Text>
                </Button>
            )}

            {isOpen && !isDisabled && (
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
                    {/* Champ de recherche */}
                    {enableSearch && (
                        <Box 
                            p={2} 
                            borderBottom="1px solid" 
                            borderColor={borderColor}
                            bg={menuBg}
                            position="sticky"
                            top={0}
                            zIndex={1}
                        >
                            <Input
                                ref={searchInputRef}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Rechercher..."
                                size="sm"
                                autoComplete="off"
                            />
                        </Box>
                    )}

                    {isLoading ? (
                        <Text p={3} color={placeholderColor} textAlign="center">
                            Chargement...
                        </Text>
                    ) : (
                        <>
                            {/* Option de déselection */}
                            {allowDeselect && (
                                <Flex
                                    key="deselect-option"
                                    p={3}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleSelect('')}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor={borderColor}
                                    fontStyle="italic"
                                    color={placeholderColor}
                                >
                                    <Text>Aucune sélection</Text>
                                </Flex>
                            )}
                            
                            {/* Liste des options */}
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <Flex
                                        key={option.value}
                                        p={3}
                                        cursor="pointer"
                                        _hover={{ bg: hoverBg }}
                                        onClick={() => handleSelect(option.value)}
                                        align="center"
                                        borderBottom="1px solid"
                                        borderColor={borderColor}
                                        _last={{ borderBottom: "none" }}
                                        color={textColor}
                                        bg={bgColor}
                                    >
                                        <Box flex={1}>
                                            {option.content || (
                                                <Text fontWeight="medium">
                                                    {option.label}
                                                </Text>
                                            )}
                                        </Box>
                                    </Flex>
                                ))
                            ) : (
                                <Text p={3} color={placeholderColor} textAlign="center">
                                    {searchTerm ? "Aucun résultat" : "Aucune option disponible"}
                                </Text>
                            )}
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
};