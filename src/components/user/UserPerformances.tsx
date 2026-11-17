import { VStack, Heading, Text, Center } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { UserRotationsChart } from "@/components/charts/UserRotationsChart";
import type { IUserStats } from "@/hooks/useAPI";

interface UserPerformancesProps {
  stats: IUserStats;
}

export const UserPerformances = ({ stats }: UserPerformancesProps) => {
  const { t } = useTranslation();
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">{t("components.user.performances.headingAvgByRotation")}</Heading>
      <Text fontSize="sm" color="gray.500">
        {t("components.user.performances.subtitleAllRotations")}
      </Text>
      <Text fontSize="xs" color="gray.400" fontStyle="italic">
        {t("components.user.performances.notePerformance")}
      </Text>
      {stats.allRotations.length > 0 ? (
        <UserRotationsChart rotations={stats.allRotations} showAll={true} />
      ) : (
        <Center py={10}>
          <Text color="gray.500">{t("components.user.performances.noData")}</Text>
        </Center>
      )}

    </VStack>
  );
};
