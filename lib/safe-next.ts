/**
 * Tujuan "kembali setelah login" yang diizinkan. Whitelist ketat (hanya
 * /chat/<uuid>) supaya parameter `next` tidak bisa dipakai sebagai open
 * redirect ke situs lain.
 */
const NEXT_CHAT = /^\/chat\/[0-9a-fA-F-]{36}$/;

export function safeNext(value: string | null | undefined): string | null {
  return value && NEXT_CHAT.test(value) ? value : null;
}
