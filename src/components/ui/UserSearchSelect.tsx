import {
    Box, Button, Text, InputGroup, InputLeftElement, Input, Flex,
    useColorModeValue, IconButton
} from "@chakra-ui/react";
import { ChevronDownIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import type { User } from "../../interfaces";

interface UserSearchSelectProps {
    users: User[];
    selectedUserId: string;
    onUserSelect: (userId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
}

export const UserSearchSelect = ({
    users,
    selectedUserId,
    onUserSelect,
    searchQuery,
    onSearchChange,
    placeholder = "Choisir un utilisateur"
}: UserSearchSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedUser = users.find(user => user._id === selectedUserId);

    // Filtrer les utilisateurs selon la recherche
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.global_name && user.global_name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    // Gérer le clic en dehors du composant
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

    const handleUserSelect = (user: User) => {
        onUserSelect(user._id || '');
        setIsOpen(false);
        onSearchChange(''); // Reset search
    };

    const handleDeselect = (e: React.MouseEvent) => {
        e.stopPropagation(); // Empêcher l'ouverture du menu
        onUserSelect('');
        onSearchChange(''); // Reset search
    };

    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.600');
    const menuBg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.900', 'white');

    return (
        <Box position="relative" ref={menuRef}>
            {selectedUser ? (
                // Affichage quand un utilisateur est sélectionné
                <Flex
                    w="100%"
                    p={3}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={bgColor}
                    align="center"
                    justify="space-between"
                    color={textColor}
                >
                    <Box flex={1} cursor="pointer" onClick={() => setIsOpen(!isOpen)}>
                        <Text fontWeight="medium">
                            {selectedUser.bbs_name || selectedUser.global_name}
                        </Text>
                        {selectedUser.discord_id && (
                            <Text fontSize="xs" color="gray.500">
                                Discord: {selectedUser.discord_id}
                            </Text>
                        )}
                    </Box>
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
                    bg={bgColor}
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

            {isOpen && (
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
                    {/* Input de recherche intégré */}
                    <Box p={2} borderBottom="1px solid" borderColor={borderColor}>
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
                    <Box maxH="200px" overflowY="auto">
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
                            filteredUsers.map((user: User) => (
                                <Flex
                                    key={user._id}
                                    p={3}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleUserSelect(user)}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor={borderColor}
                                    _last={{ borderBottom: "none" }}
                                >
                                    <Box flex={1}>
                                        <Text fontWeight="medium" color={textColor}>
                                            {user.bbs_name || user.global_name}
                                        </Text>
                                        {user.discord_id && (
                                            <Text fontSize="xs" color="gray.500">
                                                Discord: {user.discord_id}
                                            </Text>
                                        )}
                                    </Box>
                                </Flex>
                            ))
                        ) : (
                            <Text p={3} color="gray.500" textAlign="center">
                                {searchQuery ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                            </Text>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};