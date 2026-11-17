import { UserDisplay } from "@/components/ui/UserDisplay";
import type { IRankPlayer, IUser } from "@/interfaces";

// Player of a ranking row: Discord avatar and the bbs account the activity was played under
export const PlayerCell = ({ player, name, direction = "row", avatarSize = "xs" }: {
  player?: IRankPlayer; name: string; direction?: "row" | "column"; avatarSize?: "xs" | "sm" | "md";
}) => (
  <UserDisplay
    user={{
      _id: player?._id ?? "",
      discord_id: player?.discord_id ?? undefined,
      avatar: player?.avatar ?? undefined,
      global_name: player?.global_name ?? name,
      bbs_name: player?.bbs_name ?? name,
      bbs_id: player?.bbs_id ?? undefined,
    } as IUser}
    avatarSize={avatarSize}
    textSize="sm"
    spacing={2}
    direction={direction}
  />
);
