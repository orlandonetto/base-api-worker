import { PermissionLogicOperator } from '../types/global.enums'

const containsPermission = (
  permissions: string[],
  personPermissions: string[],
  op: PermissionLogicOperator = PermissionLogicOperator.And,
) => {
  const hasPermissions = permissions.map(p => personPermissions.includes(p))

  if (op === PermissionLogicOperator.Or && hasPermissions.every(Boolean)) {
    return true
  }

  if (op === PermissionLogicOperator.And && hasPermissions.some(Boolean)) {
    return true
  }

  return false
}

export { containsPermission }
