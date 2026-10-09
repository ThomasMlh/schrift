import {
  HStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { SelectionSlots } from "./SelectionSlots";
import { GuildLogo } from "../guild/GuildLogo";
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
    <SelectionSlots
      title={t("components.multiGuildSelector.heading")}
      max={maxGuilds}
      onRemove={onRemoveGuild}
      removeLabel={t("components.multiGuildSelector.ariaRemove")}
      addLabel={t("components.multiGuildSelector.addLabel")}
      addFieldId="comparator-add-guild"
      items={selectedGuilds.map((selected, index) => ({
        id: selected.id,
        color: entityColors[index % entityColors.length],
        content: (
          <HStack spacing={2}>
            <GuildLogo guild={selected.guild} size="22px" />
            <Text fontWeight="semibold" fontSize="sm">Schrift {selected.guild.name}</Text>
          </HStack>
        ),
      }))}
    >
      <CustomSelect
        options={guildOptions}
        value={selectedGuildId}
        onChange={handleGuildSelect}
        placeholder={t("components.multiGuildSelector.placeholder")}
      />
    </SelectionSlots>
  );
};
