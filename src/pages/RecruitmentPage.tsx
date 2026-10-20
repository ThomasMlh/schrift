import { useState } from "react";
import {
  Alert, AlertIcon, Box, Button, Container, FormControl, FormHelperText, FormLabel, Heading, Input,
  Progress, SimpleGrid, Skeleton, Text, Textarea, VStack, useToast,
} from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { HeroSection } from "@/components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useRecruitment } from "@/hooks/useAPI";
import { useRecruitmentMutations } from "@/hooks/mutations/useRecruitmentMutations";
import type { IApplicationForm } from "@/hooks/mutations/useRecruitmentMutations";
import { formatWithCommas } from "@/utils/format";

const EMPTY_FORM: IApplicationForm = {
  bbs_name: "", bbs_id: "", discord: "", average_score: "", preferred_guild_id: "", message: "", website: "",
};

const RecruitmentPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { recruitment, isLoading } = useRecruitment();
  const { submitApplication } = useRecruitmentMutations();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field: keyof IApplicationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await submitApplication(form);
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message, duration: 4000 });
    } finally {
      setIsSending(false);
    }
  };

  const guilds = recruitment?.guilds ?? [];

  return (
    <>
      <SEOHead
        title={t("pages.recruitment.seoTitle")}
        description={t("pages.recruitment.seoDescription")}
        url="https://bbs-schrift.fr/recrutement"
      />
      <HeroSection title={t("pages.recruitment.heroTitle")} description={t("pages.recruitment.heroDescription")} />

      <Container maxW="container.lg" px={{ base: 4, md: 6 }} py={10}>
        <VStack spacing={8} align="stretch">
          {recruitment?.intro && (
            <Text whiteSpace="pre-line" color="text.secondary">{recruitment.intro}</Text>
          )}

          <Box>
            <Heading as="h2" size="md" mb={1}>{t("pages.recruitment.guildsTitle")}</Heading>
            {recruitment?.reference_cycle && (
              <Text fontSize="sm" color="text.muted" mb={4}>
                {t("pages.recruitment.guildsSubtitle", { cycle: `${recruitment.reference_cycle.name} ${recruitment.reference_cycle.year}` })}
              </Text>
            )}
            {isLoading ? (
              <Skeleton h="120px" borderRadius="xl" />
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: Math.min(Math.max(guilds.length, 1), 4) }} gap={4}>
                {guilds.map((guild) => (
                  <Box key={guild._id} bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
                    <Text fontWeight="bold" fontSize="lg" color="text.strong">{guild.name}</Text>
                    <Text fontSize="sm" color="text.muted" mt={1}>
                      {guild.average_score
                        ? t("pages.recruitment.guildAverage", { average: formatWithCommas(guild.average_score) })
                        : t("pages.recruitment.guildNoAverage")}
                    </Text>
                    <Progress
                      mt={3}
                      size="sm"
                      borderRadius="full"
                      colorScheme={guild.free_places > 0 ? "purple" : "red"}
                      value={(guild.members / (recruitment?.guild_capacity || 1)) * 100}
                    />
                    <Text fontSize="sm" mt={2} color={guild.free_places > 0 ? "green.400" : "red.400"} fontWeight="semibold">
                      {guild.free_places > 0
                        ? t("pages.recruitment.freePlaces", { count: guild.free_places })
                        : t("pages.recruitment.full")}
                      <Text as="span" color="text.muted" fontWeight="normal">
                        {" "}· {guild.members}/{recruitment?.guild_capacity}
                      </Text>
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={{ base: 4, md: 6 }}>
            <Heading as="h2" size="md" mb={4}>{t("pages.recruitment.formTitle")}</Heading>
            {!isLoading && recruitment && !recruitment.is_open ? (
              <Alert status="info" borderRadius="lg"><AlertIcon />{t("pages.recruitment.closed")}</Alert>
            ) : sent ? (
              <Alert status="success" borderRadius="lg"><AlertIcon />{t("pages.recruitment.sent")}</Alert>
            ) : (
              <VStack as="form" onSubmit={submit} spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FormControl isRequired>
                    <FormLabel>{t("pages.recruitment.bbsName")}</FormLabel>
                    <Input value={form.bbs_name} onChange={set("bbs_name")} maxLength={40} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t("pages.recruitment.bbsId")}</FormLabel>
                    <Input value={form.bbs_id} onChange={set("bbs_id")} maxLength={40} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t("pages.recruitment.discord")}</FormLabel>
                    <Input value={form.discord} onChange={set("discord")} maxLength={60} />
                    <FormHelperText>{t("pages.recruitment.discordHelp")}</FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t("pages.recruitment.averageScore")}</FormLabel>
                    <Input value={form.average_score} onChange={set("average_score")} inputMode="numeric" placeholder="600000000" />
                  </FormControl>
                </SimpleGrid>
                {guilds.length > 0 && (
                  <FormControl>
                    <FormLabel>{t("pages.recruitment.preferredGuild")}</FormLabel>
                    <CustomSelect
                      value={form.preferred_guild_id}
                      onChange={(value) => setForm((f) => ({ ...f, preferred_guild_id: value }))}
                      options={guilds.map((g) => ({ value: g._id, label: g.name }))}
                      placeholder={t("pages.recruitment.noPreference")}
                      allowDeselect
                    />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel>{t("pages.recruitment.message")}</FormLabel>
                  <Textarea value={form.message} onChange={set("message")} maxLength={1000} rows={4} />
                </FormControl>
                {/* Honeypot: invisible to people, filled in by bots */}
                <Box position="absolute" left="-9999px" aria-hidden>
                  <Input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                </Box>
                <Button type="submit" colorScheme="purple" leftIcon={<FiSend />} isLoading={isSending} alignSelf="flex-start">
                  {t("pages.recruitment.submit")}
                </Button>
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default RecruitmentPage;
