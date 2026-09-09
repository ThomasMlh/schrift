import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, VStack,
    Text, Input, InputGroup, InputLeftElement, Spinner,
    useColorMode, Badge, Flex, IconButton, useDisclosure, Tooltip, Skeleton
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon, EditIcon, NotAllowedIcon, CheckCircleIcon, StarIcon } from "@chakra-ui/icons";
import type { IUser } from "../interfaces";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import EditUserModal from "./EditUserModal";
import BanUserModal from "./BanUserModal";
import UnbanUserModal from "./UnbanUserModal";
import CreateManualUserModal from "./CreateManualUserModal";
import { UserDisplay } from "./ui/UserDisplay";
import { CustomSelect } from "./ui/CustomSelect";
import { useGuilds, useUsers, useUserAccounts } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";

interface UsersTableProps {
    isAdminMode?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ isAdminMode = false }) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // États - Initialiser avec les paramètres URL
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || "");
    const [selectedGuildId, setSelectedGuildId] = useState("");
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || "");
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '20'));
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    // Utiliser useSWR pour les guildes (cache automatique)
    const { guilds } = useGuilds();

    // Résolution guild_name depuis l'URL → _id
    useEffect(() => {
        if (!guilds.length) return;
        const name = searchParams.get('guild_name');
        if (!name || selectedGuildId) return;
        const guild = guilds.find(g => g.name === name);
        if (guild) setSelectedGuildId(guild._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guilds]);

    const selectedGuildName = useMemo(
        () => guilds.find(g => g._id === selectedGuildId)?.name || "",
        [guilds, selectedGuildId]
    );

    // Paramètres de filtrage communs aux deux modes
    const apiOptions = useMemo(() => ({
        authenticated: false,
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(selectedGuildId && { guilde_id: selectedGuildId }),
        ...(selectedRole && { role: selectedRole }),
    }), [currentPage, itemsPerPage, debouncedSearch, selectedGuildId, selectedRole]);

    // Mode admin : une ligne par user Discord (ban/édition sont des actions par identité Discord).
    // Mode public : une ligne par compte bbs — un joueur avec plusieurs comptes apparaît plusieurs
    // fois, chacun avec sa propre guilde/rôle, cohérent avec le classement et les rosters de guilde.
    const {
        users: adminUsers, pagination: adminPagination,
        isLoading: adminLoading, mutate: adminMutate
    } = useUsers({ ...apiOptions, enabled: isAdminMode });
    const {
        accounts: publicAccounts, pagination: publicPagination,
        isLoading: publicLoading, mutate: publicMutate
    } = useUserAccounts({ ...apiOptions, enabled: !isAdminMode });

    const users = isAdminMode ? adminUsers : publicAccounts;
    const pagination = isAdminMode ? adminPagination : publicPagination;
    const isLoading = isAdminMode ? adminLoading : publicLoading;
    const mutate = isAdminMode ? adminMutate : publicMutate;

    // Hooks UI
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const bgColor = isDark ? 'gray.800' : 'white';
    const borderColor = isDark ? 'whiteAlpha.100' : 'gray.200';
    const hoverBg = isDark ? 'rgba(124,58,237,0.06)' : 'purple.50';
    const badgeVariant = isDark ? 'solid' : 'subtle';
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isBanModalOpen, onOpen: onBanModalOpen, onClose: onBanModalClose } = useDisclosure();
    const { isOpen: isUnbanModalOpen, onOpen: onUnbanModalOpen, onClose: onUnbanModalClose } = useDisclosure();
    const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();

    // Fonction pour mettre à jour l'URL avec les filtres actuels
    const updateURLParams = (search = "", guildName = "", role = "", limit = itemsPerPage, page = 1) => {
        const params = new URLSearchParams();

        if (search.trim()) params.set('search', search.trim());
        if (guildName) params.set('guild_name', guildName);
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
                updateURLParams(searchTerm, selectedGuildName, selectedRole, itemsPerPage, 1);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Gestionnaires d'événements
    const handleGuildChange = (guildId: string) => {
        setSelectedGuildId(guildId);
        setCurrentPage(1);
        const name = guilds.find(g => g._id === guildId)?.name || "";
        updateURLParams(searchTerm, name, selectedRole, itemsPerPage, 1);
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setCurrentPage(1);
        updateURLParams(searchTerm, selectedGuildName, role, itemsPerPage, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateURLParams(searchTerm, selectedGuildName, selectedRole, itemsPerPage, page);
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        updateURLParams(searchTerm, selectedGuildName, selectedRole, newLimit, 1);
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
        return guild?.name || t("pages.user.noGuild");
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

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "chef": return t("components.guildTabsList.roleChef");
            case "sous-chef": return t("components.guildTabsList.roleSousChef");
            case "membre": return t("components.guildTabsList.roleMembre");
            default: return role;
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
                            placeholder={t("pages.players.searchPlaceholder")}
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
                        placeholder={t("components.usersTable.filterAllGuilds")}
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
                        placeholder={t("components.usersTable.filterAllRoles")}
                        value={selectedRole}
                        onChange={(value) => handleRoleChange(value)}
                        options={[
                            { value: "chef", label: t("components.guildTabsList.roleChef") },
                            { value: "sous-chef", label: t("components.guildTabsList.roleSousChef") },
                            { value: "membre", label: t("components.guildTabsList.roleMembre") }
                        ]}
                        maxW="150px"
                    />

                    {/* Éléments par page */}
                    <CustomSelect
                        value={String(itemsPerPage)}
                        onChange={(value) => handleItemsPerPageChange(parseInt(value))}
                        options={[
                            { value: "10", label: t("components.usersTable.perPage", { count: 10 }) },
                            { value: "20", label: t("components.usersTable.perPage", { count: 20 }) },
                            { value: "50", label: t("components.usersTable.perPage", { count: 50 }) },
                            { value: "100", label: t("components.usersTable.perPage", { count: 100 }) }
                        ]}
                        allowDeselect={false}
                        maxW="150px"
                    />

                    <Button onClick={resetFilters} variant="outline" minW="120px">
                        {t("common.reset")}
                    </Button>

                    {isAdminMode && (
                        <Button onClick={onCreateModalOpen} colorScheme="purple" minW="180px">
                            + Créer un joueur
                        </Button>
                    )}
                </Flex>
            </VStack>

            {/* Filtres actifs */}
            {(searchTerm || selectedGuildId || selectedRole) && (
                <Box
                    p={3}
                    borderRadius="lg"
                    bg={isDark ? 'rgba(124,58,237,0.08)' : 'purple.50'}
                    border="1px solid"
                    borderColor={isDark ? 'purple.700' : 'purple.200'}
                >
                    <HStack spacing={2} flexWrap="wrap">
                        <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
                            textTransform="uppercase" color={isDark ? 'purple.400' : 'purple.600'}>
                            {t("components.usersTable.activeFilters")}
                        </Text>
                        {searchTerm && (
                            <Badge colorScheme="purple" variant={badgeVariant}>
                                {searchTerm}
                            </Badge>
                        )}
                        {selectedGuildId && (
                            <Badge colorScheme="purple" variant={badgeVariant}>
                                {getGuildName(selectedGuildId)}
                            </Badge>
                        )}
                        {selectedRole && (
                            <Badge colorScheme={getRoleBadgeColor(selectedRole)} variant={badgeVariant}>
                                {getRoleLabel(selectedRole)}
                            </Badge>
                        )}
                    </HStack>
                </Box>
            )}

            {/* Informations sur les résultats */}
            {pagination && (
                <Text fontSize="sm" color="gray.600">
                    {t("components.usersTable.paginationInfo", {
                        totalCount: pagination.totalCount,
                        currentPage: pagination.currentPage,
                        totalPages: pagination.totalPages,
                        itemsOnPage: pagination.itemsOnPage
                    })}
                </Text>
            )}

            {/* Tableau des utilisateurs */}
            <Box
                overflowX="auto"
                bg={bgColor}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                boxShadow={isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'}
            >
                <Table variant="simple">
                    <Thead>
                        <Tr bg={isDark ? 'rgba(255,255,255,0.03)' : 'gray.50'}>
                            <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'}>{t("components.usersTable.colPlayer")}</Th>
                            {!isAdminMode && <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'}>{t("components.usersTable.colGuild")}</Th>}
                            {!isAdminMode && <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'}>{t("components.usersTable.colRole")}</Th>}
                            {isAdminMode && <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'}>Comptes</Th>}
                            {isAdminMode && <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'}>{t("components.usersTable.colLastLogin")}</Th>}
                            {isAdminMode && <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'}>{t("components.usersTable.colActions")}</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <Tr key={i}>
                                    <Td>
                                        <HStack spacing={3}>
                                            <Skeleton boxSize="32px" borderRadius="full" />
                                            <Skeleton height="16px" width="120px" />
                                        </HStack>
                                    </Td>
                                    {!isAdminMode && <Td><Skeleton height="16px" width="80px" /></Td>}
                                    {!isAdminMode && <Td><Skeleton height="20px" width="60px" borderRadius="md" /></Td>}
                                    {isAdminMode && <Td><Skeleton height="16px" width="140px" /></Td>}
                                    {isAdminMode && <Td><Skeleton height="16px" width="100px" /></Td>}
                                    {isAdminMode && <Td><Skeleton height="28px" width="60px" borderRadius="md" /></Td>}
                                </Tr>
                            ))
                        ) : (
                            users.map((user: IUser) => (
                                <Tr key={user.bbs_id ? `${user._id}-${user.bbs_id}` : user._id} _hover={{ bg: hoverBg }} opacity={user.is_banned ? 0.5 : 1} transition="background 0.15s">
                                    <Td>
                                        <HStack spacing={3}>
                                            <UserDisplay user={user} />
                                            {user.is_banned && (
                                                <Badge colorScheme="red" fontSize="xs">{t("components.usersTable.badgeBanned")}</Badge>
                                            )}
                                        </HStack>
                                    </Td>
                                    {!isAdminMode && (
                                        <Td>
                                            <Text>{user.guilde_id ? getGuildName(user.guilde_id) : t('pages.user.noGuild')}</Text>
                                        </Td>
                                    )}
                                    {!isAdminMode && (
                                        <Td>
                                            <Badge
                                                colorScheme={getRoleBadgeColor(user.role)}
                                                variant={badgeVariant}
                                            >
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </Td>
                                    )}
                                    {isAdminMode && (
                                        <Td>
                                            {user.bbs_accounts && user.bbs_accounts.length > 0 ? (
                                                <VStack spacing={1} align="start">
                                                    {user.bbs_accounts.map((account) => (
                                                        <HStack key={account.bbs_id} spacing={1.5}>
                                                            {account.is_primary && (
                                                                <StarIcon boxSize={2.5} color="yellow.400" />
                                                            )}
                                                            <Text fontSize="sm" fontWeight={account.is_primary ? "semibold" : "normal"}>
                                                                {account.bbs_name || account.bbs_id}
                                                            </Text>
                                                            <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                                                                — {account.guilde_id ? getGuildName(account.guilde_id) : t('pages.user.noGuild')}
                                                            </Text>
                                                            {account.role && (
                                                                <Badge colorScheme={getRoleBadgeColor(account.role)} variant={badgeVariant} fontSize="2xs">
                                                                    {getRoleLabel(account.role)}
                                                                </Badge>
                                                            )}
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            ) : (
                                                <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>Aucun compte</Text>
                                            )}
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
                                                <Tooltip label={t("components.usersTable.tooltipEdit")}>
                                                    <IconButton
                                                        aria-label={t("components.usersTable.ariaLabelEdit")}
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="purple"
                                                        variant="ghost"
                                                        borderRadius="full"
                                                        onClick={() => handleEditUser(user)}
                                                    />
                                                </Tooltip>
                                                {!user.is_admin && (
                                                    user.is_banned ? (
                                                        <Tooltip label={t("components.usersTable.tooltipUnban")}>
                                                            <IconButton
                                                                aria-label={t("components.usersTable.ariaLabelUnban")}
                                                                icon={<CheckCircleIcon />}
                                                                size="sm"
                                                                colorScheme="green"
                                                                variant="ghost"
                                                                borderRadius="full"
                                                                onClick={() => handleUnbanUser(user)}
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip label={t("components.usersTable.tooltipBan")}>
                                                            <IconButton
                                                                aria-label={t("components.usersTable.ariaLabelBan")}
                                                                icon={<NotAllowedIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                borderRadius="full"
                                                                onClick={() => handleBanUser(user)}
                                                            />
                                                        </Tooltip>
                                                    )
                                                )}
                                            </HStack>
                                        </Td>
                                    )}
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
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
                    {t("components.usersTable.noResults")}
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
                    <CreateManualUserModal
                        isOpen={isCreateModalOpen}
                        onClose={onCreateModalClose}
                        guilds={guilds}
                        onUserCreated={handleUserUpdated}
                    />
                </>
            )}
        </VStack>
    );
}

export default UsersTable;