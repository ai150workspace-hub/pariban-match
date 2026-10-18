import { redirect } from "next/navigation";
import { Suspense } from "react";
import HasilClient from "../HasilClient";
import { canActAs, getKodeSesi } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

// Rute ini dipertahankan untuk akses admin (/hasil/P001).
// Jika kode di URL sama dengan kode user yang sedang login, redirect ke /hasil.
export default async function HasilKodePage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const myKode = await getKodeSesi();
  if (myKode === kode) redirect("/hasil");
  // Selain pemilik kode ini, hanya admin yang boleh membuka halaman ini.
  if (!(await canActAs(kode))) redirect("/masuk");

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
