import {
    Box, Button, Text, InputGroup, InputLeftElement, Input, Flex,
    useColorModeValue, IconButton,
    HStack,
    Badge,
    Avatar,
    Portal
} from "@chakra-ui/react";
import { ChevronDownIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { IUser, IGuild } from "../../interfaces";
import { getUserAvatarUrl } from "../../utils/discord";

interface UserSearchSelectProps {
    users: IUser[];
    selectedUserId: string;
    onUserSelect: (userId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
    guilds?: IGuild[];
    // Clé d'identification d'un item — par défaut _id (1 user = 1 item). Les appelants qui
    // listent des comptes bbs plutôt que des users (plusieurs items peuvent partager le même
    // _id) doivent passer une clé unique par compte, ex: (u) => u.bbs_id.
    getItemId?: (user: IUser) => string;
}

export const UserSearchSelect = ({
    users,
    selectedUserId,
    onUserSelect,
    searchQuery,
    onSearchChange,
    placeholder = "Choisir un utilisateur",
    guilds = [],
    getItemId = (user) => user._id || ''
}: UserSearchSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>(users || []);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, maxH: 300, openUp: false });
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedUser = users?.find(user => getItemId(user) === selectedUserId);

    // Créer une map des guildes pour un accès rapide
    const guildMap = useMemo(() => {
        const map: Record<string, string> = {};
        guilds?.forEach(guild => {
            if (guild._id) {
                map[guild._id] = guild.name;
            }
        });
        return map;
    }, [guilds]);

    // Fonction helper pour obtenir le nom de la guilde
    const getGuildName = (user: IUser) => {
        return user.guilde_id ? guildMap[user.guilde_id] : null;
    };

    // Filtrer les utilisateurs selon la recherche
    useEffect(() => {
        if (!users) {
            setFilteredUsers([]);
            return;
        }
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => {
                const query = searchQuery.toLowerCase();
                return (
                    (user.username && user.username.toLowerCase().includes(query)) ||
                    (user.global_name && user.global_name.toLowerCase().includes(query)) ||
                    (user.bbs_name && user.bbs_name.toLowerCase().includes(query))
                );
            });
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    // Gérer le clic en dehors du composant — le menu est en Portal (hors de menuRef), donc il
    // faut aussi exclure dropdownRef pour ne pas fermer le menu au clic dedans.
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
            // Focus sur l'input quand le menu s'ouvre
            setTimeout(() => inputRef.current?.focus(), 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Calcule la position du menu par rapport au trigger (en Portal, donc en coordonnées document)
    // — évite que le menu soit rogné par un ancêtre en overflow:hidden (ex: un Modal), cf. CustomSelect.
    const updateMenuPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const desiredMaxH = 300;
        const margin = 8;

        const openUp = spaceBelow < desiredMaxH && spaceAbove > spaceBelow;
        const availableSpace = openUp ? spaceAbove - margin : spaceBelow - margin;
        const maxH = Math.min(desiredMaxH, Math.max(100, availableSpace));

        setMenuPosition(openUp
            ? { top: rect.top + window.scrollY - maxH - 4, left: rect.left + window.scrollX, width: rect.width, maxH, openUp: true }
            : { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width, maxH, openUp: false }
        );
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

    const handleUserSelect = (user: IUser) => {
        onUserSelect(getItemId(user));
        setIsOpen(false);
        onSearchChange(''); // Reset search
    };

    const handleDeselect = (e: React.MouseEvent) => {
        e.stopPropagation(); // Empêcher l'ouverture du menu
        onUserSelect('');
        onSearchChange(''); // Reset search
    };

    // const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.600');
    const menuBg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.900', 'white');

    return (
        <Box position="relative" ref={menuRef}>
            <Box ref={triggerRef}>
            {selectedUser ? (
                // Affichage quand un utilisateur est sélectionné
                <Flex
                    w="100%"
                    px={2}
                    py={1}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={menuBg}
                    align="center"
                    justify="space-between"
                    color={textColor}
                >
                    <HStack flex={1} cursor="pointer" onClick={() => setIsOpen(!isOpen)}>
                        <Avatar
                            size="xs"
                            name={selectedUser.bbs_name || selectedUser.global_name}
                            src={getUserAvatarUrl(selectedUser) || undefined}
                        />
                        <Text fontWeight="medium">
                            {selectedUser.bbs_name || selectedUser.global_name}
                        </Text>
                        {getGuildName(selectedUser) && (
                            <Badge fontSize="xs" colorScheme="blue">
                                {getGuildName(selectedUser)}
                            </Badge>
                        )}
                    </HStack>
                    <Flex gap={1}>
                        <IconButton
                            aria-label="Changer d'utilisateur"
                            icon={<ChevronDownIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsOpen(!isOpen)}
                        />
                        <IconButton
                            aria-label="Désélectionner"
                            icon={<CloseIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={handleDeselect}
                            colorScheme="red"
                        />
                    </Flex>
                </Flex>
            ) : (
                // Bouton par défaut quand aucun utilisateur n'est sélectionné
                <Button
                    w="100%"
                    justifyContent="space-between"
                    variant="outline"
                    rightIcon={<ChevronDownIcon />}
                    onClick={() => setIsOpen(!isOpen)}
                    bg={menuBg}
                    borderColor={borderColor}
                    textAlign="left"
                    fontWeight="normal"
                    px={3}
                    py={2}
                    h="auto"
                    minH="40px"
                    color={textColor}
                    _hover={{ borderColor: "gray.300", bg: hoverBg }}
                >
                    <Text>{placeholder}</Text>
                </Button>
            )}
            </Box>

            {isOpen && (
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
                    display="flex"
                    flexDirection="column"
                >
                    {/* Input de recherche intégré */}
                    <Box p={2} borderBottom="1px solid" borderColor={borderColor} bg={menuBg} position="sticky" top={0} zIndex={1}>
                        <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                                ref={inputRef}
                                placeholder="Rechercher un utilisateur..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                bg="transparent"
                                border="1px solid"
                                borderColor={borderColor}
                                _focus={{
                                    borderColor: "blue.500",
                                    boxShadow: "0 0 0 1px blue.500"
                                }}
                            />
                        </InputGroup>
                    </Box>

                    {/* Liste des utilisateurs */}
                    <Box overflowY="auto">
                        {/* Option de déselection */}
                        <Flex
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: hoverBg }}
                            onClick={() => {
                                onUserSelect('');
                                setIsOpen(false);
                                onSearchChange('');
                            }}
                            align="center"
                            borderBottom="1px solid"
                            borderColor={borderColor}
                            fontStyle="italic"
                            color="gray.500"
                        >
                            <Text>Aucun utilisateur sélectionné</Text>
                        </Flex>

                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user: IUser) => (
                                <Flex
                                    key={getItemId(user)}
                                    p={3}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleUserSelect(user)}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor={borderColor}
                                    _last={{ borderBottom: "none" }}
                                >
                                    <HStack flex={1}>
                                        <Avatar
                                            size="xs"
                                            name={user.bbs_name || user.global_name}
                                            src={getUserAvatarUrl(user) || undefined}
                                        />
                                        <Text fontWeight="medium" color={textColor}>
                                            {user.bbs_name || user.global_name}
                                        </Text>
                                        {getGuildName(user) && (
                                            <Badge fontSize="xs" colorScheme="blue">
                                                {getGuildName(user)}
                                            </Badge>
                                        )}
                                    </HStack>
                                </Flex>
                            ))
                        ) : (
                            <Text p={3} color="gray.500" textAlign="center">
                                {searchQuery ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                            </Text>
                        )}
                    </Box>
                </Box>
                </Portal>
            )}
        </Box>
    );
};
