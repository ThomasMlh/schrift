import { useMemo, useState } from "react";
import { Badge, Select, Tooltip, useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { Acquisition, ICharacter } from "@/interfaces";
import { apiUrl, makeRequest } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";
import { useAuth } from "@/providers/AuthProvider";

const ACQUISITIONS: Acquisition[] = ["premium", "seasonal", "seasonal_medal", "exclusive", "senkaimon", "brave_battle", "kan_shop", "frenzy", "exchange", "mixer", "misc"];

const SCHEMES: Record<Acquisition, string> = {
  premium: "purple",
  seasonal: "orange",
  seasonal_medal: "orange",
  exclusive: "red",
  senkaimon: "teal",
  brave_battle: "blue",
  kan_shop: "yellow",
  frenzy: "pink",
  exchange: "cyan",
  mixer: "gray",
  misc: "gray",
};

const shown = (character: ICharacter) => character.acquisition_override ?? character.acquisition ?? null;

// How the character is obtained: the admin's choice, else the one computed from the game; the old
// hand-entered value until the first sync
export const AcquisitionBadge = ({ character }: { character: ICharacter }) => {
  const { t, i18n } = useTranslation();
  const acquisition = shown(character);
  if (!acquisition) {
    return character.rarity ? <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2.5}>{character.rarity}</Badge> : null;
  }
  const exchange = acquisition === "exchange" ? gameText(character.acquisition_exchange, i18n.language) : "";
  return (
    <Tooltip label={t(`acquisition.help.${acquisition}`)} hasArrow>
      <Badge colorScheme={SCHEMES[acquisition]} variant="solid" borderRadius="full" px={2.5} textTransform="none">
        {exchange ? t("acquisition.exchangeNamed", { name: exchange }) : t(`acquisition.${acquisition}`)}
      </Badge>
    </Tooltip>
  );
};

// Admin only: forces the category of the character, or goes back to the computed one
export const AcquisitionSelect = ({ character, onChange }: { character: ICharacter; onChange: (next: Partial<ICharacter>) => void }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const toast = useToast();
  const request = useMemo(() => makeRequest(token), [token]);
  const [saving, setSaving] = useState(false);

  const save = async (value: string) => {
    setSaving(true);
    try {
      const { data } = await request<{ data: Partial<ICharacter> }>(`${apiUrl}/api/characters/${character._id}/acquisition`, {
        method: "PUT",
        body: JSON.stringify({ acquisition: value || null }),
      });
      onChange(data);
    } catch (error) {
      toast({ title: (error as Error).message, status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const computed = character.acquisition ? t(`acquisition.${character.acquisition}`) : t("acquisition.unknown");
  return (
    <Select
      size="sm"
      w="auto"
      borderRadius="md"
      value={character.acquisition_override ?? ""}
      isDisabled={saving}
      aria-label={t("acquisition.pick")}
      onChange={(e) => save(e.target.value)}
    >
      <option value="">{t("acquisition.auto", { value: computed })}</option>
      {ACQUISITIONS.map((value) => <option key={value} value={value}>{t(`acquisition.${value}`)}</option>)}
    </Select>
  );
};
