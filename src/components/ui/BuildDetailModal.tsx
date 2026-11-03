import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Box,
  Text,
  HStack,
  Badge,
  Image,
  Flex,
  SimpleGrid,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import { useState, type ReactNode } from "react";
import { FiColumns, FiList, FiMaximize2 } from "react-icons/fi";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { AlterationImage } from "./AlterationImage";
import { ScoreBadge } from "./ScoreBadge";
import { ImageLightbox } from "./ImageLightbox";
import { formatChrono } from "@/utils/chrono";
import { UserDisplay } from "./UserDisplay";
import { BuildTeamBanner, BuildTeamRows, type BuildTeamLayout } from "./BuildTeam";
import type { IBuild } from "../../interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { bucketUrl } from "@/utils/apiRequest";
import { BuildGuildPlayers } from "@/components/guides/BuildGuildPlayers";

interface BuildDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: IBuild | null;
  onEdit?: (build: IBuild) => void;
}

// Result tile (score, times)
const ResultTile = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border.subtle" px={3} py={1.5} minW="110px">
    <Text fontSize="2xs" color="text.muted" textTransform="uppercase" letterSpacing="wide" fontWeight="semibold">{label}</Text>
    <Box fontSize="md" fontWeight="extrabold" color="text.strong" sx={{ fontVariantNumeric: "tabular-nums" }}>{children}</Box>
  </Box>
);

const LAYOUT_KEY = "buildDetailModal.layout";

const readLayout = (): BuildTeamLayout => {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "rows" ? "rows" : "banner";
  } catch {
    return "banner";
  }
};

const downloadImage = async (src: string, filename: string) => {
  try {
    const blob = await (await fetch(src)).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank");
  }
};

export const BuildDetailModal = ({
  isOpen,
  onClose,
  build,
  onEdit,
}: BuildDetailModalProps) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEdit =
    build &&
    currentUser &&
    (build.user_id === currentUser._id || currentUser.is_admin);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [layout, setLayout] = useState<BuildTeamLayout>(readLayout);
  const changeLayout = (next: BuildTeamLayout) => {
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      // Storage unavailable: the choice only applies to this session
    }
  };
  const screenshotUrl = build?.screenshot ? `${bucketUrl}/builds/${build.screenshot}` : null;
  const hasResult = build != null && (build.score != null || build.time_normal_wave != null || build.time_extra_wave != null);

  const handleEdit = () => {
    if (build && onEdit) {
      onEdit(build);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        {/* Header: rotation, author and status */}
        <ModalHeader borderBottomWidth="1px" borderColor="border.subtle" pb={4}>
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap={3} pr={8} direction={{ base: "column", md: "row" }}>
            <Box minW={0}>
              {build?.rotation ? (
                <HStack spacing={2} flexWrap="wrap">
                  <AttackTypeBadge attackType={build.rotation.attack} size="14px" />
                  <Text fontSize="xl" fontWeight="extrabold" color="text.strong">
                    {t(`factions.${build.rotation.killer}`, build.rotation.killer)}
                  </Text>
                  {build.rotation.alteration && (
                    <HStack spacing={1.5}>
                      <AlterationImage alteration={build.rotation.alteration} size="18px" />
                      <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                        {t(`alterations.${build.rotation.alteration}`, build.rotation.alteration)}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              ) : (
                <Text fontSize="xl" fontWeight="extrabold">{t("components.buildDetailModal.title")}</Text>
              )}
              <HStack spacing={3} mt={1} fontSize="sm" fontWeight="normal" color="text.muted" flexWrap="wrap">
                {build?.user && <UserDisplay user={build.user} avatarSize="xs" textSize="sm" />}
                <Text>{formatDate(build?.created_at)}</Text>
              </HStack>
            </Box>
            <HStack spacing={2} flexWrap="wrap" align="center" flexShrink={0}>
              {hasResult && build && (
                <>
                  {build.score != null && (
                    <ResultTile label={t("components.buildDetailModal.score")}>
                      <ScoreBadge score={build.score} fontSize="md" commas />
                    </ResultTile>
                  )}
                  {build.time_normal_wave != null && (
                    <ResultTile label={t("components.buildDetailModal.timeNormalWave")}>
                      {formatChrono(build.time_normal_wave)}
                    </ResultTile>
                  )}
                  {build.time_extra_wave != null && (
                    <ResultTile label={t("components.buildDetailModal.timeExtraWave")}>
                      {formatChrono(build.time_extra_wave)}
                    </ResultTile>
                  )}
                </>
              )}
              {build && canEdit && (
                <Badge
                  colorScheme={build.isValid ? "green" : "yellow"}
                  variant="subtle"
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  flexShrink={0}
                >
                  <Icon as={build.isValid ? CheckCircleIcon : TimeIcon} boxSize={3} />
                  {build.isValid
                    ? t("components.buildDetailModal.statusValid")
                    : t("components.buildDetailModal.statusPending")}
                </Badge>
              )}
            </HStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody p={5}>
          {build && (
            <VStack align="stretch" spacing={5}>
              <Box>
                <Flex justify="space-between" align="center" gap={3} mb={3}>
                  <Text fontWeight="bold" color="text.strong">
                    {t("components.buildDetailModal.teamComposition")}
                  </Text>
                  <HStack spacing={0.5} flexShrink={0}>
                    {([["banner", "layoutBanner", FiColumns], ["rows", "layoutRows", FiList]] as const).map(([mode, labelKey, ModeIcon]) => {
                      const label = t(`components.buildDetailModal.${labelKey}`);
                      return (
                        <Tooltip key={mode} label={label} placement="top" hasArrow openDelay={400}>
                          <IconButton
                            aria-label={label}
                            aria-pressed={layout === mode}
                            icon={<Icon as={ModeIcon} />}
                            size="sm"
                            variant={layout === mode ? "solid" : "ghost"}
                            colorScheme={layout === mode ? "purple" : "gray"}
                            onClick={() => changeLayout(mode)}
                          />
                        </Tooltip>
                      );
                    })}
                  </HStack>
                </Flex>
                {layout === "rows" ? <BuildTeamRows team={build.team ?? []} /> : <BuildTeamBanner team={build.team ?? []} />}
              </Box>

              <BuildGuildPlayers build={build} />

              {(screenshotUrl || build.description) && (
                <SimpleGrid columns={{ base: 1, md: screenshotUrl && build.description ? 2 : 1 }} spacing={4} alignItems="start">
                  {screenshotUrl && (
                    <Box
                      as="button"
                      onClick={() => setLightboxOpen(true)}
                      borderRadius="xl"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      bg="bg.inset"
                      position="relative"
                      role="group"
                      aria-label={t("components.buildDetailModal.screenshotOpen")}
                    >
                      <Image src={screenshotUrl} alt={t("components.buildDetailModal.screenshot")} w="100%" maxH="320px" objectFit="contain" />
                      <HStack
                        position="absolute"
                        bottom={2}
                        right={2}
                        spacing={1}
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg="blackAlpha.700"
                        color="white"
                        fontSize="xs"
                        opacity={0.85}
                        _groupHover={{ opacity: 1 }}
                      >
                        <Icon as={FiMaximize2} />
                        <Text>{t("components.buildDetailModal.screenshotOpen")}</Text>
                      </HStack>
                    </Box>
                  )}
                  {build.description && (
                    <Box p={4} bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
                      <Text fontSize="xs" color="text.muted" mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                        {t("components.buildDetailModal.description")}
                      </Text>
                      <Text whiteSpace="pre-wrap" color="text.body">{build.description}</Text>
                    </Box>
                  )}
                </SimpleGrid>
              )}

              {build.updated_at && build.updated_at !== build.created_at && (
                <Text fontSize="xs" color="text.muted">
                  {t("components.buildDetailModal.dateModified")} {formatDate(build.updated_at)}
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="border.subtle">
          <HStack spacing={3}>
            {canEdit && onEdit && (
              <Button leftIcon={<EditIcon />} colorScheme="purple" onClick={handleEdit} size="sm">
                {t("components.buildDetailModal.buttonEdit")}
              </Button>
            )}
            <Button onClick={onClose} size="sm" variant="ghost">
              {t("components.buildDetailModal.buttonClose")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
      <ImageLightbox
        src={lightboxOpen ? screenshotUrl : null}
        label={t("components.buildDetailModal.screenshot")}
        characterName={build?.rotation ? t(`factions.${build.rotation.killer}`, build.rotation.killer) : "build"}
        onClose={() => setLightboxOpen(false)}
        onDownload={downloadImage}
      />
    </Modal>
  );
};
