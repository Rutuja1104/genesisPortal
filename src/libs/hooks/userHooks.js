import General from "../utility/General";

export const isAccessAllowed = async (allowedRoles) => {
  const role = General.getUserRole();
  let isAllowRoles = allowedRoles.includes(role);
  return isAllowRoles;
};
