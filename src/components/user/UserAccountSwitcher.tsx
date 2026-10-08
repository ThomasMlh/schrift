import { Badge, Button, Card, CardBody, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IBbsAccount } from "@/interfaces";

interface UserAccountSwitcherProps {
  accounts: IBbsAccount[];
  activeBbsId?: string;
}

const cardBg = "bg.card";
const mutedText = "text.muted";

// Sélecteur de compte bbs : un même joueur peut avoir plusieurs comptes (alts), chacun avec ses
// propres stats. bbs_name n'étant pas garanti unique, chaque lien porte ?compte=<bbs_id> pour
// cibler le compte exact ; la surbrillance se base aussi sur le bbs_id.
export const UserAccountSwitcher = ({ accounts, activeBbsId }: UserAccountSwitcherProps) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const nameCounts = new Map<string, number>();
  accounts.forEach((a) => {
    const key = a.bbs_name || a.bbs_id;
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  });

  return (
    <Card mb={6} bg={cardBg} borderRadius="xl" boxShadow="lg">
      <CardBody py={4}>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" fontWeight="semibold" color={mutedText}>
            {t("pages.user.accountsLabel")}
          </Text>
          <Wrap spacing={2}>
            {accounts.map((account) => {
              const isActive = account.bbs_id === activeBbsId;
              const nameKey = account.bbs_name || account.bbs_id;
              const isDuplicateName = (nameCounts.get(nameKey) || 0) > 1;

              const linkParams = new URLSearchParams(searchParams);
              linkParams.set("compte", account.bbs_id);
              const to = `/joueur/${encodeURIComponent(nameKey)}?${linkParams.toString()}`;

              return (
                <WrapItem key={account.bbs_id}>
                  <Button
                    as={RouterLink}
                    to={to}
                    size="sm"
                    borderRadius="full"
                    colorScheme={isActive ? "blue" : "gray"}
                    variant={isActive ? "solid" : "outline"}
                    _hover={{ textDecoration: "none", color: "white" }}
                  >
                    {account.bbs_name || account.bbs_id}
                    {isDuplicateName && (
                      <Text as="span" fontSize="2xs" opacity={0.7} ml={1}>
                        ({account.bbs_id})
                      </Text>
                    )}
                    {account.is_primary && !isActive && (
                      <Badge ml={2} colorScheme={"purple"} fontSize="2xs">
                        {t("pages.user.accountPrimary")}
                      </Badge>
                    )}
                  </Button>
                </WrapItem>
              );
            })}
          </Wrap>
        </VStack>
      </CardBody>
    </Card>
  );
};
