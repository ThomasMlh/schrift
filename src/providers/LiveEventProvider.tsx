import { createContext, useContext, useMemo } from "react";
import { useLiveEvent } from "@/hooks/useAPI";
import type { ILiveEvent } from "@/interfaces";

interface LiveEventContextValue {
  live: ILiveEvent | null;
  framed: Set<string>;
}

const LiveEventContext = createContext<LiveEventContextValue>({ live: null, framed: new Set() });

// Running event shared by the whole site: festive decor, avatar frames, gift hunt
export const LiveEventProvider = ({ children }: { children: React.ReactNode }) => {
  const live = useLiveEvent();
  const value = useMemo(() => ({ live, framed: new Set(live?.frame_user_ids ?? []) }), [live]);
  return <LiveEventContext.Provider value={value}>{children}</LiveEventContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLive = () => useContext(LiveEventContext);

/** Year of the event frame worn by an account, or null. */
// eslint-disable-next-line react-refresh/only-export-components
export const useAvatarFrame = (userId?: string | null) => {
  const { live, framed } = useLive();
  return live && userId && framed.has(userId) ? live.year : null;
};
