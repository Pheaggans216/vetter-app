// Sample/seed Vetter profiles (e.g. @example.com emails) are kept in the database
// for dev/reference but must never be shown to public users.
export function isSampleVetter(vetter) {
  if (!vetter) return false;
  const email = (vetter.user_email || "").toLowerCase().trim();
  if (!email) return true; // profiles without a real user email are not public Vetters
  return (
    email.endsWith("@example.com") ||
    email.endsWith("@example.org") ||
    email.endsWith("@example.net") ||
    email.endsWith("@test.com") ||
    email.endsWith("@fake.com")
  );
}

export function hideSampleVetters(list = []) {
  return (list || []).filter((v) => !isSampleVetter(v));
}