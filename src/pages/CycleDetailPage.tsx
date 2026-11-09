import { useMemo } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert, AlertIcon, Badge, Box, Button, Container, Flex, HStack, SimpleGrid, Skeleton, Text, VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

import { AlterationImage } from "@/components/ui/AlterationImage";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { useCycle, useCycles } from "@/hooks/useAPI";
import { useNow } from "@/hooks/useNow";
import { cycleFromSlug, getRotationRealDates } from "@/utils/cycleHelpers";
import { formatCountdown } from "@/utils/countdown";
import { formatRealDate } from "@/utils/rotationDates";
import { rotationUrl } from "@/utils/rotationPassages";
import type { ICycle, ICycleRotation } from "@/interfaces";

type CycleRef = Pick<ICycle, "name" | "year">;

type RotationState = "past" | "current" | "upcoming";

interface TimedRotation {
  rotation: ICycleRotation;
  start: Date;
  end: Date;
  state: RotationState;
}

const RotationTags = ({ rotation }: { rotation: ICycleRotation }) => {
  const { t } = useTranslation();
  return (
    <>
      <HStack spacing={1.5}>
        <AttackTypeBadge attackType={rotation.attack} size="16px" />
        <Text fontSize="sm">{t(`attackTypes.${rotation.attack}`, rotation.attack)}</Text>
      </HStack>
      <AlterationImage alteration={rotation.alteration} size="20px" showLabel />
    </>
  );
};

const CurrentBadge = () => {
  const { t } = useTranslation();
  return (
    <Badge colorScheme="green" variant="solid" borderRadius="full" px={2} fontSize="2xs" letterSpacing="wider">
      {t("pages.cycleDetail.current")}
    </Badge>
  );
};

const SPOTLIGHT_STYLES = {
  current: { borderColor: "green.400", bgGradient: "linear(135deg, rgba(34, 160, 107, 0.14), transparent 60%)" },
  upcoming: { borderColor: "purple.400", bgGradient: "linear(135deg, rgba(124, 92, 255, 0.14), transparent 60%)" },
  following: { borderColor: "border.subtle", bgGradient: undefined },
};

// Card of the running rotation (or the next one between two rotations), then of the one after it
const RotationSpotlight = ({
  item, cycle, kind, now,
}: { item: TimedRotation; cycle: CycleRef; kind: keyof typeof SPOTLIGHT_STYLES; now: Date }) => {
  const { t, i18n } = useTranslation();
  const isCurrent = kind === "current";
  const isMain = kind !== "following";
  const { rotation } = item;
  return (
    <Box bg="bg.card" borderWidth="1px" borderRadius="2xl" p={5} {...SPOTLIGHT_STYLES[kind]}>
      <HStack spacing={2} fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted" flexWrap="wrap">
        {isCurrent ? <CurrentBadge /> : (
          <Text as="span" color={isMain ? "purple.300" : undefined}>
            {t(isMain ? "pages.cycleDetail.upcoming" : "pages.cycleDetail.next")}
          </Text>
        )}
        <Text as="span">
          {t("pages.cycleDetail.rotationNumber", { position: rotation.position })}
          {!isCurrent && ` · ${formatRealDate(item.start, i18n.language)}`}
        </Text>
      </HStack>
      <Text fontSize={isMain ? "2xl" : "xl"} fontWeight="extrabold" color="text.strong" mt={2}>
        {t(`factions.${rotation.killer}`, rotation.killer)}
      </Text>
      <Flex gap={4} wrap="wrap" align="center" mt={3} mb={4}>
        <RotationTags rotation={rotation} />
        {isMain && (
          <Text fontSize="sm" color="text.muted">
            {isCurrent ? t("pages.cycleDetail.endsIn") : t("pages.cycleDetail.startsIn")}{" "}
            <Text as="span" fontWeight="extrabold" color="text.strong" fontSize="lg">
              {formatCountdown((isCurrent ? item.end : item.start).getTime() - now.getTime(), i18n.language)}
            </Text>
          </Text>
        )}
      </Flex>
      <HStack spacing={2} flexWrap="wrap">
        {isCurrent && (
          <Button as={RouterLink} to={rotationUrl(rotation, cycle)} size="sm" colorScheme="purple">
            {t("pages.cycleDetail.ranking")}
          </Button>
        )}
        {rotation.rotation_id && (
          <Button as={RouterLink} to={`/guides/rotations-builds?rotation=${rotation.rotation_id}`} size="sm" variant="outline">
            {t("pages.cycleDetail.builds")}
          </Button>
        )}
      </HStack>
    </Box>
  );
};

const TABLE_COLUMNS = "48px 250px 1fr 110px 150px 20px";

const RotationRow = ({ item, cycle }: { item: TimedRotation; cycle: CycleRef }) => {
  const { t, i18n } = useTranslation();
  const { rotation, state } = item;
  const isCurrent = state === "current";
  return (
    <Box
      as={RouterLink}
      to={rotationUrl(rotation, cycle)}
      display="grid"
      gridTemplateColumns={{ base: "32px 1fr", md: TABLE_COLUMNS }}
      gridTemplateAreas={{ base: `"pos killer" "pos dates" "pos tags"`, md: "none" }}
      alignItems="center"
      columnGap={3}
      rowGap={1.5}
      px={4}
      py={3}
      borderTopWidth="1px"
      borderColor="border.subtle"
      opacity={state === "past" ? 0.5 : 1}
      bg={isCurrent ? "rgba(34, 160, 107, 0.1)" : undefined}
      boxShadow={isCurrent ? "inset 3px 0 0 var(--chakra-colors-green-400)" : undefined}
      _hover={{ bg: isCurrent ? "rgba(34, 160, 107, 0.16)" : "bg.subtle", opacity: 1 }}
      transition="background 0.15s, opacity 0.15s"
    >
      <Text gridArea={{ base: "pos", md: "auto" }} alignSelf={{ base: "start", md: "center" }} fontWeight="extrabold" color="purple.400">
        {rotation.position}
      </Text>
      <Text gridArea={{ base: "dates", md: "auto" }} order={{ base: 2, md: 0 }} fontSize="sm" color="text.muted" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {formatRealDate(item.start, i18n.language)} → {formatRealDate(item.end, i18n.language)}
      </Text>
      <HStack gridArea={{ base: "killer", md: "auto" }} order={{ base: 1, md: 0 }} spacing={2} minW={0}>
        <Text fontWeight="bold" color="text.strong" noOfLines={1}>{t(`factions.${rotation.killer}`, rotation.killer)}</Text>
        {isCurrent && <CurrentBadge />}
      </HStack>
      <Flex gridArea={{ base: "tags", md: "auto" }} order={{ base: 3, md: 0 }} display={{ base: "flex", md: "contents" }} gap={4} align="center">
        <RotationTags rotation={rotation} />
      </Flex>
      <ChevronRightIcon display={{ base: "none", md: "block" }} color="text.muted" />
    </Box>
  );
};

const CycleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const now = useNow();

  // Resolve the slug into its _id (falls back to the raw id for compatibility)
  const { cycles } = useCycles({ limit: 100 });
  const resolvedId = useMemo(() => {
    if (!cycles.length) return undefined;
    return cycleFromSlug(cycles, id!)?._id ?? id;
  }, [cycles, id]);

  const { cycle, isLoading, error } = useCycle(resolvedId);

  const timed = useMemo<TimedRotation[]>(() => (cycle?.rotations ?? [])
    .filter((rotation) => rotation.start_date && rotation.end_date)
    .map((rotation) => {
      const { realStartDate: start, realEndDate: end } = getRotationRealDates(rotation.start_date, rotation.end_date);
      const state: RotationState = now > end ? "past" : now >= start ? "current" : "upcoming";
      return { rotation, start, end, state };
    }), [cycle, now]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="16px" width="240px" borderRadius="md" />
          <Skeleton height="90px" borderRadius="2xl" />
          <Skeleton height="160px" borderRadius="2xl" />
          <Skeleton height="400px" borderRadius="2xl" />
        </VStack>
      </Container>
    );
  }

  if (error || !id || !cycle) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="error">
            <AlertIcon />
            {!id ? t("pages.cycleDetail.errorMissingId") : error ? t("pages.cycleDetail.errorLoading") : t("pages.cycleDetail.errorNotFound")}
          </Alert>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/cycles")}>
            {t("pages.cycleDetail.backToCycles")}
          </Button>
        </VStack>
      </Container>
    );
  }

  const total = timed.length;
  const current = timed.find((item) => item.state === "current") ?? null;
  // Between two rotations, the next one takes the main card
  const spotlight = current ?? timed.find((item) => item.state === "upcoming") ?? null;
  const following = spotlight ? timed[timed.indexOf(spotlight) + 1] ?? null : null;
  const doneCount = timed.filter((item) => item.state !== "upcoming").length;
  const first = timed[0];
  const last = timed[total - 1];

  const progressLabel = current
    ? t("pages.cycleDetail.progressRotation", { current: current.rotation.position, total })
    : doneCount === 0 && first
      ? t("pages.cycleDetail.progressUpcoming", { time: formatCountdown(first.start.getTime() - now.getTime(), i18n.language) })
      : doneCount === total
        ? t("pages.cycleDetail.progressDone")
        : t("pages.cycleDetail.progressRotation", { current: doneCount, total });

  return (
    <>
      <SEOHead
        title={`${cycle.name} - ${cycle.year} - Schrift BBS`}
        description={`Détails du cycle ${cycle.name} (${cycle.year}) de la Guilde War Schrift`}
        noIndex={true}
      />

      <Container maxW="container.xl" py={5}>
        <VStack spacing={4} align="stretch">
          <Breadcrumbs items={[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.cycles"), to: "/cycles" },
            { label: cycle.name },
          ]} />

          <Flex
            bg="bg.card"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="2xl"
            px={{ base: 4, md: 6 }}
            py={4}
            gap={5}
            align="center"
            wrap="wrap"
          >
            <Box flex="1" minW="220px">
              <Text as="h1" fontSize="xl" fontWeight="extrabold" color="text.strong">
                {cycle.name} — {cycle.year}
              </Text>
              {first && last && (
                <Text fontSize="sm" color="text.muted">
                  {t("pages.cycleDetail.summary", {
                    start: formatRealDate(first.start, i18n.language),
                    end: formatRealDate(last.end, i18n.language),
                    count: total,
                  })}
                </Text>
              )}
            </Box>
            {total > 0 && (
              <Box flex="1" minW="220px">
                <Flex justify="space-between" fontSize="xs" color="text.muted" mb={1.5}>
                  <Text>{t("pages.cycleDetail.progress")}</Text>
                  <Text fontWeight="bold" color="text.strong">{progressLabel}</Text>
                </Flex>
                <Box h="8px" borderRadius="full" bg="bg.subtle" overflow="hidden">
                  <Box h="100%" w={`${(doneCount / total) * 100}%`} borderRadius="full" bgGradient="linear(to-r, purple.500, blue.500)" />
                </Box>
              </Box>
            )}
          </Flex>

          {spotlight && (
            <SimpleGrid columns={1} spacing={4} templateColumns={{ md: following ? "1.3fr 1fr" : undefined }}>
              <RotationSpotlight item={spotlight} cycle={cycle} kind={current ? "current" : "upcoming"} now={now} />
              {following && <RotationSpotlight item={following} cycle={cycle} kind="following" now={now} />}
            </SimpleGrid>
          )}

          {total > 0 && (
            <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" overflow="hidden">
              <Box
                display={{ base: "none", md: "grid" }}
                gridTemplateColumns={TABLE_COLUMNS}
                columnGap={3}
                px={4}
                py={2.5}
                bg="bg.subtle"
                fontSize="2xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
                color="text.muted"
              >
                <Text>#</Text>
                <Text>{t("pages.cycleDetail.fieldDates")}</Text>
                <Text>{t("pages.cycleDetail.fieldKiller")}</Text>
                <Text>{t("pages.cycleDetail.fieldAttack")}</Text>
                <Text>{t("pages.cycleDetail.fieldAlteration")}</Text>
                <span />
              </Box>
              {timed.map((item) => <RotationRow key={item.rotation.position} item={item} cycle={cycle} />)}
            </Box>
          )}
        </VStack>
      </Container>
    </>
  );
};

export default CycleDetailPage;
