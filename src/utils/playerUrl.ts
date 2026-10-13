// bbs_name is not guaranteed unique (two accounts, alts of one player or not, may share a name). It
// is the default readable path, and bbsId, when known, is added as a query parameter to target the
// exact account (see useUserByBBSName on the player page).
export const buildPlayerUrl = (bbsName?: string | null, bbsId?: string | null): string | undefined => {
  if (!bbsName) return undefined;
  const base = `/joueur/${encodeURIComponent(bbsName)}`;
  return bbsId ? `${base}?compte=${encodeURIComponent(bbsId)}` : base;
};
