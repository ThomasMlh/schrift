import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import type { ReactElement } from "react";
import type { IGuild, Role } from "@/interfaces";
import type { DraftAccount } from "@/utils/draftBoard";
import { GuildTag, RoleIcon } from "./DraftPlayerChip";

export interface DraftActionsProps {
  account: DraftAccount;
  finalGuildId: string | null;
  finalRole: Role | null;
  isChanged: boolean;
  guilds: IGuild[];
  guildColor: (guildId: string | null) => string;
  counts: Record<string, number>;
  onMove: (toGuildId: string | null) => void;
  onRole: (role: Role) => void;
  onReset: () => void;
}

const ROLES: { value: Role; label: string }[] = [
  { value: "membre", label: "Membre" },
  { value: "sous-chef", label: "Sous-chef" },
  { value: "chef", label: "Chef" },
];

const Label = ({ children }: { children: string }) => (
  <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted">{children}</Text>
);

// Destination and role choices for one account, shared by the desktop popover and the mobile sheet
export const DraftActionsContent = ({
  account, finalGuildId, finalRole, isChanged, guilds, guildColor, counts, onMove, onRole, onReset, onDone,
}: DraftActionsProps & { onDone: () => void }) => {
  const targets = [...guilds.map((g) => ({ id: g._id as string | null, name: g.name })), { id: null, name: "Sans" }]
    .filter((target) => target.id !== finalGuildId);
  const act = (fn: () => void) => () => { fn(); onDone(); };

  return (
    <VStack align="stretch" spacing={3}>
      <HStack spacing={2}>
        <Text fontWeight="bold" noOfLines={1}>{account.name}</Text>
        <GuildTag guild={finalGuildId ? { name: guilds.find((g) => g._id === finalGuildId)?.name ?? "?", color: guildColor(finalGuildId) } : null} />
      </HStack>
      <VStack align="stretch" spacing={1.5}>
        <Label>Déplacer vers</Label>
        <SimpleGrid columns={Math.min(targets.length, 4)} spacing={1.5}>
          {targets.map((target) => {
            const count = target.id ? counts[target.id] ?? 0 : null;
            return (
              <Button key={target.id ?? "none"} size="sm" variant="outline" colorScheme={guildColor(target.id)} onClick={act(() => onMove(target.id))} px={2}>
                {target.name}
                {count != null && <Text as="span" ml={1} fontSize="2xs" color={count >= 20 ? "red.300" : "text.muted"}>{count}</Text>}
              </Button>
            );
          })}
        </SimpleGrid>
      </VStack>
      {finalGuildId && (
        <VStack align="stretch" spacing={1.5}>
          <Label>Rôle</Label>
          <SimpleGrid columns={3} spacing={1.5}>
            {ROLES.map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={finalRole === value ? "solid" : "outline"}
                colorScheme={finalRole === value ? "purple" : "gray"}
                onClick={act(() => onRole(value))}
                leftIcon={<RoleIcon role={value} />}
                px={2}
              >
                {label}
              </Button>
            ))}
          </SimpleGrid>
        </VStack>
      )}
      {isChanged && (
        <Button size="sm" variant="ghost" colorScheme="red" onClick={act(onReset)}>
          Annuler ce changement
        </Button>
      )}
    </VStack>
  );
};

// Desktop: the chip opens a popover with the choices
export const DraftActionsPopover = ({ trigger, ...props }: DraftActionsProps & { trigger: ReactElement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} isLazy placement="bottom-start">
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <Portal>
        <PopoverContent w="300px" bg="bg.card" borderColor="border.subtle">
          <PopoverArrow bg="bg.card" />
          <PopoverBody p={3}>
            <DraftActionsContent {...props} onDone={onClose} />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

// Mobile: the same choices in a sheet sliding from the bottom
export const DraftActionsSheet = ({ isOpen, onClose, ...props }: DraftActionsProps & { isOpen: boolean; onClose: () => void }) => (
  <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
    <DrawerOverlay />
    <DrawerContent bg="bg.card" borderTopRadius="2xl">
      <DrawerBody py={5}>
        <DraftActionsContent {...props} onDone={onClose} />
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);
