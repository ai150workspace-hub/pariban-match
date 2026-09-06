const KEY = "pariban_oauth_prefill";

export interface OAuthPrefill {
  email: string;
  nama?: string;
}

/**
 * Data diri dari akun OAuth (Google/Facebook) dititipkan lewat
 * sessionStorage antar halaman /oauth/callback -> /persetujuan -> /daftar,
 * BUKAN lewat query string URL — supaya email/nama pengguna tidak
 * tercetak di address bar atau riwayat browser.
 */
export function saveOauthPrefill(data: OAuthPrefill): void {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function readOauthPrefill(): OAuthPrefill | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOauthPrefill(): void {
  sessionStorage.removeItem(KEY);
}
