import {
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Icon
} from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IUser } from "@/interfaces";

interface BanDetailsCardProps {
  user: IUser;
}

export const BanDetailsCard = ({ user }: BanDetailsCardProps) => {
  const cardBg = "bg.card";
  const { t } = useTranslation();

  if (!user.is_banned) return null;

  return (
    <Card mb={6} bg={cardBg} borderRadius="xl" boxShadow="lg" borderLeft="4px solid" borderLeftColor="red.500">
      <CardBody>
        <HStack spacing={3} mb={3}>
          <Icon as={FiAlertCircle} boxSize={5} color="red.500" />
          <Text fontWeight="bold" fontSize="lg" color="red.500">
            {t("components.user.banDetailsCard.bannedPlayer")}
          </Text>
        </HStack>
        <VStack align="start" spacing={2}>
          {user.ban_reason && (
            <HStack spacing={2}>
              <Text fontWeight="semibold" color="gray.600" _dark={{ color: "gray.400" }}>{t("components.user.banDetailsCard.labelBanReason")}</Text>
              <Text>{user.ban_reason}</Text>
            </HStack>
          )}
          {user.banned_at && (
            <HStack spacing={2}>
              <Text fontWeight="semibold" color="gray.600" _dark={{ color: "gray.400" }}>{t("components.user.banDetailsCard.labelBannedOn")}</Text>
              <Text>
                {new Date(user.banned_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
