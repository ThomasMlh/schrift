import {
  Box, HStack, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useUserRecords } from "@/hooks/useAPI";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";

interface UserKillerRecordsProps {
  userId?: string;
  // bbs account shown on the page (an alt when the URL targets it); defaults to the main account.
  bbsId?: string;
}

// Player page "Records" tab: the account's best score on each killer across all cycles
// (differential scores without a base score are not comparable and are filtered out by the API).
export const UserKillerRecords = ({ userId, bbsId }: UserKillerRecordsProps) => {
  const { t } = useTranslation();
  const { accounts, isLoading } = useUserRecords(userId);

  const mutedText = "text.muted";
  const strongText = "text.strong";
  const headerBg = "bg.subtle";

  if (isLoading) return <Skeleton h="240px" borderRadius="lg" />;

  const account = accounts.find((a) => a.bbs_id === bbsId) ?? accounts.find((a) => a.is_primary) ?? accounts[0];
  // Best record first (the API returns killers alphabetically)
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
