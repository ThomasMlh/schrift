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
  // Masque la colonne Cycle (ex : quand la liste est déjà filtrée sur un cycle)
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

// Liste des scores : tableau compact sur grand écran, petites cartes sur mobile
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

  const rows: ScoreRow[] = scores.map((score) => {
    const owner = users.find((u) => u._id === score.user_id);
    // Le nom/compte affichés doivent être ceux qui ont réellement produit CE score, pas le
    // compte bbs principal actuel du user — un compte peut avoir été transféré à un autre
    // user depuis (les scores restent volontairement sous l'ancien user_id, cf. account
    // transfer), ou le user peut avoir plusieurs comptes bbs dans la même guilde.
    const user = owner
      ? { ...owner, bbs_name: score.bbs_name || owner.bbs_name, bbs_id: score.bbs_id || owner.bbs_id }
      : undefined;
    const cycle = cycles.find((c) => c._id === score.cycle_id);
    const rotation = cycle?.rotations.find((r) => r.rotation_id === score.rotation_id);
    return { score, user, cycle, rotation };
  });

  return (
    <>
      {/* Grand écran : tableau */}
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
                <Td py={2} isNumeric><ScoreBadge score={score.score} /></Td>
                <Td py={2}>
                  <Tooltip label={score.created_at ? new Date(score.created_at).toLocaleString("fr-FR") : "Date inconnue"} hasArrow>
                    <Text fontSize="sm" color="text.muted" w="fit-content">{formatDay(score.created_at)}</Text>
                  </Tooltip>
                </Td>
                {canEdit && (
                  <Td py={2}>
                    <Actions score={score} onEdit={onEditScore} onDelete={onDeleteScore} />
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Mobile : cartes */}
      <VStack display={{ base: "flex", lg: "none" }} spacing={0} align="stretch">
        {rows.map(({ score, user, cycle, rotation }, idx) => (
          <Box key={score._id} px={3} py={3} borderTopWidth={idx > 0 ? "1px" : 0} borderColor="border.subtle">
            <HStack justify="space-between" align="start" spacing={3}>
              <Box minW={0}><UserDisplay user={user} /></Box>
              <ScoreBadge score={score.score} />
            </HStack>
            <HStack justify="space-between" mt={2} spacing={3}>
              <VStack align="start" spacing={0.5} minW={0}>
                <RotationCell cycle={cycle} rotation={rotation} />
                <Text fontSize="xs" color="text.muted">
                  {!hideCycle && cycle ? `${cycle.name} ${cycle.year} · ` : ""}saisi le {formatDay(score.created_at)}
                </Text>
              </VStack>
              {canEdit && <Actions score={score} onEdit={onEditScore} onDelete={onDeleteScore} />}
            </HStack>
          </Box>
        ))}
      </VStack>
    </>
  );
};

export default ScoresTable;
