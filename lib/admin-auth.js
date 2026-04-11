export function isAuthorizedRequest(request) {
  const adminKey = process.env.BOOKINGS_ADMIN_KEY;

  if (!adminKey) {
    return false;
  }

  const { searchParams } = new URL(request.url);
  const keyFromQuery = searchParams.get("key");
  const keyFromHeader = request.headers.get("x-admin-key");

  return keyFromQuery === adminKey || keyFromHeader === adminKey;
}
