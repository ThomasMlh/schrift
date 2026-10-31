import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Box, Flex, Image, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ISummonListItem } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";
import { isSummonOngoing, summonDateRange } from "@/utils/summons";
import { SummonBanner } from "./SummonBanner";

interface EntryProps {
  summon: ISummonListItem;
  language: string;
}

const useSummonName = (summon: ISummonListItem, language: string) => {
  const { t } = useTranslation();
  return gameText(summon.names, language) || summon.name || t("pages.summons.unnamed", { id: summon.gacha_group_id });
};

export const SummonCard = ({ summon, language }: EntryProps) => {
  const { t } = useTranslation();
  const name = useSummonName(summon, language);
  return (
    <Box as={RouterLink} to={`/invocation/${summon.gacha_group_id}`} display="block" role="group" borderRadius="md" _focusVisible={{ boxShadow: "outline" }}>
      <SummonBanner groupId={summon.gacha_group_id} language={language} />
      <Text mt={2} fontSize="md" fontWeight="semibold" lineHeight="short" color="text.strong" noOfLines={2} _groupHover={{ color: "purple.400" }}>
        {name}
      </Text>
      <Flex align="center" gap={2} mt={1} wrap="wrap">
        {summon.start_date && <Text fontSize="xs" color="text.muted">{summonDateRange(summon)}</Text>}
        {isSummonOngoing(summon) && <Badge colorScheme="green">{t("pages.characterDetail.summonOngoing")}</Badge>}
      </Flex>
    </Box>
  );
};

// A ticket has no banner: its visual is the small item icon of the game
export const SummonTicketRow = ({ summon, language }: EntryProps) => {
  const { t } = useTranslation();
  const name = useSummonName(summon, language);
  const [iconFailed, setIconFailed] = useState(false);
  return (
    <Flex as={RouterLink} to={`/invocation/${summon.gacha_group_id}`} align="center" gap={3} role="group" borderRadius="md" _focusVisible={{ boxShadow: "outline" }}>
      <Box boxSize="72px" flexShrink={0} borderRadius="md" overflow="hidden" bg="bg.inset">
        {!iconFailed && (
          <Image src={`${bucketUrl}/banners/gacha_${summon.gacha_group_id}.png`} alt="" boxSize="72px" loading="lazy" onError={() => setIconFailed(true)} />
        )}
      </Box>
      <Box minW={0}>
        <Text fontSize="md" fontWeight="semibold" lineHeight="short" color="text.strong" noOfLines={2} _groupHover={{ color: "purple.400" }}>
          {name}
        </Text>
        {summon.start_date && (
          <Text mt={1} fontSize="xs" color="text.muted">
            {summon.end_date ? summonDateRange(summon) : t("pages.summons.since", { date: summon.start_date })}
          </Text>
        )}
      </Box>
    </Flex>
  );
};
