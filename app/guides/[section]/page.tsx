import { Suspense } from "react";
import GuidesPage from "@/views/GuidesPage";
export function generateStaticParams() { return [{ section: "_" }]; }
export default function Page() { return <Suspense><GuidesPage /></Suspense>; }
