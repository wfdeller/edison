/**
 * Role definitions and helper functions
 */

// Available roles in the system
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor'
};

// Array of all available roles
const ALL_ROLES = Object.values(ROLES);

// Role hierarchy (roles that include permissions of lower roles)
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.EDITOR, ROLES.USER],
  [ROLES.MODERATOR]: [ROLES.MODERATOR, ROLES.EDITOR, ROLES.USER],
  [ROLES.EDITOR]: [ROLES.EDITOR, ROLES.USER],
  [ROLES.USER]: [ROLES.USER]
};

// Helper function to check if a role exists
const isValidRole = (role) => ALL_ROLES.includes(role);

// Helper function to check if an array of roles are all valid
const areValidRoles = (roles) => roles.every(role => isValidRole(role));

// Helper function to get all roles that a given role has access to
const getRolePermissions = (role) => {
  return ROLE_HIERARCHY[role] || [ROLES.USER];
};

// Helper function to check if a role has permission for another role
const hasRolePermission = (userRole, targetRole) => {
  return getRolePermissions(userRole).includes(targetRole);
};

module.exports = {
  ROLES,
  ALL_ROLES,
  ROLE_HIERARCHY,
  isValidRole,
  areValidRoles,
  getRolePermissions,
  hasRolePermission
}; 