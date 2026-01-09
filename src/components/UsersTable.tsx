import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, VStack,
    Text, Input, InputGroup, InputLeftElement, Select, Spinner,
    useColorModeValue, Badge, Flex, IconButton, useDisclosure
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon, EditIcon } from "@chakra-ui/icons";
import type { IUser, IPagination, IUsersResponse } from "../interfaces";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import EditUserModal from "./EditUserModal";
import { UserDisplay } from "./ui/UserDisplay";
import { useGuilds } from "@/hooks/useAPI";

interface UsersTableProps {
    isAdminMode?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ isAdminMode = false }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // États - Initialiser avec les paramètres URL
    const [users, setUsers] = useState<IUser[]>([]);
    const [pagination, setPagination] = useState<IPagination | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [selectedGuildId, setSelectedGuildId] = useState(searchParams.get('guilde_id') || "");
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || "");
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '20'));
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    // Utiliser useSWR pour les guildes (cache automatique)
    const { guilds } = useGuilds();

    // Hooks UI
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const badgeVariant = useColorModeValue('subtle', 'solid');
    const filterBg = useColorModeValue('blue.50', 'blue.900');
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();

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

    // Fonction principale pour charger les utilisateurs
    const loadUsers = async (page = 1, search = "", guildId = "", role = "") => {
        setIsLoading(true);
        try {
            // Construction de l'URL avec tous les paramètres
            let url = `${apiUrl}/api/users?page=${page}&limit=${itemsPerPage}`;

            // Ajout des paramètres de filtrage s'ils sont présents
            if (search && search.trim() !== "") {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }
            if (guildId && guildId.trim() !== "") {
                url += `&guilde_id=${encodeURIComponent(guildId.trim())}`;
            }
            if (role && role.trim() !== "") {
                url += `&role=${encodeURIComponent(role.trim())}`;
            }

            const response = await fetch(url);

            if (response.ok) {
                const data: IUsersResponse = await response.json();
                if (data.success) {
                    setUsers(data.users);
                    setPagination(data.pagination);
                } else {
                    setUsers([]);
                    setPagination(null);
                }
            } else {
                setUsers([]);
                setPagination(null);
            }
        } catch (error) {
            setUsers([]);
            setPagination(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Chargement initial
    useEffect(() => {
        const currentPage = parseInt(searchParams.get('page') || '1');
        const currentSearch = searchParams.get('search') || '';
        const currentGuildId = searchParams.get('guilde_id') || '';
        const currentRole = searchParams.get('role') || '';

        setSearchTerm(currentSearch);
        setSelectedGuildId(currentGuildId);
        setSelectedRole(currentRole);

        loadUsers(currentPage, currentSearch, currentGuildId, currentRole);
    }, []);

    // Effet pour la recherche automatique avec debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Ne déclencher la recherche que si le terme a changé
            const currentSearchFromURL = searchParams.get('search') || '';
            if (searchTerm !== currentSearchFromURL) {
                loadUsers(1, searchTerm, selectedGuildId, selectedRole);
                updateURLParams(searchTerm, selectedGuildId, selectedRole, itemsPerPage, 1);
            }
        }, 500); // Délai de 500ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm]); // Se déclenche quand searchTerm change

    // Gestionnaires d'événements
    const handleGuildChange = (guildId: string) => {
        setSelectedGuildId(guildId);
        loadUsers(1, searchTerm, guildId, selectedRole);
        updateURLParams(searchTerm, guildId, selectedRole, itemsPerPage, 1);
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        loadUsers(1, searchTerm, selectedGuildId, role);
        updateURLParams(searchTerm, selectedGuildId, role, itemsPerPage, 1);
    };

    const handlePageChange = (page: number) => {
        loadUsers(page, searchTerm, selectedGuildId, selectedRole);
        updateURLParams(searchTerm, selectedGuildId, selectedRole, itemsPerPage, page);
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        loadUsers(1, searchTerm, selectedGuildId, selectedRole);
        updateURLParams(searchTerm, selectedGuildId, selectedRole, newLimit, 1);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedGuildId("");
        setSelectedRole("");
        setSearchParams({});
        loadUsers(1);
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

    // Gestionnaire pour la mise à jour d'un utilisateur
    const handleUserUpdated = () => {
        // Recharger les utilisateurs après modification
        const currentPage = parseInt(searchParams.get('page') || '1');
        loadUsers(currentPage, searchTerm, selectedGuildId, selectedRole);
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
                    <Select
                        placeholder="Toutes les guildes"
                        value={selectedGuildId}
                        onChange={(e) => handleGuildChange(e.target.value)}
                        maxW="200px"
                    >
                        {guilds.map((guild) => (
                            <option key={guild._id} value={guild._id}>
                                {guild.name}
                            </option>
                        ))}
                    </Select>

                    {/* Filtre par rôle */}
                    <Select
                        placeholder="Tous les rôles"
                        value={selectedRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        maxW="150px"
                    >
                        <option value="chef">Chef</option>
                        <option value="sous-chef">Sous-chef</option>
                        <option value="membre">Membre</option>
                    </Select>

                    {/* Éléments par page */}
                    <Select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                        maxW="120px"
                    >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                    </Select>

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
                                <Th>Dernière connexion</Th>
                                {isAdminMode && <Th>Actions</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user) => (
                                <Tr key={user._id} _hover={{ bg: hoverBg }}>
                                    <Td>
                                        <HStack spacing={3}>
                                            <UserDisplay user={user} />
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
                                    {isAdminMode && (
                                        <Td>
                                            <IconButton
                                                aria-label="Modifier l'utilisateur"
                                                icon={<EditIcon />}
                                                size="sm"
                                                colorScheme="blue"
                                                variant="outline"
                                                onClick={() => handleEditUser(user)}
                                            />
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
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={onEditModalClose}
                    user={selectedUser}
                    guilds={guilds}
                    onUserUpdated={handleUserUpdated}
                />
            )}
        </VStack>
    );
}

export default UsersTable;