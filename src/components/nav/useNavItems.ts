import { useCurrentEvent } from "@/hooks/useAPI";
import { NAV_ITEMS } from "./navConfig";

// The results stay reachable from the menu for a month after the event
const RESULTS_DAYS = 30;

// Menu links, with the anniversary one while there is an event to show
export const useNavItems = () => {
  const { data } = useCurrentEvent();
  const showEvent = Boolean(data && (data.state !== "over"
    || Date.now() - new Date(data.event.end_at).getTime() < RESULTS_DAYS * 24 * 60 * 60 * 1000));
  return NAV_ITEMS.filter((item) => !item.eventOnly || showEvent);
};
