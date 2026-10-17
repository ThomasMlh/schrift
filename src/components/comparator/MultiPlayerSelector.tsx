import {
} from "@chakra-ui/react";
import { useState } from "react";
import { SelectionSlots } from "./SelectionSlots";
import { useTranslation } from "react-i18next";
import { UserSearchSelect } from "../ui/UserSearchSelect";
import { UserDisplay } from "../ui/UserDisplay";
import type { IUser, IGuild } from "@/interfaces";

const DEFAULT_COLORS = ["#3182CE", "#38A169", "#DD6B20", "#9F7AEA", "#E53E3E"];

interface SelectedPlayer {
  id: string;
  user: IUser;
}

interface MultiPlayerSelectorProps {
  selectedPlayers: SelectedPlayer[];
  onAddPlayer: (userId: string, user: IUser) => void;
  onRemovePlayer: (id: string) => void;
  maxPlayers?: number;
  availableUsers: IUser[];
  entityColors?: string[];
  onSearchChange?: (query: string) => void;
  guilds?: IGuild[];
}

export const MultiPlayerSelector = ({
  selectedPlayers,
  onAddPlayer,
  onRemovePlayer,
  maxPlayers = 5,
  availableUsers,
  entityColors = DEFAULT_COLORS,
  onSearchChange,
  guilds = [],
}: MultiPlayerSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    onSearchChange?.(q);
  };
  const [selectedUserId, setSelectedUserId] = useState("");
  const { t } = useTranslation();

  // availableUsers lists bbs accounts, not users: a player with several accounts appears once per
  // account, and the bbs_id is the selection key (accounts of the same player share the user _id).
  const handleUserSelect = (bbsId: string) => {
    const user = availableUsers.find((u) => u.bbs_id === bbsId);
    if (user && selectedPlayers.length < maxPlayers) {
      onAddPlayer(bbsId, user);
      setSelectedUserId("");
      setSearchQuery("");
    }
  };

  const availableUsersFiltered = availableUsers.filter(
    (user) => !selectedPlayers.some((p) => p.id === user.bbs_id)
  );

  return (
    <SelectionSlots
      title={t("components.multiPlayerSelector.heading")}
      max={maxPlayers}
      onRemove={onRemovePlayer}
      removeLabel={t("components.multiPlayerSelector.ariaRemove")}
      addLabel={t("components.multiPlayerSelector.addLabel")}
      addFieldId="comparator-add-player"
      items={selectedPlayers.map((player, index) => ({
        id: player.id,
        color: entityColors[index % entityColors.length],
        content: <UserDisplay user={player.user} avatarSize="xs" textSize="sm" />,
      }))}
    >
      <UserSearchSelect
        users={availableUsersFiltered}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        placeholder={t("components.multiPlayerSelector.searchPlaceholder")}
        guilds={guilds}
        getItemId={(u) => u.bbs_id || u._id || ''}
      />
    </SelectionSlots>
  );
};
