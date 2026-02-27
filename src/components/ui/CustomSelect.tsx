import {
    Box, Button, Text, Flex,
    useColorModeValue, Input, Portal
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, useCallback } from "react";
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
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, maxH: 250, openUp: false });
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isDragging = useRef(false);
    const dragStartY = useRef(0);
    const scrollStartTop = useRef(0);
    const hasDragged = useRef(false);

    const selectedOption = options.find(option => option.value === value);

    // Drag-to-scroll sur le dropdown
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if (!dropdownRef.current) return;
        // Ne pas activer le drag si on clique sur l'input de recherche
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        isDragging.current = true;
        hasDragged.current = false;
        dragStartY.current = e.clientY;
        scrollStartTop.current = dropdownRef.current.scrollTop;
        e.preventDefault(); // empêche la sélection de texte
    }, []);

    useEffect(() => {
        const handleDragMove = (e: MouseEvent) => {
            if (!isDragging.current || !dropdownRef.current) return;
            const delta = dragStartY.current - e.clientY;
            if (Math.abs(delta) > 3) hasDragged.current = true;
            dropdownRef.current.scrollTop = scrollStartTop.current + delta;
        };
        const handleDragEnd = () => {
            isDragging.current = false;
        };
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, []);

    // Gérer le clic en dehors du composant
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
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

    // Calculer la position du dropdown par rapport au trigger
    const updateMenuPosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const desiredMaxH = 250;
            const margin = 8;

            // Ouvrir vers le haut s'il n'y a pas assez de place en bas mais plus de place en haut
            const openUp = spaceBelow < desiredMaxH && spaceAbove > spaceBelow;
            const availableSpace = openUp ? spaceAbove - margin : spaceBelow - margin;
            const maxH = Math.min(desiredMaxH, Math.max(100, availableSpace));

            if (openUp) {
                setMenuPosition({
                    top: rect.top + window.scrollY - maxH - 4,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    maxH,
                    openUp: true
                });
            } else {
                setMenuPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    maxH,
                    openUp: false
                });
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateMenuPosition();
            window.addEventListener('scroll', updateMenuPosition, true);
            window.addEventListener('resize', updateMenuPosition);
        }
        return () => {
            window.removeEventListener('scroll', updateMenuPosition, true);
            window.removeEventListener('resize', updateMenuPosition);
        };
    }, [isOpen, updateMenuPosition]);

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
        // Ignorer le clic si l'utilisateur a fait un drag-scroll
        if (hasDragged.current) {
            hasDragged.current = false;
            return;
        }
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
            <Box ref={triggerRef}>
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
            </Box>

            {isOpen && !isDisabled && (
                <Portal>
                <Box
                    ref={dropdownRef}
                    position="absolute"
                    top={`${menuPosition.top}px`}
                    left={`${menuPosition.left}px`}
                    width={`${menuPosition.width}px`}
                    zIndex={9999}
                    bg={menuBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    boxShadow="xl"
                    maxH={`${menuPosition.maxH}px`}
                    overflowY="auto"
                    mt={1}
                    cursor="grab"
                    userSelect="none"
                    onMouseDown={handleDragStart}
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
                </Portal>
            )}
        </Box>
    );
};