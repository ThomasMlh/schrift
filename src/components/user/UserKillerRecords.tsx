import {
  Box, HStack, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useUserRecords } from "@/hooks/useAPI";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";

interface UserKillerRecordsProps {
  userId?: string;
  // Compte bbs affiché sur la page (un alt si l'URL pointe vers lui) ; à défaut, le compte principal.
  bbsId?: string;
}

// Onglet "Records" de la page joueur : meilleur score du compte sur chaque killer, tous cycles
// confondus (les scores différentiels sans score de base, non comparables, sont écartés côté API).
export const UserKillerRecords = ({ userId, bbsId }: UserKillerRecordsProps) => {
  const { t } = useTranslation();
  const { accounts, isLoading } = useUserRecords(userId);

  const mutedText = useColorModeValue("gray.500", "whiteAlpha.600");
  const strongText = useColorModeValue("gray.800", "whiteAlpha.900");
  const headerBg = useColorModeValue("gray.50", "whiteAlpha.50");

  if (isLoading) return <Skeleton h="240px" borderRadius="lg" />;

  const account = accounts.find((a) => a.bbs_id === bbsId) ?? accounts.find((a) => a.is_primary) ?? accounts[0];
  // Meilleur record en tête (l'API renvoie les killers par ordre alphabétique)
  const records = [...(account?.records ?? [])].sort((a, b) => b.score - a.score);

  return (
    <Box>
      <Text fontSize="md" fontWeight="bold" color={strongText}>{t("pages.user.recordsTitle")}</Text>
      <Text fontSize="sm" color={mutedText} mb={4}>{t("pages.user.recordsSubtitle")}</Text>

      {records.length === 0 ? (
        <Text fontSize="sm" color={mutedText} textAlign="center" py={8}>{t("pages.user.recordsEmpty")}</Text>
      ) : (
        <TableContainer>
          <Table size="sm">
            <Thead bg={headerBg}>
              <Tr>
                <Th>{t("pages.user.recordsKiller")}</Th>
                <Th isNumeric>{t("pages.user.recordsScore")}</Th>
                <Th>{t("pages.user.recordsCycle")}</Th>
                <Th isNumeric>{t("pages.user.recordsAttempts")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((r) => (
                <Tr key={r.rotation_id}>
                  <Td>
                    <HStack spacing={2}>
                      {r.attack && <AttackTypeBadge attackType={r.attack} size="12px" />}
                      <Text fontWeight="medium">{r.killer ?? "—"}</Text>
                      {r.alteration && (
                        <Tooltip label={t(`alterations.${r.alteration}`, r.alteration)} hasArrow>
                          <Box as="span" display="inline-flex">
                            <AlterationImage alteration={r.alteration} size="20px" />
                          </Box>
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                  <Td isNumeric fontWeight="semibold">{r.score.toLocaleString("fr-FR")}</Td>
                  <Td color={mutedText}>{[r.cycle_name, r.cycle_year].filter(Boolean).join(" ")}</Td>
                  <Td isNumeric color={mutedText}>{r.attempts}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
