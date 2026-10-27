import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, List, ListItem, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IGuildRaffle } from "@/interfaces";
import { formatWithCommas } from "@/utils/format";

const SECTIONS = ["top5", "homogeneity", "seniority", "collective", "guildLife", "bonus"] as const;

// How tickets are earned, with the values the API actually applies
export const RaffleRules = ({ raffle }: { raffle: IGuildRaffle }) => {
  const { t } = useTranslation();
  const { rules } = raffle;
  const values = {
    rotationTop: rules.rotationTop,
    maxRotationTop: rules.maxRotationTopTickets,
    monthTop: rules.monthTop,
    full: formatWithCommas(rules.homogeneityFull),
    half: formatWithCommas(rules.homogeneityHalf),
    maxSeniority: rules.maxSeniorityTickets,
    maxRank: rules.maxRankTickets,
    gap: formatWithCommas(rules.collectiveGap),
    max: raffle.max_tickets,
  };

  return (
    <Accordion allowToggle bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <AccordionItem border="none">
        <AccordionButton px={5} py={4}>
          <Box flex={1} textAlign="left">
            <Text fontWeight="semibold" color="text.strong">{t("pages.raffle.rulesTitle")}</Text>
            <Text fontSize="sm" color="text.muted">{t("pages.raffle.rulesSubtitle", values)}</Text>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel px={5} pb={5}>
          {SECTIONS.map((section) => (
            <Box key={section} mb={4}>
              <Text fontWeight="semibold" fontSize="sm" color="text.strong" mb={1}>{t(`pages.raffle.rules.${section}.title`)}</Text>
              <List spacing={1} styleType="disc" pl={5}>
                {(t(`pages.raffle.rules.${section}.items`, { ...values, returnObjects: true }) as string[]).map((item) => (
                  <ListItem key={item} fontSize="sm" color="text.secondary">{item}</ListItem>
                ))}
              </List>
            </Box>
          ))}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
