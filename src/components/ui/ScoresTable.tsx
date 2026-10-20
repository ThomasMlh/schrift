import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FiLock } from "react-icons/fi";
import type { IScore, IUser, ICycle, ICycleRotation } from "../../interfaces";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { UserDisplay } from "./UserDisplay";
import CustomLink from "./CustomLink";
import { AlterationImage } from "./AlterationImage";
import { ScoreBadge } from "./ScoreBadge";

interface ScoresTableProps {
  scores: IScore[];
  users: IUser[];
  cycles: ICycle[];
  isAdmin: boolean;
  isGuildManager: boolean;
  // Hides the Cycle column (e.g. when the list is already filtered on a cycle)
  hideCycle?: boolean;
  onEditScore: (score: IScore) => void;
  onDeleteScore: (score: IScore) => void;
}

const formatDay = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";

interface ScoreRow {
  score: IScore;
  user?: IUser;
  cycle?: ICycle;
  rotation?: ICycleRotation;
}

const RotationCell = ({ cycle, rotation }: { cycle?: ICycle; rotation?: ICycleRotation }) =>
  rotation ? (
    <Tooltip label={`${rotation.period} · ${rotation.start_date} → ${rotation.end_date}`} hasArrow openDelay={300}>
      <HStack spacing={2} w="fit-content">
        <AttackTypeBadge attackType={rotation.attack} size="10px" />
        <CustomLink
          to={`/cycle/${cycle?._id}/rotation/${rotation.position}`}
          text={`#${rotation.position} ${rotation.killer}`}
          textSize="sm"
        />
        {rotation.alteration && <AlterationImage alteration={rotation.alteration} size="16px" />}
      </HStack>
    </Tooltip>
  ) : (
    <Text fontSize="sm" color="text.muted">Rotation inconnue</Text>
  );

const LockedActions = () => (
  <HStack justify="flex-end" pr={2}>
    <Tooltip label="Cycle verrouillé : seuls les admins peuvent modifier ce score" hasArrow>
      <Box as="span" color="text.muted" aria-label="Cycle verrouillé"><FiLock /></Box>
    </Tooltip>
  </HStack>
);

const Actions = ({ score, onEdit, onDelete }: { score: IScore; onEdit: (s: IScore) => void; onDelete: (s: IScore) => void }) => (
  <HStack spacing={1} justify="flex-end">
    <Tooltip label="Modifier">
      <IconButton size="sm" icon={<EditIcon />} variant="ghost" aria-label="Modifier le score" onClick={() => onEdit(score)} />
    </Tooltip>
    <Tooltip label="Supprimer">
      <IconButton size="sm" icon={<DeleteIcon />} colorScheme="red" variant="ghost" aria-label="Supprimer le score" onClick={() => onDelete(score)} />
    </Tooltip>
  </HStack>
);

// Scores list: compact table on large screens, small cards on mobile
const ScoresTable: React.FC<ScoresTableProps> = ({
  scores,
  users,
  cycles,
  isAdmin,
  isGuildManager,
  hideCycle = false,
  onEditScore,
  onDeleteScore
}) => {
  const canEdit = isAdmin || isGuildManager;
  const renderActions = (score: IScore, cycle?: ICycle) =>
    !isAdmin && cycle?.scores_locked
      ? <LockedActions />
      : <Actions score={score} onEdit={onEditScore} onDelete={onDeleteScore} />;

  const rows: ScoreRow[] = scores.map((score) => {
    const owner = users.find((u) => u._id === score.user_id);
    // Show the account that actually produced THIS score, not the user's current main account: an
    // account may have been transferred to another user since (scores intentionally stay under the old
    // user_id), or the user may own several bbs accounts in the same guild.
    const user = owner
      ? { ...owner, bbs_name: score.bbs_name || owner.bbs_name, bbs_id: score.bbs_id || owner.bbs_id }
      : undefined;
    const cycle = cycles.find((c) => c._id === score.cycle_id);
    const rotation = cycle?.rotations.find((r) => r.rotation_id === score.rotation_id);
    return { score, user, cycle, rotation };
  });

  return (
    <>
      <Box display={{ base: "none", lg: "block" }} overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Joueur</Th>
              <Th>Rotation</Th>
              {!hideCycle && <Th>Cycle</Th>}
              <Th isNumeric>Score</Th>
              <Th>Saisi le</Th>
              {canEdit && <Th w="90px" />}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(({ score, user, cycle, rotation }) => (
              <Tr key={score._id} _hover={{ bg: "bg.hover" }}>
                <Td py={2}><UserDisplay user={user} /></Td>
                <Td py={2}><RotationCell cycle={cycle} rotation={rotation} /></Td>
                {!hideCycle && (
                  <Td py={2}>
                    <CustomLink to={`/cycle/${cycle?._id}`} text={cycle ? `${cycle.name} ${cycle.year}` : "Cycle inconnu"} textSize="sm" />
                  </Td>
                )}
                <Td py={2} isNumeric><ScoreBadge commas score={score.score} /></Td>
                <Td py={2}>
                  <Tooltip label={score.created_at ? new Date(score.created_at).toLocaleString("fr-FR") : "Date inconnue"} hasArrow>
                    <Text fontSize="sm" color="text.muted" w="fit-content">{formatDay(score.created_at)}</Text>
                  </Tooltip>
                </Td>
                {canEdit && (
                  <Td py={2}>
                    {renderActions(score, cycle)}
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <VStack display={{ base: "flex", lg: "none" }} spacing={0} align="stretch">
        {rows.map(({ score, user, cycle, rotation }, idx) => (
          <Box key={score._id} px={3} py={3} borderTopWidth={idx > 0 ? "1px" : 0} borderColor="border.subtle">
            <HStack justify="space-between" align="start" spacing={3}>
              <Box minW={0}><UserDisplay user={user} /></Box>
              <ScoreBadge commas score={score.score} />
            </HStack>
            <HStack justify="space-between" mt={2} spacing={3}>
              <VStack align="start" spacing={0.5} minW={0}>
                <RotationCell cycle={cycle} rotation={rotation} />
                <Text fontSize="xs" color="text.muted">
                  {!hideCycle && cycle ? `${cycle.name} ${cycle.year} · ` : ""}saisi le {formatDay(score.created_at)}
                </Text>
              </VStack>
              {canEdit && renderActions(score, cycle)}
            </HStack>
          </Box>
        ))}
      </VStack>
    </>
  );
};

export default ScoresTable;
