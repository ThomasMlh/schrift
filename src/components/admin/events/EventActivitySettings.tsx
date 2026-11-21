import {
  Box, Button, FormControl, FormLabel, Grid, HStack, IconButton, Input, NumberInput, NumberInputField, Select, Switch, Text, VStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import type { GoalSource, IGoalSettings, IHuntSettings, TierReward } from "@/interfaces";

const SOURCE_LABELS: Record<GoalSource, string> = {
  score: "Score saisi",
  advent: "Case du calendrier trouvée",
  quiz: "Quiz terminé",
  gift: "Cadeau trouvé",
};
const REWARD_LABELS: Record<TierReward, string> = {
  decor: "Décor festif du site",
  frame: "Cadre d'avatar des participants",
  custom: "Récompense libre",
};

const Box3 = ({ children }: { children: React.ReactNode }) => (
  <Box w="100%" borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p={3}>{children}</Box>
);

const NumberField = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) => (
  <FormControl>
    <FormLabel fontSize="sm">{label}</FormLabel>
    <NumberInput size="sm" min={min} max={max} value={value} onChange={(_, v) => onChange(Number.isFinite(v) ? v : min)}>
      <NumberInputField />
    </NumberInput>
  </FormControl>
);

export const HuntSettings = ({ value, onChange }: { value: IHuntSettings; onChange: (v: IHuntSettings) => void }) => (
  <Box3>
    <FormControl display="flex" alignItems="center" gap={3}>
      <Switch id="hunt-enabled" isChecked={value.enabled} onChange={(e) => onChange({ ...value, enabled: e.target.checked })} />
      <FormLabel htmlFor="hunt-enabled" mb={0}>Chasse aux cadeaux</FormLabel>
    </FormControl>
    {value.enabled && (
      <Grid templateColumns="1fr 1fr" gap={3} mt={3}>
        <NumberField label="Points par cadeau" value={value.points} min={0} max={100} onChange={(points) => onChange({ ...value, points })} />
        <NumberField label="Tickets de tombola par cadeau" value={value.tickets} min={0} max={5} onChange={(tickets) => onChange({ ...value, tickets })} />
        <FormControl>
          <FormLabel fontSize="sm">Badge des chasseurs</FormLabel>
          <Input size="sm" value={value.badge_name ?? ""} placeholder="Chasseur de cadeaux 2026" maxLength={60} onChange={(e) => onChange({ ...value, badge_name: e.target.value || null })} />
        </FormControl>
        <NumberField label="Cadeaux pour le badge" value={value.badge_min} min={1} max={31} onChange={(badgeMin) => onChange({ ...value, badge_min: badgeMin })} />
        <Text gridColumn="1 / -1" fontSize="sm" color="text.muted">
          Chaque jour, un cadeau est caché sur une page du site, avec un indice sur la page de l'événement. Les points s'ajoutent au classement du calendrier, et les tickets à la tombola du mois où le cadeau est trouvé. Badge vide : pas de badge.
        </Text>
      </Grid>
    )}
  </Box3>
);

export const GoalSettings = ({ value, onChange }: { value: IGoalSettings; onChange: (v: IGoalSettings) => void }) => {
  const setTier = (index: number, changes: Partial<IGoalSettings["tiers"][number]>) =>
    onChange({ ...value, tiers: value.tiers.map((tier, i) => (i === index ? { ...tier, ...changes } : tier)) });
  const addTier = () => {
    const last = value.tiers.at(-1)?.threshold ?? 0;
    onChange({ ...value, tiers: [...value.tiers, { threshold: last + 500, reward: "custom", label: "" }] });
  };
  return (
    <Box3>
      <FormControl display="flex" alignItems="center" gap={3}>
        <Switch id="goal-enabled" isChecked={value.enabled} onChange={(e) => onChange({ ...value, enabled: e.target.checked })} />
        <FormLabel htmlFor="goal-enabled" mb={0}>Objectif collectif</FormLabel>
      </FormControl>
      {value.enabled && (
        <VStack align="stretch" spacing={4} mt={3}>
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Points de jauge par contribution</Text>
            <Grid templateColumns="1fr 1fr" gap={3}>
              {(Object.keys(SOURCE_LABELS) as GoalSource[]).map((source) => (
                <NumberField
                  key={source}
                  label={SOURCE_LABELS[source]}
                  value={value.weights[source]}
                  min={0}
                  max={1000}
                  onChange={(weight) => onChange({ ...value, weights: { ...value.weights, [source]: weight } })}
                />
              ))}
            </Grid>
            <Text fontSize="xs" color="text.muted" mt={2}>Seuls les scores saisis entre les dates de l'événement comptent. 0 : la contribution ne compte pas.</Text>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Paliers</Text>
            <VStack align="stretch" spacing={2}>
              {value.tiers.map((tier, index) => (
                <HStack key={index} spacing={2} align="flex-start">
                  <NumberInput size="sm" min={1} value={tier.threshold} w="110px" flexShrink={0} onChange={(_, v) => setTier(index, { threshold: Number.isFinite(v) ? v : 1 })}>
                    <NumberInputField aria-label="Seuil" />
                  </NumberInput>
                  <Select size="sm" value={tier.reward} w="220px" flexShrink={0} onChange={(e) => setTier(index, { reward: e.target.value as TierReward })}>
                    {(Object.keys(REWARD_LABELS) as TierReward[]).map((reward) => <option key={reward} value={reward}>{REWARD_LABELS[reward]}</option>)}
                  </Select>
                  <Input
                    size="sm"
                    value={tier.label}
                    maxLength={120}
                    placeholder={tier.reward === "custom" ? "1 compte offert en tombola" : "Texte facultatif"}
                    onChange={(e) => setTier(index, { label: e.target.value })}
                  />
                  <IconButton size="sm" variant="ghost" colorScheme="red" aria-label="Retirer le palier" icon={<DeleteIcon />} onClick={() => onChange({ ...value, tiers: value.tiers.filter((_, i) => i !== index) })} />
                </HStack>
              ))}
              <Button size="sm" variant="outline" leftIcon={<AddIcon boxSize={2.5} />} onClick={addTier} alignSelf="flex-start" isDisabled={value.tiers.length >= 10}>Ajouter un palier</Button>
            </VStack>
            <Text fontSize="xs" color="text.muted" mt={2}>
              Le décor (neige et guirlande) et le cadre d'avatar s'activent seuls quand le palier est atteint, jusqu'à la fin de l'événement. Le cadre va aux joueurs qui ont le badge des participants. Une récompense libre est seulement affichée : c'est à vous de la donner.
            </Text>
          </Box>
        </VStack>
      )}
    </Box3>
  );
};
