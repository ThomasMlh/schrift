import { HStack, Icon, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiChevronRight, FiLayers } from "react-icons/fi";
import { useBuilds } from "@/hooks/useAPI";
import { useMyAlbum } from "@/hooks/useMyAlbum";
import { albumTabUrl } from "@/utils/buildOwnership";

// Home page line under the featured rotation: shared builds, and how many the viewer can play
export const FeaturedRotationBuilds = ({ rotationId }: { rotationId: string }) => {
  const { t } = useTranslation();
  const { account, hasAlbum, isLoading: isLoadingAlbum } = useMyAlbum();
  const { pagination, isLoading } = useBuilds({ rotation_id: rotationId, isValid: true, limit: 1 });
  const { pagination: playable } = useBuilds({
    rotation_id: rotationId,
    isValid: true,
    limit: 1,
    playable_by: hasAlbum ? account?.bbs_id : undefined,
  });

  if (isLoading || !pagination) return null;
  const total = pagination.totalCount;

  return (
    <HStack spacing={2} fontSize="sm" color="text.muted" wrap="wrap">
      <Icon as={FiLayers} />
      <Link as={RouterLink} to={`/guides/rotations-builds?rotation=${rotationId}`} color="text.secondary" _hover={{ color: "accent" }}>
        {t("components.buildOwnership.homeBuilds", { count: total })}
        {total > 0 && hasAlbum && playable && ` · ${t("components.buildOwnership.homePlayable", { count: playable.totalCount })}`}
        <Icon as={FiChevronRight} ml={0.5} verticalAlign="middle" />
      </Link>
      {total > 0 && account && !hasAlbum && !isLoadingAlbum && (
        <Link as={RouterLink} to={albumTabUrl(account)} color="accent" fontSize="xs">
          {t("components.buildOwnership.homeFillAlbum")}
        </Link>
      )}
    </HStack>
  );
};
