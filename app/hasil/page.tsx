import { getKodeSesi } from "@/lib/request-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import HasilClient from "./HasilClient";

export const dynamic = "force-dynamic";

export default async function HasilPage() {
  // Sesi tidak ada / tidak valid / format lama -> ke /masuk (bukan error).
  const kode = await getKodeSesi();
  if (!kode) redirect("/masuk");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <HasilClient kode={kode} />
    </Suspense>
  );
}
