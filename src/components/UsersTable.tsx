import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, VStack,
    Text, Input, InputGroup, InputLeftElement, Spinner,
    useColorModeValue, Badge, Flex, IconButton, useDisclosure, Tooltip
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon, EditIcon, NotAllowedIcon, CheckCircleIcon } from "@chakra-ui/icons";
import type { IUser } from "../interfaces";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import EditUserModal from "./EditUserModal";
import BanUserModal from "./BanUserModal";
import UnbanUserModal from "./UnbanUserModal";
import { UserDisplay } from "./ui/UserDisplay";
import { CustomSelect } from "./ui/CustomSelect";
import { useGuilds, useUsers } from "@/hooks/useAPI";

interface UsersTableProps {
    isAdminMode?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ isAdminMode = false }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // États - Initialiser avec les paramètres URL
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || "");
    const [selectedGuildId, setSelectedGuildId] = useState(searchParams.get('guilde_id') || "");
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || "");
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '20'));
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    // Utiliser useSWR pour les guildes (cache automatique)
    const { guilds } = useGuilds();

    // Hook useUsers avec les paramètres de filtrage
    const apiOptions = useMemo(() => ({
        authenticated: false,
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(selectedGuildId && { guilde_id: selectedGuildId }),
        ...(selectedRole && { role: selectedRole }),
    }), [currentPage, itemsPerPage, debouncedSearch, selectedGuildId, selectedRole]);

    const { users, pagination, isLoading, mutate } = useUsers(apiOptions);

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const badgeVariant = useColorModeValue('subtle', 'solid');
    const filterBg = useColorModeValue('blue.50', 'blue.900');
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isBanModalOpen, onOpen: onBanModalOpen, onClose: onBanModalClose } = useDisclosure();
    const { isOpen: isUnbanModalOpen, onOpen: onUnbanModalOpen, onClose: onUnbanModalClose } = useDisclosure();

    // Fonction pour mettre à jour l'URL avec les filtres actuels
    const updateURLParams = (search = "", guildId = "", role = "", limit = itemsPerPage, page = 1) => {
        const params = new URLSearchParams();

        if (search.trim()) params.set('search', search.trim());
        if (guildId) params.set('guilde_id', guildId);
        if (role) params.set('role', role);
        if (limit !== 20) params.set('limit', limit.toString());
        if (page !== 1) params.set('page', page.toString());

        setSearchParams(params);
    };

    // Effet pour le debounce de la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (debouncedSearch !== searchTerm) {
                setDebouncedSearch(searchTerm);
                setCurrentPage(1);
                updateURLParams(searchTerm, selectedGuildId, selectedRole, itemsPerPage, 1);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Gestionnaires d'événements
    const handleGuildChange = (guildId: string) => {
        setSelectedGuildId(guildId);
        setCurrentPage(1);
        updateURLParams(searchTerm, guildId, selectedRole, itemsPerPage, 1);
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setCurrentPage(1);
        updateURLParams(searchTerm, selectedGuildId, role, itemsPerPage, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateURLParams(searchTerm, selectedGuildId, selectedRole, itemsPerPage, page);
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        updateURLParams(searchTerm, selectedGuildId, selectedRole, newLimit, 1);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        setSelectedGuildId("");
        setSelectedRole("");
        setCurrentPage(1);
        setSearchParams({});
    };

    // Obtenir le nom de la guilde
    const getGuildName = (guildId: string) => {
        const guild = guilds.find(g => g._id === guildId);
        return guild?.name || "Pas de guilde";
    };

    // Obtenir la couleur du badge selon le rôle
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "chef": return "red";
            case "sous-chef": return "orange";
            case "membre": return "blue";
            default: return "gray";
        }
    };

    // Gestionnaire pour ouvrir le modal d'édition
    const handleEditUser = (user: IUser) => {
        setSelectedUser(user);
        onEditModalOpen();
    };

    // Gestionnaire pour ouvrir le modal de bannissement
    const handleBanUser = (user: IUser) => {
        setSelectedUser(user);
        onBanModalOpen();
    };

    // Gestionnaire pour ouvrir le modal de débannissement
    const handleUnbanUser = (user: IUser) => {
        setSelectedUser(user);
        onUnbanModalOpen();
    };

    // Gestionnaire pour la mise à jour d'un utilisateur
    const handleUserUpdated = () => {
        mutate();
    };

    return (
        <VStack spacing={6} align="stretch" w="100%">
            {/* Contrôles de filtrage */}
            <VStack spacing={4} align="stretch">
                {/* Première ligne - Recherche */}
                <Flex justify="center">
                    <InputGroup maxW="500px">
                        <InputLeftElement pointerEvents="none">
                            {isLoading ? (
                                <Spinner size="sm" color="blue.500" />
                            ) : (
                                <SearchIcon color="gray.300" />
                            )}
                        </InputLeftElement>
                        <Input
                            placeholder="Rechercher un joueur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Flex>

                {/* Deuxième ligne - Filtres */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                    justify="center"
                    align="center"
                    wrap="wrap"
                >
                    {/* Filtre par guilde */}
                    <CustomSelect
                        placeholder="Toutes les guildes"
                        value={selectedGuildId}
                        onChange={(value) => handleGuildChange(value)}
                        options={guilds.map((guild) => ({
                            value: guild._id,
                            label: guild.name
                        }))}
                        maxW="200px"
                    />

                    {/* Filtre par rôle */}
                    <CustomSelect
                        placeholder="Tous les rôles"
                        value={selectedRole}
                        onChange={(value) => handleRoleChange(value)}
                        options={[
                            { value: "chef", label: "Chef" },
                            { value: "sous-chef", label: "Sous-chef" },
                            { value: "membre", label: "Membre" }
                        ]}
                        maxW="150px"
                    />

                    {/* Éléments par page */}
                    <CustomSelect
                        value={String(itemsPerPage)}
                        onChange={(value) => handleItemsPerPageChange(parseInt(value))}
                        options={[
                            { value: "10", label: "10 / page" },
                            { value: "20", label: "20 / page" },
                            { value: "50", label: "50 / page" },
                            { value: "100", label: "100 / page" }
                        ]}
                        allowDeselect={false}
                        maxW="150px"
                    />

                    <Button onClick={resetFilters} variant="outline" minW="120px">
                        Réinitialiser
                    </Button>
                </Flex>
            </VStack>

            {/* Filtres actifs */}
            {(searchTerm || selectedGuildId || selectedRole) && (
                <Box p={3} bg={filterBg} borderRadius="md">
                    <HStack spacing={2} flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="medium">Filtres actifs:</Text>
                        {searchTerm && (
                            <Badge colorScheme="blue" variant={badgeVariant}>
                                Recherche: {searchTerm}
                            </Badge>
                        )}
                        {selectedGuildId && (
                            <Badge colorScheme="green" variant={badgeVariant}>
                                Guilde: {getGuildName(selectedGuildId)}
                            </Badge>
                        )}
                        {selectedRole && (
                            <Badge colorScheme={getRoleBadgeColor(selectedRole)} variant={badgeVariant}>
                                Rôle: {selectedRole}
                            </Badge>
                        )}
                    </HStack>
                </Box>
            )}

            {/* Informations sur les résultats */}
            {pagination && (
                <Text fontSize="sm" color="gray.600">
                    {pagination.totalCount} utilisateur(s) trouvé(s) -
                    Page {pagination.currentPage} sur {pagination.totalPages} -
                    Affichage de {pagination.itemsOnPage} résultat(s)
                </Text>
            )}

            {/* Tableau des utilisateurs */}
            <Box overflowX="auto" bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                {isLoading ? (
                    <Flex justify="center" p={8}>
                        <Spinner size="lg" />
                    </Flex>
                ) : (
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Utilisateur</Th>
                                <Th>Guilde</Th>
                                <Th>Rôle</Th>
                                {isAdminMode && <Th>BBS ID</Th>}
                                {isAdminMode && <Th>BBS Name</Th>}
                                {isAdminMode && <Th>Dernière connexion</Th>}
                                {isAdminMode && <Th>Actions</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user: IUser) => (
                                <Tr key={user._id} _hover={{ bg: hoverBg }} opacity={user.is_banned ? 0.6 : 1}>
                                    <Td>
                                        <HStack spacing={3}>
                                            <UserDisplay user={user} />
                                            {user.is_banned && (
                                                <Badge colorScheme="red" fontSize="xs">Banni</Badge>
                                            )}
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <Text>{user.guilde_id ? getGuildName(user.guilde_id) : 'Aucune guilde'}</Text>
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={getRoleBadgeColor(user.role)}
                                            variant={badgeVariant}
                                            textTransform="capitalize"
                                        >
                                            {user.role}
                                        </Badge>
                                    </Td>
                                    {isAdminMode && (
                                        <Td>
                                            <Text fontSize="sm">
                                                {user.bbs_id || "-"}
                                            </Text>
                                        </Td>
                                    )}
                                    {isAdminMode && (
                                        <Td>
                                            <Text fontSize="sm">
                                                {user.bbs_name || "-"}
                                            </Text>
                                        </Td>
                                    )}
                                    {isAdminMode && (
                                        <Td>
                                            <Text fontSize="sm">
                                                {user.last_login
                                                    ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : "-"
                                                }
                                            </Text>
                                        </Td>
                                    )}
                                    {isAdminMode && (
                                        <Td>
                                            <HStack spacing={2}>
                                                <Tooltip label="Modifier">
                                                    <IconButton
                                                        aria-label="Modifier l'utilisateur"
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        variant="outline"
                                                        onClick={() => handleEditUser(user)}
                                                    />
                                                </Tooltip>
                                                {!user.is_admin && (
                                                    user.is_banned ? (
                                                        <Tooltip label="Débannir">
                                                            <IconButton
                                                                aria-label="Débannir l'utilisateur"
                                                                icon={<CheckCircleIcon />}
                                                                size="sm"
                                                                colorScheme="green"
                                                                variant="outline"
                                                                onClick={() => handleUnbanUser(user)}
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip label="Bannir">
                                                            <IconButton
                                                                aria-label="Bannir l'utilisateur"
                                                                icon={<NotAllowedIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="outline"
                                                                onClick={() => handleBanUser(user)}
                                                            />
                                                        </Tooltip>
                                                    )
                                                )}
                                            </HStack>
                                        </Td>
                                    )}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            {/* Pagination */}
            {pagination && (
                <PaginationComponent
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    hasPrevPage={pagination.hasPrevPage}
                    hasNextPage={pagination.hasNextPage}
                    onPageChange={handlePageChange}
                    totalCount={pagination.totalCount}
                    itemsOnPage={pagination.itemsOnPage}
                />
            )}

            {/* Message si aucun résultat */}
            {!isLoading && users.length === 0 && (
                <Text textAlign="center" color="gray.500" py={8}>
                    Aucun utilisateur trouvé
                </Text>
            )}

            {/* Modal d'édition d'utilisateur */}
            {isAdminMode && (
                <>
                    <EditUserModal
                        isOpen={isEditModalOpen}
                        onClose={onEditModalClose}
                        user={selectedUser}
                        guilds={guilds}
                        onUserUpdated={handleUserUpdated}
                    />
                    <BanUserModal
                        isOpen={isBanModalOpen}
                        onClose={onBanModalClose}
                        user={selectedUser}
                        onUserUpdated={handleUserUpdated}
                    />
                    <UnbanUserModal
                        isOpen={isUnbanModalOpen}
                        onClose={onUnbanModalClose}
                        user={selectedUser}
                        onUserUpdated={handleUserUpdated}
                    />
                </>
            )}
        </VStack>
    );
}

export default UsersTable;