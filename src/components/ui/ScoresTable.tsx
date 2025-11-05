import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    HStack,
    Avatar,
    VStack,
    Link,
    Text,
    Badge,
    IconButton,
    useColorModeValue
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import type { Score, User, Cycle } from "../../interfaces";
import { getUserAvatarUrl } from "../../utils/discord";
import { AttackTypeBadge } from "./AttackTypeBadge";

interface ScoresTableProps {
    scores: Score[];
    users: User[];
    cycles: Cycle[];
    isAdmin: boolean;
    onEditScore: (score: Score) => void;
    onDeleteScore: (score: Score) => void;
}

const ScoresTable: React.FC<ScoresTableProps> = ({
    scores,
    users,
    cycles,
    isAdmin,
    onEditScore,
    onDeleteScore
}) => {
    const linkColor = useColorModeValue('black', 'white');
    // Obtenir les informations d'un utilisateur
    const getUserInfo = (userId: string) => {
        return users.find(user => user._id === userId || user.discordId === userId);
    };

    // Obtenir les informations d'un cycle
    const getCycleInfo = (cycleId: string) => {
        return cycles.find(cycle => cycle._id === cycleId);
    };

    // Obtenir les informations d'une rotation
    const getRotationInfo = (cycleId: string, rotationId: string) => {
        const cycle = getCycleInfo(cycleId);
        return cycle?.rotations.find(rotation => rotation._id === rotationId);
    };

    return (
        <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Joueur</Th>
                        <Th>Cycle</Th>
                        <Th>Rotation</Th>
                        <Th>Score</Th>
                        <Th>Date</Th>
                        {isAdmin && <Th>Actions</Th>}
                    </Tr>
                </Thead>
                <Tbody>
                    {scores.map((score) => {
                        const user = getUserInfo(score.user_id);
                        const cycle = getCycleInfo(score.cycle_id);
                        const rotation = getRotationInfo(score.cycle_id, score.rotation_id);

                        return (
                            <Tr key={score._id}>
                                <Td>
                                    <HStack spacing={3}>
                                        <Avatar
                                            size="sm"
                                            src={user ? getUserAvatarUrl(user) || undefined : undefined}
                                            name={user?.global_name || user?.username || "Utilisateur inconnu"}
                                        />
                                        <VStack spacing={0} align="start">
                                            <Link
                                                as={RouterLink}
                                                to={`/user/${user?._id}`}
                                                color={linkColor}
                                                _hover={{
                                                    textDecoration: "underline",
                                                    color: linkColor
                                                }}
                                                _focus={{
                                                    outline: "1px solid",
                                                    outlineColor: linkColor,
                                                    outlineOffset: "2px"
                                                }}
                                                fontWeight="medium"
                                            >
                                                {user?.global_name || user?.username || "Utilisateur inconnu"}
                                            </Link>
                                            <Text fontSize="xs" color="gray.500">
                                                {user?.username}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </Td>
                                <Td>
                                    <Link as={RouterLink} to={`/cycle/${cycle?._id}`} _hover={{
                                        textDecoration: "underline",
                                        color: linkColor
                                    }}
                                        _focus={{
                                            outline: "1px solid",
                                            outlineColor: linkColor,
                                            outlineOffset: "2px"
                                        }}
                                        fontWeight="medium">
                                        {cycle?.name || "Cycle inconnu"}
                                    </Link>
                                </Td>
                                <Td>
                                    {rotation ? (
                                        <VStack spacing={1} align="start">
                                            <Text>Rotation #{rotation.position}</Text>
                                            <HStack spacing={2}>
                                                <Text fontSize="sm" fontWeight="medium" display={"flex"}>
                                                    {rotation.killer}
                                                </Text>
                                                <AttackTypeBadge attackType={rotation.attack} />
                                            </HStack>
                                            <Badge size="sm" colorScheme="blue">
                                                {rotation.period}
                                            </Badge>
                                            <Text fontSize="xs" color="gray.500">
                                                {rotation.start_date} - {rotation.end_date}
                                            </Text>
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500">Rotation inconnue</Text>
                                    )}
                                </Td>
                                <Td>
                                    <Badge
                                        colorScheme={score.score >= 490000000 ? "green" : score.score >= 250000000 ? "orange" : "red"}
                                        fontSize="md"
                                        px={3}
                                        py={1}
                                    >
                                        {score.score.toLocaleString()}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Text fontSize="sm">
                                        {score.created_at ? new Date(score.created_at).toLocaleDateString('fr-FR') : "-"}
                                    </Text>
                                </Td>
                                {isAdmin && (
                                    <Td>
                                        <HStack spacing={2}>
                                            <IconButton
                                                size="sm"
                                                icon={<EditIcon />}
                                                colorScheme="blue"
                                                variant="outline"
                                                aria-label="Modifier le score"
                                                onClick={() => onEditScore(score)}
                                            />
                                            <IconButton
                                                size="sm"
                                                icon={<DeleteIcon />}
                                                colorScheme="red"
                                                variant="outline"
                                                aria-label="Supprimer le score"
                                                onClick={() => onDeleteScore(score)}
                                            />
                                        </HStack>
                                    </Td>
                                )}
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default ScoresTable;