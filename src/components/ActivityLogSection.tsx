import {
    Box, Table, Thead, Tbody, Tr, Th, Td, VStack,
    Text, useColorModeValue, Badge, Flex, Select
} from "@chakra-ui/react";
import { Fragment, useMemo, useState } from "react";
import type { IActivityLogEntry } from "../interfaces";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import { PageLoader } from "./ui/PageLoader";
import { useActivity, useGuilds } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { NOTIFICATION_TYPES, NOTIFICATION_TYPE_LABELS, formatActivityEntry } from "@/utils/notificationTypes";

// Rend "**texte**" en gras, sans dépendance markdown — juste ce qu'il faut pour le journal.
const Highlighted: React.FC<{ text: string }> = ({ text }) => (
    <>
        {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
                <Text as="b" key={i}>{part.slice(2, -2)}</Text>
            ) : (
                <Fragment key={i}>{part}</Fragment>
            )
        )}
    </>
);

const ActivityLogSection: React.FC = () => {
    const { isAdmin } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState("");
    const [guildFilter, setGuildFilter] = useState("");

    const { guilds } = useGuilds();

    const apiOptions = useMemo(() => ({
        page: currentPage,
        limit: 20,
        ...(typeFilter && { type: typeFilter }),
        ...(guildFilter && { guilde_id: guildFilter }),
    }), [currentPage, typeFilter, guildFilter]);

    const { activity, pagination, isLoading } = useActivity(apiOptions);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const getGuildName = (guildId: string | null) => guilds.find(g => g._id === guildId)?.name;

    return (
        <VStack spacing={6} align="stretch" w="100%">
            <Flex justify="center" gap={4} wrap="wrap">
                <Select
                    maxW="300px"
                    placeholder="Tous les types"
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                >
                    {NOTIFICATION_TYPES.map((type) => (
                        <option key={type} value={type}>{NOTIFICATION_TYPE_LABELS[type]}</option>
                    ))}
                </Select>
                {isAdmin && (
                    <Select
                        maxW="250px"
                        placeholder="Toutes les guildes"
                        value={guildFilter}
                        onChange={(e) => { setGuildFilter(e.target.value); setCurrentPage(1); }}
                    >
                        {guilds.map((g) => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                    </Select>
                )}
            </Flex>

            {pagination && (
                <Text fontSize="sm" color="gray.600">
                    {pagination.totalCount} événement(s)
                </Text>
            )}

            <Box overflowX="auto" bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                {isLoading ? (
                    <PageLoader height="150px" />
                ) : activity.length === 0 ? (
                    <Text textAlign="center" color="gray.500" py={8}>
                        Aucun événement
                    </Text>
                ) : (
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Type</Th>
                                <Th>Guilde</Th>
                                <Th>Détail</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {activity.map((entry: IActivityLogEntry) => (
                                <Tr key={entry._id} _hover={{ bg: hoverBg }}>
                                    <Td whiteSpace="nowrap">
                                        <Text fontSize="sm">
                                            {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Badge fontSize="xs">
                                            {NOTIFICATION_TYPE_LABELS[entry.type as keyof typeof NOTIFICATION_TYPE_LABELS] || entry.type}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">{getGuildName(entry.guilde_id) || "-"}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" maxW="500px" noOfLines={2}>
                                            <Highlighted text={formatActivityEntry(entry.type, entry.data)} />
                                        </Text>
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
        </VStack>
    );
};

export default ActivityLogSection;
