import { Alert, AlertIcon, Box, Button, Circle, Container, HStack, Icon, Skeleton, Text, VStack } from "@chakra-ui/react";
import { FiCheck, FiClock, FiInbox, FiSearch, FiX } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroSection } from "@/components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { useApplicationTracking } from "@/hooks/useAPI";
import type { IApplicationTracking } from "@/hooks/useAPI";

type StepState = "done" | "current" | "todo" | "failed";

interface Step {
  icon: IconType;
  title: string;
  description?: string;
  state: StepState;
}

const STEP_COLORS: Record<StepState, string> = {
  done: "green.400",
  current: "purple.400",
  todo: "gray.500",
  failed: "red.400",
};

const formatDate = (iso: string | null, locale: string) =>
  iso ? new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : undefined;

const buildSteps = (app: IApplicationTracking, t: (key: string, options?: Record<string, unknown>) => string, locale: string): Step[] => {
  const decided = app.status === "accepted" || app.status === "rejected";
  const review: Step = app.status === "waitlist"
    ? {
        icon: FiClock,
        title: t("pages.recruitmentTracking.waitlist"),
        description: t("pages.recruitmentTracking.waitlistPosition", { position: app.waitlist_position ?? 1 }),
        state: "current",
      }
    : {
        icon: FiSearch,
        title: t("pages.recruitmentTracking.review"),
        description: decided ? undefined : t("pages.recruitmentTracking.reviewHelp"),
        state: decided ? "done" : "current",
      };
  const decision: Step = app.status === "accepted"
    ? {
        icon: FiCheck,
        title: t("pages.recruitmentTracking.accepted", { guild: app.guild_name ?? "Schrift" }),
        description: formatDate(app.reviewed_at, locale),
        state: "done",
      }
    : app.status === "rejected"
      ? { icon: FiX, title: t("pages.recruitmentTracking.rejected"), description: formatDate(app.reviewed_at, locale), state: "failed" }
      : { icon: FiCheck, title: t("pages.recruitmentTracking.decision"), state: "todo" };

  return [
    {
      icon: FiInbox,
      title: t("pages.recruitmentTracking.sent"),
      description: formatDate(app.created_at, locale),
      state: "done",
    },
    review,
    decision,
  ];
};

// Public page reached through the private link given after applying
const RecruitmentTrackingPage = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { application, notFound, isLoading } = useApplicationTracking(token);

  return (
    <>
      <SEOHead title={t("pages.recruitmentTracking.seoTitle")} description={t("pages.recruitmentTracking.seoTitle")} noIndex />
      <HeroSection title={t("pages.recruitmentTracking.heroTitle")} description={application?.bbs_name ?? ""} />

      <Container maxW="container.sm" px={{ base: 4, md: 6 }} py={10}>
        {isLoading ? (
          <Skeleton h="220px" borderRadius="xl" />
        ) : notFound || !application ? (
          <Alert status="error" borderRadius="lg"><AlertIcon />{t("pages.recruitmentTracking.notFound")}</Alert>
        ) : (
          <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={{ base: 4, md: 6 }}>
            <VStack align="stretch" spacing={0}>
              {buildSteps(application, t, i18n.language).map((step, index, steps) => (
                <HStack key={step.title} align="stretch" spacing={4}>
                  <VStack spacing={0}>
                    <Circle
                      size="36px"
                      bg={step.state === "todo" ? "transparent" : STEP_COLORS[step.state]}
                      borderWidth="2px"
                      borderColor={STEP_COLORS[step.state]}
                      color={step.state === "todo" ? STEP_COLORS.todo : "white"}
                    >
                      <Icon as={step.icon} />
                    </Circle>
                    {index < steps.length - 1 && <Box flex={1} w="2px" minH="28px" bg="border.subtle" />}
                  </VStack>
                  <Box pb={index < steps.length - 1 ? 6 : 0} pt={1.5}>
                    <Text fontWeight="semibold" color={step.state === "todo" ? "text.muted" : "text.strong"}>{step.title}</Text>
                    {step.description && <Text fontSize="sm" color="text.muted">{step.description}</Text>}
                  </Box>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
        <Button as={RouterLink} to="/recrutement" variant="ghost" size="sm" mt={6}>
          {t("pages.recruitmentTracking.back")}
        </Button>
      </Container>
    </>
  );
};

export default RecruitmentTrackingPage;
