import {
  Tabs, TabList, TabPanels, TabPanel, Tab,
  Box, VStack, Text, HStack, Select, IconButton,
  useToast, useColorModeValue,
  TabIndicator
} from "@chakra-ui/react";

type Role = "chef" | "sous-chef" | "membre";
export type Guild = {
  _id: string;
  name: string;
};
export type Member = {
  _id: string;
  name: string;
  role: Role;
  guilde_id: string;
};

type GuildTabsListProps = {
  guilds: Guild[];
  membersByGuild: Record<string, Member[]>;
  editable?: boolean;
  onRoleChange?: (guildId: string, member: Member, newRole: Role) => void;
  onRemoveMember?: (guildId: string, memberId: string) => void;
  onMoveMember?: (fromGuildId: string, member: Member, toGuildId: string) => void;
  allGuildsForMove?: Guild[];
};

export function GuildTabsList({
  guilds,
  membersByGuild,
  editable = false,
  onRoleChange,
  onRemoveMember,
  onMoveMember,
  allGuildsForMove
}: GuildTabsListProps) {
  const toast = useToast();
  const boxShadow = useColorModeValue('md', 'md');
  const bgColor = useColorModeValue('white', 'gray.800');
  return (
    <Tabs variant='enclosed' colorScheme="white" isFitted w="80%">
      <TabList>
        {guilds.map((guild: Guild) => (
          <Tab
            key={guild._id}
            _focus={{ boxShadow: 'none' }}
            _focusVisible={{ boxShadow: 'outline' }}
            borderTopLeftRadius="md"
            borderTopRightRadius="md"
            borderBottomLeftRadius="0"
            borderBottomRightRadius="0"
          >
            Ṣčhrīft {guild.name}
          </Tab>
        ))}
      </TabList>
      {/* <TabIndicator mt='-1.5px' height='2px' bg='blue.500' borderRadius='1px' /> */}
      <TabPanels>
        {guilds.map((guild: Guild) => (
          <TabPanel key={guild._id} px={0}>
            <Box
              borderWidth={1}
              borderRadius="lg"
              boxShadow={boxShadow}
              minW="260px"
              bg={bgColor}
            >
              <VStack align="stretch" spacing={2}>
                {membersByGuild[guild._id]?.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" p={4}>
                    Aucun membre
                    <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                      ({membersByGuild[guild._id]?.length || 0}/20)
                    </Text>
                  </Text>
                ) : (
                  <>
                    <Text as="span" fontSize="sm" color="gray.500" mb={2} p={4}>
                      {membersByGuild[guild._id]?.length} membre{membersByGuild[guild._id]?.length > 1 ? 's' : ''} / 20
                    </Text>
                    {[...membersByGuild[guild._id] || []]
                      .sort((a, b) => {
                        const roleOrder: Record<Role, number> = { chef: 0, "sous-chef": 1, membre: 2 };
                        if (roleOrder[a.role] !== roleOrder[b.role]) {
                          return roleOrder[a.role] - roleOrder[b.role];
                        }
                        return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
                      })
                      .map((member: Member, idx: number) => (
                        <HStack
                          key={member._id}
                          spacing={2}
                          bg={idx % 2 === 0 ? useColorModeValue('gray.50', 'gray.700') : 'transparent'}
                          // borderRadius="md"
                          px={1}
                          py={2}
                        >
                          <Text flex={1}>
                            {member.name}
                            <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                              [
                              {member.role === "chef"
                                ? "Chef"
                                : member.role === "sous-chef"
                                  ? "Sous-Chef"
                                  : "Membre"}
                              ]
                            </Text>
                          </Text>
                          {editable && onRoleChange && (
                            <Select
                              size="sm"
                              value={member.role}
                              width="auto"
                              onChange={e => onRoleChange(guild._id, member, e.target.value as Role)}
                            >
                              <option value="membre">Membre</option>
                              <option value="sous-chef">Sous-Chef</option>
                              <option value="chef">Chef</option>
                            </Select>
                          )}
                          {editable && onRemoveMember && (
                            <IconButton
                              aria-label="Supprimer"
                              icon={<span>🗑️</span>}
                              size="sm"
                              colorScheme="red"
                              onClick={() => onRemoveMember(guild._id, member._id)}
                            />
                          )}
                          {editable && onMoveMember && allGuildsForMove && (
                            <Select
                              size="sm"
                              value={guild._id}
                              onChange={e => onMoveMember(guild._id, member, e.target.value)}
                              width="auto"
                            >
                              <option value={guild._id}>Rester</option>
                              {allGuildsForMove
                                .filter((g: Guild) => g._id !== guild._id && (membersByGuild[g._id]?.length ?? 0) < 20)
                                .map((g2: Guild) => (
                                  <option key={g2._id} value={g2._id}>
                                    {g2.name}
                                  </option>
                                ))}
                            </Select>
                          )}
                        </HStack>
                      ))}
                  </>
                )}
              </VStack>
            </Box>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
