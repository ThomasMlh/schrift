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
    renderSelected?: (option: SelectOption) => ReactNode;
    bg?: string;
    enableSearch?: boolean;
    onSearchChange?: (search: string) => void;
    isLoading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    accentColor?: string;
    maxW?: string | object;
    w?: string | object;
    flex?: string | number;
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
    size = 'md',
    accentColor,
    maxW,
    w,
    flex
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
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

    // Réinitialiser la recherche et le highlight quand on ferme le menu
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            setHighlightedIndex(-1);
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

    // Construire la liste plate de toutes les options (pour la navigation clavier)
    const getAllOptions = useCallback(() => {
        const all: SelectOption[] = [];
        // Options de déselection en premier si allowDeselect
        if (allowDeselect) {
            all.push({ value: '', label: 'Aucune sélection' });
        }
        // Options non groupées
        const ug: SelectOption[] = [];
        const go: { [key: string]: SelectOption[] } = {};
        const filtered = enableSearch && !onSearchChange
            ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
            : options;
        filtered.forEach(option => {
            if (option.group) {
                if (!go[option.group]) go[option.group] = [];
                go[option.group].push(option);
            } else {
                ug.push(option);
            }
        });
        all.push(...ug);
        Object.entries(go)
            .sort(([a], [b]) => {
                const numA = Number(a);
                const numB = Number(b);
                if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
                return a.localeCompare(b);
            })
            .forEach(([, groupOpts]) => all.push(...groupOpts));
        return all;
    }, [options, allowDeselect, enableSearch, onSearchChange, searchTerm]);

    // Scroll l'option highlighted dans la vue
    const scrollHighlightedIntoView = useCallback((index: number) => {
        if (!dropdownRef.current) return;
        const items = dropdownRef.current.querySelectorAll('[data-option-index]');
        const target = items[index] as HTMLElement | undefined;
        if (target) {
            target.scrollIntoView({ block: 'nearest' });
        }
    }, []);

    // Gestion clavier pour l'accessibilité
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isDisabled) return;
        const allOptions = getAllOptions();
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
                    // Confirmer la sélection
                    handleSelect(allOptions[highlightedIndex].value);
                } else {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        // Positionner le highlight sur la valeur actuelle
                        const idx = allOptions.findIndex(o => o.value === value);
                        setHighlightedIndex(idx >= 0 ? idx : 0);
                    }
                }
                break;
            case ' ':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    const idx = allOptions.findIndex(o => o.value === value);
                    setHighlightedIndex(idx >= 0 ? idx : 0);
                } else if (highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
                    handleSelect(allOptions[highlightedIndex].value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    const idx = allOptions.findIndex(o => o.value === value);
                    setHighlightedIndex(idx >= 0 ? idx : 0);
                } else {
                    const nextIndex = highlightedIndex < allOptions.length - 1 ? highlightedIndex + 1 : highlightedIndex;
                    setHighlightedIndex(nextIndex);
                    scrollHighlightedIntoView(nextIndex);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    const idx = allOptions.findIndex(o => o.value === value);
                    setHighlightedIndex(idx >= 0 ? idx : 0);
                } else {
                    const prevIndex = highlightedIndex > 0 ? highlightedIndex - 1 : 0;
                    setHighlightedIndex(prevIndex);
                    scrollHighlightedIntoView(prevIndex);
                }
                break;
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
        <Box position="relative" ref={menuRef} maxW={maxW} w={w} flex={flex}>
            <Box ref={triggerRef}>
            {selectedOption ? (
                // Affichage quand une option est sélectionnée
                <Flex
                    w="100%"
                    px={currentSizeProps.px}
                    py={currentSizeProps.py}
                    border="1px solid"
                    borderColor={accentColor || borderColor}
                    borderRadius="md"
                    bg={bgColor}
                    align="center"
                    justify="space-between"
                    cursor={isDisabled ? "not-allowed" : "pointer"}
                    opacity={isDisabled ? 0.6 : 1}
                    _hover={!isDisabled ? { borderColor: accentColor || "gray.300" } : {}}
                    _focus={{ boxShadow: "outline", outline: "none" }}
                    color={textColor}
                    h={currentSizeProps.minH}
                    minH={currentSizeProps.minH}
                    fontSize={currentSizeProps.fontSize}
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    tabIndex={isDisabled ? -1 : 0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    {...(isOpen && accentColor ? { boxShadow: `0 0 0 1px var(--chakra-colors-${accentColor.replace('.', '-')})` } : {})}
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
                    justifyContent="space-between"
                    variant="outline"
                    rightIcon={<ChevronDownIcon />}
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    bg={bgColor}
                    borderColor={accentColor || borderColor}
                    textAlign="left"
                    fontWeight="normal"
                    px={currentSizeProps.px}
                    py={currentSizeProps.py}
                    h={currentSizeProps.minH}
                    minH={currentSizeProps.minH}
                    fontSize={currentSizeProps.fontSize}
                    isDisabled={isDisabled}
                    color={textColor}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    _hover={!isDisabled ? { borderColor: accentColor || "gray.300", bg: hoverBg } : {}}
                    {...(isOpen && accentColor ? { boxShadow: `0 0 0 1px var(--chakra-colors-${accentColor.replace('.', '-')})` } : {})}
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
                                    data-option-index={0}
                                    px={currentSizeProps.px}
                                    py={currentSizeProps.py}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    bg={highlightedIndex === 0 ? hoverBg : undefined}
                                    onClick={() => handleSelect('')}
                                    onMouseEnter={() => setHighlightedIndex(0)}
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
                            {ungroupedOptions.length > 0 && ungroupedOptions.map((option, idx) => {
                                const flatIndex = (allowDeselect ? 1 : 0) + idx;
                                return (
                                <Flex
                                    key={option.value}
                                    data-option-index={flatIndex}
                                    px={currentSizeProps.px}
                                    py={currentSizeProps.py}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    bg={highlightedIndex === flatIndex ? hoverBg : bgColor}
                                    onClick={() => handleSelect(option.value)}
                                    onMouseEnter={() => setHighlightedIndex(flatIndex)}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor={borderColor}
                                    color={textColor}
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
                                );
                            })}

                            {/* Options groupées */}
                            {(() => {
                                let runningIndex = (allowDeselect ? 1 : 0) + ungroupedOptions.length;
                                return Object.entries(groupedOptions)
                                    .sort(([a], [b]) => {
                                        const numA = Number(a);
                                        const numB = Number(b);
                                        if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
                                        return a.localeCompare(b);
                                    })
                                    .map(([groupName, groupOptions]) => {
                                        const groupStartIndex = runningIndex;
                                        runningIndex += groupOptions.length;
                                        return (
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
                                        {groupOptions.map((option, idx) => {
                                            const flatIndex = groupStartIndex + idx;
                                            return (
                                            <Flex
                                                key={option.value}
                                                data-option-index={flatIndex}
                                                px={currentSizeProps.px}
                                                py={currentSizeProps.py}
                                                cursor="pointer"
                                                _hover={{ bg: hoverBg }}
                                                bg={highlightedIndex === flatIndex ? hoverBg : bgColor}
                                                onClick={() => handleSelect(option.value)}
                                                onMouseEnter={() => setHighlightedIndex(flatIndex)}
                                                align="center"
                                                borderBottom="1px solid"
                                                borderColor={borderColor}
                                                _last={{ borderBottom: "none" }}
                                                color={textColor}
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
                                            );
                                        })}
                                    </Box>
                                        );
                                    });
                            })()}

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