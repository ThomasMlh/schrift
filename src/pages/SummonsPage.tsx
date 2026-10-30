import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Container, Flex, Input, InputGroup, InputLeftElement, SimpleGrid, Tab, TabList, Tabs, Text, VStack } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { HeroSection } from "@/components/HeroSection";
import { SEOHead } from "@/components/SEOHead";
import { SummonCard, SummonTicketRow } from "@/components/summons/SummonCatalogEntry";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PageLoader } from "@/components/ui/PageLoader";
import { Pagination } from "@/components/ui/Pagination";
import { useSummonCatalog } from "@/hooks/useAPI";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { SummonListCategory } from "@/interfaces";

const CATEGORIES: SummonListCategory[] = ["character_gacha", "character_ticket", "accessory_gacha", "accessory_ticket"];
const TYPES = ["step_up", "choice", "standard"];
const PAGE_SIZE = 24;

const isTicketCategory = (category: SummonListCategory) => category.endsWith("_ticket");

const SummonsPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("categorie") as SummonListCategory | null;
  const category = urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : CATEGORIES[0];
  const type = searchParams.get("type") ?? "";
  const year = searchParams.get("annee") ?? "";
  const ongoing = searchParams.get("en-cours") === "1";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const isTicket = isTicketCategory(category);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search, 300);

  // Any filter change goes back to the first page; the kept filters stay shareable in the URL
  const updateParams = (changes: Record<string, string>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("page");
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("q") ?? "")) updateParams({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { summons, total, counts, years, isLoading, error } = useSummonCatalog({
    category,
    search: searchParams.get("q") ?? "",
    type,
    year,
    ongoing: ongoing && !isTicket,
    page,
    limit: PAGE_SIZE,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = Boolean(search || type || year || ongoing);

  const selectCategory = (index: number) => {
    // The years depend on the category, and the ongoing filter does not apply to tickets
    updateParams({ categorie: CATEGORIES[index] === CATEGORIES[0] ? "" : CATEGORIES[index], annee: "", "en-cours": "", type: "" });
  };

  const clearFilters = () => {
    setSearch("");
    updateParams({ q: "", type: "", annee: "", "en-cours": "" });
  };

  return (
    <>
      <SEOHead
        title={t("pages.summons.seoTitle")}
        description={t("pages.summons.seoDescription")}
        keywords="Bleach Brave Souls, BBS, invocations, loteries, tickets, accessoires, bannières"
        url="https://bbs-schrift.fr/invocations"
      />
      <Box mb="150px">
        <HeroSection title={t("pages.summons.heroTitle")} description={t("pages.summons.heroDescription")} />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={5} align="stretch">
            <Tabs index={CATEGORIES.indexOf(category)} onChange={selectCategory} variant="soft-rounded" colorScheme="purple" size="sm" isManual>
              <TabList overflowX="auto" gap={1} pb={1}>
                {CATEGORIES.map((key) => (
                  <Tab key={key} flexShrink={0} whiteSpace="nowrap" color="text.muted">
                    {t(`pages.summons.category_${key}`)}
                    {counts[key] !== undefined && <Text as="span" ml={2} fontWeight="normal" opacity={0.7}>{counts[key]}</Text>}
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            <Flex gap={3} wrap="wrap" align="center">
              <InputGroup flex="1 1 260px" maxW={{ md: "420px" }}>
                <InputLeftElement pointerEvents="none"><SearchIcon color="text.muted" /></InputLeftElement>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("pages.summons.searchPlaceholder")}
                  aria-label={t("pages.summons.searchPlaceholder")}
                />
              </InputGroup>
              <Box w={{ base: "calc(50% - 6px)", md: "170px" }}>
                <CustomSelect
                  options={[
                    { value: "", label: t("pages.summons.allTypes") },
                    ...TYPES.map((value) => ({ value, label: t(`pages.summons.type_${value}`) })),
                  ]}
                  value={type}
                  onChange={(value) => updateParams({ type: value })}
                />
              </Box>
              <Box w={{ base: "calc(50% - 6px)", md: "170px" }}>
                <CustomSelect
                  options={[
                    { value: "", label: t("pages.summons.allYears") },
                    ...years.map((value) => ({ value: String(value), label: String(value) })),
                  ]}
                  value={year}
                  onChange={(value) => updateParams({ annee: value })}
                />
              </Box>
              {!isTicket && (
                <Button
                  size="md"
                  variant={ongoing ? "solid" : "outline"}
                  colorScheme={ongoing ? "green" : "gray"}
                  aria-pressed={ongoing}
                  onClick={() => updateParams({ "en-cours": ongoing ? "" : "1" })}
                >
                  {t("pages.characterDetail.summonOngoing")}
                </Button>
              )}
              {hasFilters && <Button variant="ghost" onClick={clearFilters}>{t("pages.summons.clearFilters")}</Button>}
            </Flex>

            {isLoading && summons.length === 0 ? (
              <PageLoader color="purple.500" height="200px" />
            ) : error ? (
              <Text color="red.400">{t("pages.summons.loadError")}</Text>
            ) : summons.length === 0 ? (
              <Text color="text.muted">{t("pages.summons.empty")}</Text>
            ) : (
              <>
                <Text fontSize="sm" color="text.muted">{t("pages.summons.results", { count: total })}</Text>
                {isTicket ? (
                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {summons.map((summon) => <SummonTicketRow key={summon.gacha_group_id} summon={summon} language={i18n.language} />)}
                  </SimpleGrid>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                    {summons.map((summon) => <SummonCard key={summon.gacha_group_id} summon={summon} language={i18n.language} />)}
                  </SimpleGrid>
                )}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  hasPrevPage={page > 1}
                  hasNextPage={page < totalPages}
                  onPageChange={(next) => {
                    setSearchParams((current) => {
                      const params = new URLSearchParams(current);
                      params.set("page", String(next));
                      return params;
                    });
                    window.scrollTo({ top: 0 });
                  }}
                  totalCount={total}
                  itemsOnPage={summons.length}
                />
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default SummonsPage;
