import type { RoleId } from '../types/models';

export const isOwner = (role: RoleId) => role === 'r01' || role === 'r02';
export const isReceptionist = (role: RoleId) => role === 'r03';
export const isStaff = (role: RoleId) => role === 'r04';
export const canSeeFinancials = (role: RoleId) => isOwner(role);
export const canManageTables = (role: RoleId) => isOwner(role) || isReceptionist(role);
export const canBookForOthers = (role: RoleId) => isOwner(role) || isReceptionist(role);
export const canManageRoles = (role: RoleId) => isOwner(role);
export const canEditBusiness = (role: RoleId) => isOwner(role);
export const canViewBusiness = (role: RoleId) => isOwner(role) || isReceptionist(role);
export const canManageStaff = (role: RoleId) => isOwner(role);
