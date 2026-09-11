import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
    Text, VStack, HStack, Badge, Divider, Table, Thead, Tbody, Tr, Th, Td, Box, Code
} from "@chakra-ui/react";
import type { IActivityLogEntry } from "../interfaces";
import { NOTIFICATION_TYPE_LABELS } from "@/utils/notificationTypes";

interface ActivityDetailModalProps {
    entry: IActivityLogEntry | null;
    guildName?: string;
    onClose: () => void;
}

// Une ligne label/valeur, masquée si la valeur est absente — évite d'afficher des champs vides
// pour les types de notif dont certains champs ne sont pas toujours renseignés.
const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) =>
    value === undefined || value === null || value === "" ? null : (
        <HStack
            justify="space-between" fontSize="sm" py={1.5}
            borderBottomWidth="1px" borderColor="blackAlpha.100" _last={{ borderBottomWidth: 0 }}
        >
            <Text color="gray.500">{label}</Text>
            <Text fontWeight="medium" textAlign="right">{value}</Text>
        </HStack>
    );

const fmtDate = (v: unknown): string | undefined => {
    if (typeof v !== "string") return undefined;
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};

// Rendu du corps de la modal, spécifique à chaque type de notification puisque la forme
// de `data` varie beaucoup (liste de scores, liste de mouvements de draft, stats de sync...).
const DetailBody: React.FC<{ type: string; data: Record<string, unknown> }> = ({ type, data }) => {
    const s = (key: string): string | undefined =>
        typeof data[key] === "string" || typeof data[key] === "number" ? String(data[key]) : undefined;

    switch (type) {
        case "scores": {
            const scores = Array.isArray(data.scores)
                ? data.scores as Array<{ rank: number; pseudo: string; score: number; raw_score?: number }>
                : [];
            return (
                <VStack align="stretch" spacing={3}>
                    <Field label="Soumis par" value={s("submitted_by")} />
                    <Field label="Guilde" value={s("guild_name")} />
                    <Field label="Cycle" value={s("cycle_name")} />
                    <Field label="Rotation" value={[s("killer"), s("attack")].filter(Boolean).join(" · ")} />
                    <Field label="Résumé" value={s("summary")} />
                    {data.source === "ocr" && <Field label="Source" value="OCR" />}
                    {scores.length > 0 && (
                        <Box maxH="280px" overflowY="auto" borderWidth="1px" borderRadius="md">
                            <Table size="sm">
                                <Thead position="sticky" top={0} bg="chakra-body-bg">
                                    <Tr><Th>#</Th><Th>Joueur</Th><Th isNumeric>Score</Th><Th isNumeric>Brut</Th></Tr>
                                </Thead>
                                <Tbody>
                                    {scores.map((sc) => (
                                        <Tr key={sc.rank}>
                                            <Td>{sc.rank}</Td>
                                            <Td>{sc.pseudo}</Td>
                                            <Td isNumeric>{sc.score?.toLocaleString("fr-FR")}</Td>
                                            <Td isNumeric>{sc.raw_score ?? "-"}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </VStack>
            );
        }

        case "score_edit":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Modifié par" value={s("submitted_by")} />
                    <Field label="Joueur" value={s("pseudo")} />
                    <Field label="Guilde" value={s("guild_name")} />
                    <Field label="Cycle" value={s("cycle_name")} />
                    <Field
                        label="Rotation"
                        value={data.rotation_position != null
                            ? `#${Number(data.rotation_position) + 1} — ${s("rotation_killer") ?? ""} ${s("rotation_attack") ?? ""}`.trim()
                            : undefined}
                    />
                    <Field label="Score" value={`${s("old_score") ?? "?"} → ${s("new_score") ?? "?"}`} />
                    <Field label="Score brut" value={s("raw_score")} />
                    <Field label="Différentiel" value={data.is_differential ? "Oui" : "Non"} />
                    <Field label="Scores recalculés" value={s("recalculated_count")} />
                </VStack>
            );

        case "rotation_transfer":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Transféré par" value={s("submitted_by")} />
                    <Field label="Guilde" value={s("guild_name")} />
                    <Field label="Cycle" value={s("cycle_name")} />
                    <Field label="Trajet" value={`${s("source_rotation") ?? "?"} → ${s("target_rotation") ?? "?"}`} />
                    <Field label="Scores transférés" value={s("transferred_count")} />
                    <Field label="Écrasés" value={s("overwritten_count")} />
                    <Field label="Recalculés" value={s("recalculated_count")} />
                    <Field label="Parité changée" value={data.parity_changed ? "Oui" : "Non"} />
                </VStack>
            );

        case "character_update":
        case "image_upload": {
            const stats = (data.statistics as Record<string, unknown>) || {};
            return (
                <VStack align="stretch" spacing={0}>
                    <Text fontSize="sm" mb={2}>{s("message")}</Text>
                    <Divider mb={1} />
                    {Object.entries(stats)
                        .filter(([, v]) => v !== null && typeof v !== "object")
                        .map(([key, value]) => (
                            <Field key={key} label={key} value={String(value)} />
                        ))}
                </VStack>
            );
        }

        case "ban":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Action" value={data.action === "unban" ? "Débannissement" : "Bannissement"} />
                    <Field label="Par" value={s("banned_by")} />
                    <Field label="Utilisateur" value={s("banned_user")} />
                    <Field label="Raison" value={s("reason") || "Aucune"} />
                    <Field label="Date" value={fmtDate(data.banned_at)} />
                </VStack>
            );

        case "draft": {
            const moves = Array.isArray(data.moves)
                ? data.moves as Array<{ username: string; fromGuildName: string; toGuildName: string; direction: string }>
                : [];
            return (
                <VStack align="stretch" spacing={2}>
                    <Field label="Guilde" value={s("guild_name")} />
                    {moves.map((m, i) => (
                        <HStack
                            key={i} fontSize="sm" justify="space-between" py={1.5}
                            borderBottomWidth="1px" borderColor="blackAlpha.100" _last={{ borderBottomWidth: 0 }}
                        >
                            <Text fontWeight="medium">{m.username}</Text>
                            <Text color="gray.500">{m.fromGuildName} → {m.toGuildName}</Text>
                            <Badge colorScheme={m.direction === "arrivée" ? "green" : "orange"}>{m.direction}</Badge>
                        </HStack>
                    ))}
                </VStack>
            );
        }

        case "guild_toggle":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Action" value={data.action === "enable" ? "Réactivée" : "Désactivée"} />
                    <Field label="Guilde" value={s("guild_name")} />
                    <Field label="Par" value={s("toggled_by")} />
                    <Field label="Date" value={fmtDate(data.toggled_at)} />
                </VStack>
            );

        case "build_proposal":
        case "build_delete":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Action" value={type === "build_delete" ? "Suppression" : "Proposition"} />
                    <Field label="Par" value={s("proposed_by")} />
                    <Field label="Description" value={s("description")} />
                    <Field label="Rotation" value={[s("killer"), s("attack")].filter(Boolean).join(" · ")} />
                    <Field label="Taille équipe" value={s("team_size")} />
                </VStack>
            );

        case "cycle_change":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field
                        label="Action"
                        value={data.action === "create" ? "Création" : data.action === "delete" ? "Suppression" : "Modification"}
                    />
                    <Field label="Cycle" value={s("cycle_name")} />
                    <Field label="Année" value={s("cycle_year")} />
                    <Field label="Rotations" value={s("rotation_count")} />
                </VStack>
            );

        case "guild_change":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field
                        label="Action"
                        value={data.action === "create" ? "Création" : data.action === "delete" ? "Suppression" : "Renommage"}
                    />
                    <Field label="Ancien nom" value={s("old_name")} />
                    <Field label="Guilde" value={s("guild_name")} />
                </VStack>
            );

        case "membre_role_change":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Membre" value={s("membre_name")} />
                    <Field label="Guilde" value={s("guild_name")} />
                    <Field label="Rôle" value={`${s("old_role") ?? "membre"} → ${s("new_role") ?? "?"}`} />
                </VStack>
            );

        case "guild_member_change":
            return (
                <VStack align="stretch" spacing={0}>
                    <Field label="Action" value={data.action === "leave" ? "Départ" : "Arrivée"} />
                    <Field label="Membre" value={s("username")} />
                    <Field label="Guilde" value={s("guild_name")} />
                    <Field label="Rôle" value={s("role")} />
                </VStack>
            );

        default:
            return (
                <Code display="block" whiteSpace="pre-wrap" p={3} borderRadius="md" fontSize="xs">
                    {JSON.stringify(data, null, 2)}
                </Code>
            );
    }
};

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ entry, guildName, onClose }) => {
    return (
        <Modal isOpen={!!entry} onClose={onClose} size="lg" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={2}>
                        <Badge fontSize="xs">
                            {entry ? NOTIFICATION_TYPE_LABELS[entry.type as keyof typeof NOTIFICATION_TYPE_LABELS] || entry.type : ""}
                        </Badge>
                        {guildName && <Text fontSize="sm" color="gray.500">{guildName}</Text>}
                    </HStack>
                    {entry && (
                        <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={1}>
                            {new Date(entry.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                        </Text>
                    )}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {entry && <DetailBody type={entry.type} data={entry.data} />}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ActivityDetailModal;
