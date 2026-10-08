import {
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Box, Button, Checkbox, CheckboxGroup, Flex, Input, SimpleGrid, Text,
    VStack, useColorModeValue, useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { IGuild, NotificationType } from "@/interfaces";
import { useGuilds, useNotificationSettings } from "@/hooks/useAPI";
import { useAPIMutations, useSettingsMutations } from "@/hooks/useAPIMutations";
import { useAuth } from "@/providers/AuthProvider";
import { NOTIFICATION_TYPES, NOTIFICATION_TYPE_LABELS } from "@/utils/notificationTypes";

const GuildNotificationRow: React.FC<{ guild: IGuild }> = ({ guild }) => {
    const { updateGuild, testGuildNotification } = useAPIMutations();
    const toast = useToast();
    const [channelId, setChannelId] = useState(guild.discord_channel_id || "");
    const [generalChannelId, setGeneralChannelId] = useState(guild.discord_general_channel_id || "");
    const [disabledTypes, setDisabledTypes] = useState<NotificationType[]>(guild.disabled_notification_types || []);
    const [isSaving, setIsSaving] = useState(false);
    const [testingChannel, setTestingChannel] = useState<"chef" | "general" | null>(null);

    const handleTest = async (which: "chef" | "general") => {
        const value = which === "chef" ? channelId : generalChannelId;
        if (!value.trim()) {
            toast({ title: "Renseigne un ID de channel avant de tester", status: "warning" });
            return;
        }
        setTestingChannel(which);
        try {
            await testGuildNotification(guild._id, value.trim());
            toast({ title: "Notification de test envoyée", status: "success" });
        } catch (error) {
            toast({ title: error instanceof Error ? error.message : "Échec de l'envoi", status: "error" });
        } finally {
            setTestingChannel(null);
        }
    };

    useEffect(() => {
        setChannelId(guild.discord_channel_id || "");
        setGeneralChannelId(guild.discord_general_channel_id || "");
        setDisabledTypes(guild.disabled_notification_types || []);
    }, [guild.discord_channel_id, guild.discord_general_channel_id, guild.disabled_notification_types]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateGuild(guild._id, {
                name: guild.name,
                discord_channel_id: channelId.trim(),
                discord_general_channel_id: generalChannelId.trim(),
                disabled_notification_types: disabledTypes,
            });
            toast({ title: `Settings de notification mis à jour pour ${guild.name}`, status: "success" });
        } catch (error) {
            toast({ title: error instanceof Error ? error.message : "Erreur lors de la mise à jour", status: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AccordionItem>
            <AccordionButton>
                <Text flex="1" textAlign="left" fontWeight="medium">{guild.name}</Text>
                <Text fontSize="sm" color="gray.500" mr={3}>
                    {channelId || "Aucun channel chef configuré"}
                </Text>
                <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={4}>
                    <Box>
                        <Text fontSize="sm" mb={1}>ID du channel Discord — chef (accès restreint)</Text>
                        <Flex gap={2}>
                            <Input
                                placeholder="ID du channel Discord chef"
                                value={channelId}
                                onChange={(e) => setChannelId(e.target.value)}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTest("chef")}
                                isLoading={testingChannel === "chef"}
                                isDisabled={testingChannel !== null}
                                flexShrink={0}
                            >
                                Tester
                            </Button>
                        </Flex>
                    </Box>
                    <Box>
                        <Text fontSize="sm" mb={1}>ID du channel Discord — général (tous les membres)</Text>
                        <Flex gap={2}>
                            <Input
                                placeholder="ID du channel Discord général"
                                value={generalChannelId}
                                onChange={(e) => setGeneralChannelId(e.target.value)}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTest("general")}
                                isLoading={testingChannel === "general"}
                                isDisabled={testingChannel !== null}
                                flexShrink={0}
                            >
                                Tester
                            </Button>
                        </Flex>
                    </Box>
                    <Box>
                        <Text fontSize="sm" mb={2}>Notifications désactivées pour cette guilde</Text>
                        <CheckboxGroup
                            value={disabledTypes}
                            onChange={(values) => setDisabledTypes(values as NotificationType[])}
                        >
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                {NOTIFICATION_TYPES.map((type) => (
                                    <Checkbox key={type} value={type}>{NOTIFICATION_TYPE_LABELS[type]}</Checkbox>
                                ))}
                            </SimpleGrid>
                        </CheckboxGroup>
                    </Box>
                    <Flex justify="flex-end">
                        <Button colorScheme="blue" size="sm" onClick={handleSave} isLoading={isSaving}>
                            Enregistrer
                        </Button>
                    </Flex>
                </VStack>
            </AccordionPanel>
        </AccordionItem>
    );
};

const GlobalNotificationSettings: React.FC = () => {
    const { disabledTypes: savedDisabledTypes, mutate } = useNotificationSettings();
    const { updateGlobalNotificationSettings } = useSettingsMutations();
    const toast = useToast();
    const [disabledTypes, setDisabledTypes] = useState<NotificationType[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDisabledTypes(savedDisabledTypes);
    }, [savedDisabledTypes]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateGlobalNotificationSettings(disabledTypes);
            await mutate();
            toast({ title: "Settings de notification globaux mis à jour", status: "success" });
        } catch (error) {
            toast({ title: error instanceof Error ? error.message : "Erreur lors de la mise à jour", status: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={4}>
            <Text fontWeight="medium" mb={1}>Global (hors guilde)</Text>
            <Text fontSize="sm" color="gray.500" mb={3}>
                S'applique aux notifications sans channel de guilde dédié (bannissements, et toute
                guilde sans channel Discord configuré).
            </Text>
            <CheckboxGroup value={disabledTypes} onChange={(values) => setDisabledTypes(values as NotificationType[])}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    {NOTIFICATION_TYPES.map((type) => (
                        <Checkbox key={type} value={type}>{NOTIFICATION_TYPE_LABELS[type]}</Checkbox>
                    ))}
                </SimpleGrid>
            </CheckboxGroup>
            <Flex justify="flex-end" mt={4}>
                <Button colorScheme="blue" size="sm" onClick={handleSave} isLoading={isSaving}>
                    Enregistrer
                </Button>
            </Flex>
        </Box>
    );
};

const NotificationSettingsSection: React.FC = () => {
    const { isAdmin: isFullAdmin, managedGuildIds } = useAuth();
    const { guilds: allGuilds } = useGuilds(true, true);
    const guilds = isFullAdmin ? allGuilds : allGuilds.filter(g => managedGuildIds.includes(g._id));
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <VStack spacing={6} align="stretch" w="100%">
            {isFullAdmin && <GlobalNotificationSettings />}

            <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                <Accordion allowToggle>
                    {guilds.map((guild) => (
                        <GuildNotificationRow key={guild._id} guild={guild} />
                    ))}
                </Accordion>
            </Box>
        </VStack>
    );
};

export default NotificationSettingsSection;
