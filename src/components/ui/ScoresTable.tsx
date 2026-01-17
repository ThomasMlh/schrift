import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    HStack,
    VStack,
    Text,
    Badge,
    IconButton,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import type { IScore, IUser, ICycle } from "../../interfaces";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { UserDisplay } from "./UserDisplay";
import CustomLink from "./CustomLink";
import { getScoreDisplayValue } from "@/utils/scores";

interface ScoresTableProps {
    scores: IScore[];
    users: IUser[];
    cycles: ICycle[];
    isAdmin: boolean;
    isGuildManager: boolean;
    onEditScore: (score: IScore) => void;
    onDeleteScore: (score: IScore) => void;
}

const ScoresTable: React.FC<ScoresTableProps> = ({
    scores,
    users,
    cycles,
    isAdmin,
    isGuildManager,
    onEditScore,
    onDeleteScore
}) => {
    // Obtenir les informations d'un utilisateur
    const getUserInfo = (userId: string) => {
        return users.find(user => user._id === userId);
    };

    // Obtenir les informations d'un cycle
    const getCycleInfo = (cycleId: string) => {
        return cycles.find(cycle => cycle._id === cycleId);
    };

    // Obtenir les informations d'une rotation
    const getRotationInfo = (cycleId: string, rotationId: string) => {
        const cycle = getCycleInfo(cycleId);
        return cycle?.rotations.find(rotation => rotation.rotation_id === rotationId);
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
                        {(isAdmin || isGuildManager) && <Th>Actions</Th>}
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
                                        <UserDisplay user={user} />
                                    </HStack>
                                </Td>
                                <Td>
                                    <CustomLink to={`/cycle/${cycle?._id}`} text={`${cycle?.name}${cycle?.year ? ` - (${cycle.year})` : ''}` || "Cycle inconnu"} textSize="md" />
                                </Td>
                                <Td>
                                    {rotation ? (
                                        <VStack spacing={1} align="start">
                                            <CustomLink to={`/cycle/${cycle?._id}/rotation/${rotation.position}`} text={`Rotation #${rotation.position}`} />
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
                                        colorScheme={getScoreDisplayValue(score.score)}
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
                                {(isAdmin || isGuildManager) && (
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