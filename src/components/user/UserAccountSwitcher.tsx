import { Badge, Button, HStack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IBbsAccount } from "@/interfaces";

interface UserAccountSwitcherProps {
  accounts: IBbsAccount[];
  activeBbsId?: string;
}

const mutedText = "text.muted";

// bbs account switcher: a player can own several accounts (alts), each with its own stats.
// bbs_name is not guaranteed unique, so each link carries ?compte=<bbs_id> to target the exact
// account; the highlight is also based on bbs_id.
export const UserAccountSwitcher = ({ accounts, activeBbsId }: UserAccountSwitcherProps) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const nameCounts = new Map<string, number>();
  accounts.forEach((a) => {
    const key = a.bbs_name || a.bbs_id;
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  });

  return (
    <HStack spacing={2} align="center" flexWrap="wrap">
          <Text fontSize="xs" fontWeight="semibold" color={mutedText}>
            {t("pages.user.accountsLabel")}
          </Text>
          <Wrap spacing={1.5}>
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
                    size="xs"
                    borderRadius="full"
                    colorScheme={isActive ? "purple" : "gray"}
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
    </HStack>
  );
};
