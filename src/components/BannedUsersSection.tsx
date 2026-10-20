import {
    Box, Table, Thead, Tbody, Tr, Th, Td, HStack, VStack,
    Text, Spinner, useColorModeValue, Badge, Flex, IconButton,
    useDisclosure, Tooltip, Input, InputGroup, InputLeftElement
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { SearchIcon, CheckCircleIcon } from "@chakra-ui/icons";
import type { IUser } from "../interfaces";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import UnbanUserModal from "./UnbanUserModal";
import { UserDisplay } from "./ui/UserDisplay";
import { useGuilds, useUsers } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";
import { PageLoader } from "./ui/PageLoader";

const BannedUsersSection: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    const { guilds } = useGuilds();

    const apiOptions = useMemo(() => ({
        // Ban reasons and dates are only returned to admins
        authenticated: true,
        page: currentPage,
        limit: 20,
        is_banned: 'true',
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    }), [currentPage, debouncedSearch]);

    const { users, pagination, isLoading, mutate } = useUsers(apiOptions);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const { isOpen: isUnbanModalOpen, onOpen: onUnbanModalOpen, onClose: onUnbanModalClose } = useDisclosure();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (debouncedSearch !== searchTerm) {
                setDebouncedSearch(searchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const getGuildName = (guildId: string) => {
        const guild = guilds.find(g => g._id === guildId);
        return guild?.name || t("pages.user.noGuild");
    };

    const handleUnbanUser = (user: IUser) => {
        setSelectedUser(user);
        onUnbanModalOpen();
    };

    const handleUserUpdated = () => {
        mutate();
    };

    return (
        <VStack spacing={6} align="stretch" w="100%">
            <Flex justify="center">
                <InputGroup maxW="500px">
                    <InputLeftElement pointerEvents="none">
                        {isLoading ? (
                            <Spinner size="sm" color="red.500" />
                        ) : (
                            <SearchIcon color="gray.300" />
                        )}
                    </InputLeftElement>
                    <Input
                        placeholder="Rechercher un joueur banni..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </Flex>

            {pagination && (
                <Text fontSize="sm" color="gray.600">
                    {pagination.totalCount} joueur(s) banni(s)
                </Text>
            )}

            <Box overflowX="auto" bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                {isLoading ? (
                    <PageLoader height="150px" />
                ) : users.length === 0 ? (
                    <Text textAlign="center" color="gray.500" py={8}>
                        Aucun joueur banni
                    </Text>
                ) : (
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Utilisateur</Th>
                                <Th>Guilde</Th>
                                <Th>Raison</Th>
                                <Th>Banni le</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user: IUser) => (
                                <Tr key={user._id} _hover={{ bg: hoverBg }}>
                                    <Td>
                                        <HStack spacing={3}>
                                            <UserDisplay user={user} />
                                            <Badge colorScheme="red" fontSize="xs">Banni</Badge>
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <Text>{user.guilde_id ? getGuildName(user.guilde_id) : t('pages.user.noGuild')}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" maxW="300px" noOfLines={2}>
                                            {user.ban_reason || <Text as="span" color="gray.400" fontStyle="italic">Aucune raison</Text>}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">
                                            {user.banned_at
                                                ? new Date(user.banned_at).toLocaleDateString('fr-FR', {
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
                                    <Td>
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
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            {pagination && pagination.totalPages > 1 && (
                <PaginationComponent
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    hasPrevPage={pagination.hasPrevPage}
                    hasNextPage={pagination.hasNextPage}
                    onPageChange={setCurrentPage}
                    totalCount={pagination.totalCount}
                    itemsOnPage={pagination.itemsOnPage}
                />
            )}

            <UnbanUserModal
                isOpen={isUnbanModalOpen}
                onClose={onUnbanModalClose}
                user={selectedUser}
                onUserUpdated={handleUserUpdated}
            />
        </VStack>
    );
};

export default BannedUsersSection;
