import type { Metadata } from "next";
import { Suspense } from "react";
import ResetForm from "./ResetForm";

// Tautan berisi token rahasia: jangan diindeks dan jangan bocor lewat header Referer.
export const metadata: Metadata = {
  title: "Atur Password Baru — PARIBAN",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
