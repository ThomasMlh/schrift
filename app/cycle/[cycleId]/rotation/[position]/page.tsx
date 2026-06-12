import RotationDetailPage from "@/views/RotationDetailPage";
export function generateStaticParams() { return [{ cycleId: "_", position: "_" }]; }
export default function Page() { return <RotationDetailPage />; }
