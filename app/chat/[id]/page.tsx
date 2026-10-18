import { redirect } from "next/navigation";
import { getKodeSesi } from "@/lib/request-auth";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

// Identitas dari sesi bertanda tangan (bukan ?kode= di URL), seperti /hasil.
// Belum login / sesi tidak valid → /masuk, lalu kembali ke chat ini.
export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kode = await getKodeSesi();
  if (!kode) redirect(`/masuk?next=${encodeURIComponent(`/chat/${id}`)}`);

  return <ChatClient id={id} kode={kode} />;
}
