import {
    Box, Button, Text, Flex,
    useColorModeValue, Input
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface SelectOption {
    value: string;
    label: string;
    content?: ReactNode; // Pour afficher du contenu personnalisé
    group?: string; // Groupe optionnel pour regroupement
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
    size?: 'sm' | 'md' | 'lg'; // Taille du select
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
    isLoading = false,
    size = 'md'
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
    const groupHeaderBg = useColorModeValue('gray.100', 'gray.700');
    const groupHeaderColor = useColorModeValue('blue.600', 'blue.300');
    const backgroundOption = useColorModeValue('gray.300', 'gray.600');
    const backgroundOptionHover = useColorModeValue('gray.400', 'gray.500');

    // Tailles selon le size prop
    const sizeProps = {
        sm: { px: 2, py: 2, minH: "32px", fontSize: "sm" },
        md: { px: 3, py: 2.5, minH: "40px", fontSize: "md" },
        lg: { px: 4, py: 3, minH: "48px", fontSize: "lg" }
    };

    const currentSizeProps = sizeProps[size];

    // Grouper les options par groupe si défini
    const groupedOptions: { [key: string]: SelectOption[] } = {};
    const ungroupedOptions: SelectOption[] = [];

    filteredOptions.forEach(option => {
        if (option.group) {
            if (!groupedOptions[option.group]) {
                groupedOptions[option.group] = [];
            }
            groupedOptions[option.group].push(option);
        } else {
            ungroupedOptions.push(option);
        }
    });

    return (
        <Box position="relative" ref={menuRef}>
            {selectedOption ? (
                // Affichage quand une option est sélectionnée
                <Flex
                    w="100%"
                    minW="150px"
                    px={currentSizeProps.px}
                    py={currentSizeProps.py}
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
                    h={currentSizeProps.minH}
                    minH={currentSizeProps.minH}
                    fontSize={currentSizeProps.fontSize}
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                >
                    <Box 
                        flex={1}
                        overflow="hidden"
                    >
                        {renderSelected ? renderSelected(selectedOption) : (
                            <Text fontWeight="medium" isTruncated>
                                {selectedOption.label}
                            </Text>
                        )}
                    </Box>
                    <ChevronDownIcon 
                        boxSize={currentSizeProps.fontSize === "sm" ? 4 : currentSizeProps.fontSize === "lg" ? 6 : 5}
                        color={textColor}
                    />
                </Flex>
            ) : (
                // Bouton par défaut quand aucune option n'est sélectionnée
                <Button
                    w="100%"
                    minW="150px"
                    justifyContent="space-between"
                    variant="outline"
                    rightIcon={<ChevronDownIcon />}
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    bg={bgColor}
                    borderColor={borderColor}
                    textAlign="left"
                    fontWeight="normal"
                    px={currentSizeProps.px}
                    py={currentSizeProps.py}
                    h={currentSizeProps.minH}
                    minH={currentSizeProps.minH}
                    fontSize={currentSizeProps.fontSize}
                    isDisabled={isDisabled}
                    color={textColor}
                    _hover={!isDisabled ? { borderColor: "gray.300", bg: hoverBg } : {}}
                >
                    <Text color={placeholderColor} isTruncated>{placeholder}</Text>
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
                    maxH="250px"
                    overflowY="auto"
                    mt={1}
                    sx={{
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: backgroundOption,
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: backgroundOptionHover,
                        },
                    }}
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
                                    px={currentSizeProps.px}
                                    py={currentSizeProps.py}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleSelect('')}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor={borderColor}
                                    fontStyle="italic"
                                    color={placeholderColor}
                                    fontSize={currentSizeProps.fontSize}
                                >
                                    <Text>Aucune sélection</Text>
                                </Flex>
                            )}
                            
                            {/* Options non groupées */}
                            {ungroupedOptions.length > 0 && ungroupedOptions.map((option) => (
                                <Flex
                                    key={option.value}
                                    px={currentSizeProps.px}
                                    py={currentSizeProps.py}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleSelect(option.value)}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor={borderColor}
                                    color={textColor}
                                    bg={bgColor}
                                    fontSize={currentSizeProps.fontSize}
                                >
                                    <Box flex={1}>
                                        {option.content || (
                                            <Text fontWeight="medium">
                                                {option.label}
                                            </Text>
                                        )}
                                    </Box>
                                </Flex>
                            ))}

                            {/* Options groupées */}
                            {Object.entries(groupedOptions)
                                .sort(([a], [b]) => {
                                    // Trier par ordre décroissant (années les plus récentes en premier)
                                    const numA = Number(a);
                                    const numB = Number(b);
                                    if (!isNaN(numA) && !isNaN(numB)) {
                                        return numB - numA;
                                    }
                                    // Pour les groupes non numériques, ordre alphabétique
                                    return a.localeCompare(b);
                                })
                                .map(([groupName, groupOptions]) => (
                                <Box key={groupName}>
                                    <Box
                                        px={currentSizeProps.px}
                                        py={1.5}
                                        bg={groupHeaderBg}
                                        borderBottom="1px solid"
                                        borderColor={borderColor}
                                        position="sticky"
                                        top={enableSearch ? "40px" : 0}
                                        zIndex={2}
                                    >
                                        <Text 
                                            fontSize="xs" 
                                            fontWeight="bold" 
                                            color={groupHeaderColor}
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                        >
                                            {groupName}
                                        </Text>
                                    </Box>
                                    {groupOptions.map((option) => (
                                        <Flex
                                            key={option.value}
                                            px={currentSizeProps.px}
                                            py={currentSizeProps.py}
                                            cursor="pointer"
                                            _hover={{ bg: hoverBg }}
                                            onClick={() => handleSelect(option.value)}
                                            align="center"
                                            borderBottom="1px solid"
                                            borderColor={borderColor}
                                            _last={{ borderBottom: "none" }}
                                            color={textColor}
                                            bg={bgColor}
                                            fontSize={currentSizeProps.fontSize}
                                        >
                                            <Box flex={1}>
                                                {option.content || (
                                                    <Text fontWeight="medium">
                                                        {option.label}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Flex>
                                    ))}
                                </Box>
                            ))}

                            {/* Message si aucune option */}
                            {ungroupedOptions.length === 0 && Object.keys(groupedOptions).length === 0 && (
                                <Text px={currentSizeProps.px} py={3} color={placeholderColor} textAlign="center" fontSize={currentSizeProps.fontSize}>
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