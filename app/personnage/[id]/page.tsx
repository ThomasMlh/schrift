import CharacterDetailPage from "@/views/CharacterDetailPage";
export function generateStaticParams() { return [{ id: "_" }]; }
export default function Page() { return <CharacterDetailPage />; }
