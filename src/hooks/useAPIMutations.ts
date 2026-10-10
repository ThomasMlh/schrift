/**
 * Facade de compatibilité — agrège tous les hooks de mutations par domaine.
 * Importer directement le hook de domaine si on n'a besoin que d'un sous-ensemble.
 */
export { useCycleMutations } from './mutations/useCycleMutations';
export { useGuildMutations } from './mutations/useGuildMutations';
export { useUserMutations } from './mutations/useUserMutations';
export { useScoreMutations } from './mutations/useScoreMutations';
export { useBuildMutations } from './mutations/useBuildMutations';
export { useOCRMutations } from './mutations/useOCRMutations';
export { useDraftMutations } from './mutations/useDraftMutations';
export { useAdminMutations } from './mutations/useAdminMutations';
export { useOrbGuideMutations } from './mutations/useOrbGuideMutations';
export { useAbilitySlotsGuideMutations } from './mutations/useAbilitySlotsGuideMutations';
export { useAccessoryMutations } from './mutations/useAccessoryMutations';
export { useSettingsMutations } from './mutations/useSettingsMutations';
export { usePodiumMutations } from './mutations/usePodiumMutations';
export { useDiscordMutations } from './mutations/useDiscordMutations';
export { useAlbumMutations } from './mutations/useAlbumMutations';

import { useCycleMutations } from './mutations/useCycleMutations';
import { useGuildMutations } from './mutations/useGuildMutations';
import { useUserMutations } from './mutations/useUserMutations';
import { useScoreMutations } from './mutations/useScoreMutations';
import { useBuildMutations } from './mutations/useBuildMutations';
import { useOCRMutations } from './mutations/useOCRMutations';
import { useDraftMutations } from './mutations/useDraftMutations';
import { usePodiumMutations } from './mutations/usePodiumMutations';

/** Hook combiné — maintient la compatibilité avec l'API existante. */
export const useAPIMutations = () => ({
  ...useCycleMutations(),
  ...useGuildMutations(),
  ...useUserMutations(),
  ...useScoreMutations(),
  ...useBuildMutations(),
  ...useOCRMutations(),
  ...useDraftMutations(),
  ...usePodiumMutations(),
});
