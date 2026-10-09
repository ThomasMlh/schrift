import { Badge, Box, Button, Icon, Select, Text, VStack } from "@chakra-ui/react";
import type { AdminPage } from "@/interfaces";
import { ADMIN_TAB_GROUPS, type AdminTab } from "./adminTabs";

interface AdminSidebarProps {
  tabs: AdminTab[];
  current: AdminPage;
  onChange: (page: AdminPage) => void;
  // Compteurs affichés à droite de certains onglets (ex : bannis, alertes)
  counters?: Partial<Record<AdminPage, number>>;
}

const groupedTabs = (tabs: AdminTab[]) =>
  ADMIN_TAB_GROUPS
    .map((group) => ({ ...group, tabs: tabs.filter((tab) => tab.group === group.key) }))
    .filter((group) => group.tabs.length > 0);

// Navigation de l'administration : colonne à gauche sur grand écran
export const AdminSidebar = ({ tabs, current, onChange, counters = {} }: AdminSidebarProps) => (
  <Box
    as="nav"
    aria-label="Sections de l'administration"
    display={{ base: "none", lg: "block" }}
    w="230px"
    flexShrink={0}
    position="sticky"
    top="16px"
    bg="bg.card"
    borderWidth="1px"
    borderColor="border.subtle"
    borderRadius="xl"
    p={3}
  >
    <VStack align="stretch" spacing={4}>
      {groupedTabs(tabs).map((group) => (
        <Box key={group.key}>
          {group.label && (
            <Text
              fontSize="2xs"
              fontWeight="semibold"
              letterSpacing="widest"
              textTransform="uppercase"
              color="text.muted"
              px={3}
              mb={1}
            >
              {group.label}
            </Text>
          )}
          <VStack align="stretch" spacing={0.5}>
            {group.tabs.map((tab) => {
              const isActive = current === tab.key;
              const count = counters[tab.key];
              return (
                <Button
                  key={tab.key}
                  onClick={() => onChange(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  size="sm"
                  h="36px"
                  justifyContent="flex-start"
                  borderRadius="lg"
                  position="relative"
                  variant="ghost"
                  fontWeight={isActive ? "semibold" : "normal"}
                  color={isActive ? "purple.300" : "text.secondary"}
                  bg={isActive ? "rgba(159, 122, 234, 0.14)" : "transparent"}
                  _light={{ color: isActive ? "purple.700" : "gray.600", bg: isActive ? "purple.50" : "transparent" }}
                  _hover={{ bg: isActive ? undefined : "bg.hover", color: isActive ? undefined : "text.strong" }}
                  leftIcon={<Icon as={tab.icon} boxSize={4} />}
                  _before={isActive ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "8px",
                    bottom: "8px",
                    w: "3px",
                    borderRadius: "full",
                    bg: "purple.400",
                  } : undefined}
                >
                  <Text as="span" flex={1} textAlign="left" noOfLines={1}>{tab.label}</Text>
                  {count != null && count > 0 && (
                    <Badge
                      ml={2}
                      borderRadius="full"
                      px={2}
                      fontSize="2xs"
                      colorScheme={tab.key === "banned" ? "red" : "orange"}
                      variant="subtle"
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </VStack>
        </Box>
      ))}
    </VStack>
  </Box>
);

// Navigation sur mobile et tablette : liste déroulante groupée
export const AdminSectionSelect = ({ tabs, current, onChange, counters = {} }: AdminSidebarProps) => (
  <Box display={{ base: "block", lg: "none" }} mb={4}>
    <Select
      id="admin-section"
      aria-label="Section de l'administration"
      value={current}
      onChange={(e) => onChange(e.target.value as AdminPage)}
      bg="bg.card"
      borderColor="border.subtle"
      borderRadius="lg"
    >
      {groupedTabs(tabs).map((group) => {
        const options = group.tabs.map((tab) => {
          const count = counters[tab.key];
          return (
            <option key={tab.key} value={tab.key}>
              {tab.label}{count ? ` (${count})` : ""}
            </option>
          );
        });
        return group.label
          ? <optgroup key={group.key} label={group.label}>{options}</optgroup>
          : options;
      })}
    </Select>
  </Box>
);
