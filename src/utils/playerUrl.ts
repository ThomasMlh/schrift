// bbs_name n'est pas garanti unique (deux comptes — alts d'un même joueur ou non — peuvent avoir
// le même pseudo) : c'est le chemin "joli" par défaut, mais bbsId, quand connu, est ajouté en
// query param pour cibler le compte exact sans ambiguïté (cf. useUserByBBSName côté page joueur).
export const buildPlayerUrl = (bbsName?: string | null, bbsId?: string | null): string | undefined => {
  if (!bbsName) return undefined;
  const base = `/joueur/${encodeURIComponent(bbsName)}`;
  return bbsId ? `${base}?compte=${encodeURIComponent(bbsId)}` : base;
};
