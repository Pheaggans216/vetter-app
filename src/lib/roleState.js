export const SUPPORTED_APP_ROLES = ["buyer", "seller", "vetter"];

export function getAppRoles(user) {
  const rawRoles = Array.isArray(user?.app_roles) && user.app_roles.length
    ? user.app_roles
    : user?.app_role
    ? [user.app_role]
    : [];

  return [...new Set(rawRoles.filter((role) => SUPPORTED_APP_ROLES.includes(role)))];
}

export function hasAnyAppRole(user) {
  return getAppRoles(user).length > 0;
}

export function hasAppRole(user, role) {
  return getAppRoles(user).includes(role);
}

export function getCurrentMode(user) {
  const roles = getAppRoles(user);
  const requestedMode = user?.active_mode;

  if (requestedMode && roles.includes(requestedMode)) {
    return requestedMode;
  }

  return roles[0] || "buyer";
}
