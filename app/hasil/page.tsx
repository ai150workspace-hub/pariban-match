import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import HasilClient from "./HasilClient";

export const dynamic = "force-dynamic";

export default async function HasilPage() {
  const cookieStore = await cookies();
  const kode = cookieStore.get("pariban_kode")?.value;
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
