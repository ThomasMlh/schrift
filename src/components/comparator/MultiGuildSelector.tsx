import {
  VStack,
  HStack,
  Box,
  Text,
  IconButton,
  useColorModeValue,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomSelect } from "../ui/CustomSelect";
import type { IGuild } from "@/interfaces";

const DEFAULT_COLORS = ["#3182CE", "#38A169", "#DD6B20", "#9F7AEA", "#E53E3E"];

interface SelectedGuild {
  id: string;
  guild: IGuild;
}

interface MultiGuildSelectorProps {
  selectedGuilds: SelectedGuild[];
  onAddGuild: (guildId: string, guild: IGuild) => void;
  onRemoveGuild: (id: string) => void;
  maxGuilds?: number;
  availableGuilds: IGuild[];
  entityColors?: string[];
}

export const MultiGuildSelector = ({
  selectedGuilds,
  onAddGuild,
  onRemoveGuild,
  maxGuilds = 5,
  availableGuilds,
  entityColors = DEFAULT_COLORS,
}: MultiGuildSelectorProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = "text.muted";
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const { t } = useTranslation();

  const handleGuildSelect = (guildId: string) => {
    const guild = availableGuilds.find((g) => g._id === guildId);
    if (guild && selectedGuilds.length < maxGuilds) {
      onAddGuild(guildId, guild);
      setSelectedGuildId("");
    }
  };

  const availableGuildsFiltered = availableGuilds.filter(
    (guild) => !selectedGuilds.some((g) => g.id === guild._id)
  );

  const guildOptions = availableGuildsFiltered.map((guild) => ({
    value: guild._id,
    label: guild.name,
  }));

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText}>
            {t("components.multiGuildSelector.heading")}
          </Text>
          <Badge
            colorScheme={selectedGuilds.length >= maxGuilds ? "red" : "purple"}
            variant="subtle"
            fontSize="xs"
            borderRadius="full"
          >
            {selectedGuilds.length}/{maxGuilds}
          </Badge>
        </HStack>

        {/* Selected guilds */}
        <VStack spacing={2} align="stretch">
          {selectedGuilds.map((selected, index) => {
            const color = entityColors[index % entityColors.length];
            return (
              <Box
                key={selected.id}
                px={3}
                py={2}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                borderLeftWidth="3px"
                borderLeftColor={color}
                bg={isDark ? "rgba(255,255,255,0.03)" : "gray.50"}
                transition="all 0.15s ease"
                _hover={{ transform: "translateX(3px)", borderColor }}
              >
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box w={2} h={2} borderRadius="full" bg={color} flexShrink={0} />
                    <Text fontWeight="medium" fontSize="sm">{selected.guild.name}</Text>
                  </HStack>
                  <IconButton
                    icon={<CloseIcon boxSize={2.5} />}
                    aria-label={t("components.multiGuildSelector.ariaRemove")}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onRemoveGuild(selected.id)}
                  />
                </HStack>
              </Box>
            );
          })}

          {selectedGuilds.length === 0 && (
            <Box
              p={5}
              textAlign="center"
              borderRadius="lg"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={borderColor}
            >
              <Text color={mutedText} fontSize="sm">
                {t("components.multiGuildSelector.empty")}
              </Text>
              <Text color={mutedText} fontSize="xs" mt={1} opacity={0.7}>
                {t("components.multiGuildSelector.emptyHint", { max: maxGuilds })}
              </Text>
            </Box>
          )}
        </VStack>

        {/* Add guild */}
        {selectedGuilds.length < maxGuilds && (
          <Box>
            <Text fontSize="xs" fontWeight="medium" mb={2} color={mutedText}>
              {t("components.multiGuildSelector.addLabel")}
            </Text>
            <CustomSelect
              options={guildOptions}
              value={selectedGuildId}
              onChange={handleGuildSelect}
              placeholder={t("components.multiGuildSelector.placeholder")}
            />
          </Box>
        )}

        {selectedGuilds.length >= maxGuilds && (
          <Text fontSize="xs" color="orange.400" textAlign="center">
            {t("components.multiGuildSelector.limitReached", { max: maxGuilds })}
          </Text>
        )}
      </VStack>
    </Box>
  );
};
