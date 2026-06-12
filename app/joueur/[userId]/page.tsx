import { Suspense } from "react";
import UserPage from "@/views/UserPage";
export function generateStaticParams() { return [{ userId: "_" }]; }
export default function Page() { return <Suspense><UserPage /></Suspense>; }
