import CycleDetailPage from "@/views/CycleDetailPage";
export function generateStaticParams() { return [{ id: "_" }]; }
export default function Page() { return <CycleDetailPage />; }
