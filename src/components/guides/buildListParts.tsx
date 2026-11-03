import { Avatar, Box, HStack, IconButton, Image, Text, Tooltip, VStack, type BoxProps } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import type { IBuild, IBuildLink } from "@/interfaces";
import { formatChrono } from "@/utils/chrono";
import { formatBuildDate, thumbUrl, useMissing } from "@/utils/buildList";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { AlterationImage } from "../ui/AlterationImage";
import { ScoreBadge } from "../ui/ScoreBadge";
import { UserDisplay } from "../ui/UserDisplay";

// Shared pieces of the build list views (cards and rows)

export interface BuildListRotation {
  killer: string;
  attack: string;
  alteration: string;
}

export interface BuildListItemProps {
  build: IBuild;
  rotation?: BuildListRotation;
  canEdit: boolean;
  onOpen: (build: IBuild) => void;
  onEdit: (build: IBuild, e: React.MouseEvent) => void;
  // Album of the viewer: shows what they own and greys out the rest
  owned?: Record<string, number>;
}

export const RotationLabel = ({ rotation, onImage = false }: { rotation?: BuildListRotation; onImage?: boolean }) => {
  const { t } = useTranslation();
  if (!rotation) {
    return <Text fontSize="sm" color={onImage ? "whiteAlpha.800" : "text.muted"} fontStyle="italic">{t("components.rotationsBuildsGuide.titleAllBuilds")}</Text>;
  }
  return (
    <HStack spacing={1.5} flexWrap="wrap" minW={0}>
      <AttackTypeBadge attackType={rotation.attack} size="10px" />
      <Text fontWeight="extrabold" color={onImage ? "white" : "text.strong"} noOfLines={1}>
        {t(`factions.${rotation.killer}`, rotation.killer)}
      </Text>
      {rotation.alteration && (
        <HStack spacing={1}>
          <AlterationImage alteration={rotation.alteration} size="14px" />
          <Text fontSize="xs" color={onImage ? "whiteAlpha.800" : "text.muted"}>
            {t(`alterations.${rotation.alteration}`, rotation.alteration)}
          </Text>
        </HStack>
      )}
    </HStack>
  );
};

export const LinkThumbs = ({ links, owned, size = "26px" }: { links?: IBuildLink[]; owned?: Record<string, number>; size?: string }) => {
  const missing = useMissing(owned);
  if (!links?.length) return null;
  return (
    <HStack spacing={1}>
      {links.slice(0, 3).map((link, i) => (
        <Tooltip key={i} label={link.character?.name || "?"} hasArrow>
          <Image
            src={thumbUrl(link.id_character)}
            alt={link.character?.name || "?"}
            boxSize={size}
            borderRadius="md"
            objectFit="cover"
            bg="bg.inset"
            sx={missing(link.id_character)}
          />
        </Tooltip>
      ))}
    </HStack>
  );
};

// Score and wave times, or a hint when the build has no result
export const BuildResult = ({ build, align = "left" }: { build: IBuild; align?: "left" | "right" }) => {
  const { t } = useTranslation();
  if (build.score == null) {
    return <Text fontSize="sm" color="text.muted" fontStyle="italic">{t("components.rotationsBuildsGuide.noResult")}</Text>;
  }
  const times = [
    build.time_normal_wave != null ? `${t("components.rotationsBuildsGuide.waveNormal")} ${formatChrono(build.time_normal_wave)}` : null,
    build.time_extra_wave != null ? `${t("components.rotationsBuildsGuide.waveExtra")} ${formatChrono(build.time_extra_wave)}` : null,
  ].filter(Boolean);
  return (
    <VStack spacing={0.5} align={align === "right" ? "flex-end" : "flex-start"}>
      <ScoreBadge score={build.score} fontSize="md" commas />
      {times.length > 0 && (
        <Text fontSize="xs" color="text.muted" sx={{ fontVariantNumeric: "tabular-nums" }}>{times.join(" · ")}</Text>
      )}
    </VStack>
  );
};

export const BuildAuthor = ({ build, align = "left" }: { build: IBuild; align?: "left" | "right" }) => {
  const { t } = useTranslation();
  return (
    <VStack spacing={0} align={align === "right" ? "flex-end" : "flex-start"} minW={0}>
      {build.user ? (
        <UserDisplay user={build.user} avatarSize="xs" textSize="sm" />
      ) : (
        <HStack spacing={2}>
          <Avatar size="xs" />
          <Text fontSize="sm" color="text.muted">{t("components.rotationsBuildsGuide.anonymous")}</Text>
        </HStack>
      )}
      <Text fontSize="xs" color="text.muted">{formatBuildDate(build.created_at)}</Text>
    </VStack>
  );
};

export const EditBuildButton = ({ build, onEdit }: { build: IBuild; onEdit: (build: IBuild, e: React.MouseEvent) => void }) => {
  const { t } = useTranslation();
  return (
    <Tooltip label={t("common.edit")} hasArrow>
      <IconButton
        aria-label={t("components.rotationsBuildsGuide.ariaEditBuild")}
        icon={<EditIcon />}
        size="sm"
        variant="ghost"
        onClick={(e) => { e.stopPropagation(); onEdit(build, e); }}
      />
    </Tooltip>
  );
};

export const PositionBadge = ({ value, ...props }: { value: number } & BoxProps) => (
  <Box
    position="absolute"
    bg="purple.500"
    color="white"
    borderRadius="full"
    fontSize="2xs"
    fontWeight="bold"
    minW="18px"
    h="18px"
    lineHeight="18px"
    textAlign="center"
    px={1}
    {...props}
  >
    {value}
  </Box>
);
