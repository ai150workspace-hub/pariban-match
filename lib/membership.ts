import type { Peserta } from "./adat/types";

export type MembershipStatus = "trial" | "premium" | "free";

type MembershipFields = Pick<Peserta, "trialEndsAt" | "premium" | "premiumExpiry">;

/** Returns the current membership status for a peserta. */
export function getMembershipStatus(p: MembershipFields): MembershipStatus {
  const now = new Date();
  // Paid premium takes priority over trial
  if (p.premium && (!p.premiumExpiry || new Date(p.premiumExpiry) > now)) {
    return "premium";
  }
  if (p.trialEndsAt && new Date(p.trialEndsAt) > now) {
    return "trial";
  }
  return "free";
}

/** True when user has full access (trial OR paid premium). */
export function hasActiveAccess(p: MembershipFields): boolean {
  return getMembershipStatus(p) !== "free";
}

/** Days remaining in trial (0 if trial not active or already expired). */
export function getTrialDaysLeft(p: Pick<Peserta, "trialEndsAt">): number {
  if (!p.trialEndsAt) return 0;
  const diff = new Date(p.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** ISO string for 30 days (1 bulan) from now — use when creating a new peserta. */
export function newTrialExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}
