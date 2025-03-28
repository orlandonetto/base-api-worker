export const UnauthenticatedRoutes = [
  '/auth/local',
  '/auth/local/admin',
  '/auth/refresh',
  '/auth/local/sign-up',
]

export enum CollectionNames {
  Companies = 'companies',
  Tokens = 'tokens',
  People = 'people',
  PermissionGroups = 'permission-groups',
  AuditLogs = 'audit-logs',
}

export enum HttpStatus {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500,
}

export enum EmailTemplates {
  ExampleMail = 'example',
}

export enum Languages {
  Brazilian = 'pt-BR',
  English = 'en-US',
}

export enum PermissionLogicOperator {
  And = 'and',
  Or = 'or',
}

export enum Permissions {
  // People
  People = 'people',
  PeopleCreate = 'people.create',
  PeopleDelete = 'people.delete',
  PeopleEdit = 'people.edit',
  // PermissionGroups
  PermissionGroups = 'permission-groups',
  PermissionGroupsCreate = 'permission-groups.create',
  PermissionGroupsEdit = 'permission-groups.edit',
  PermissionGroupsDelete = 'permission-groups.delete',
}

export enum TopicNames {
  PeoplePost = 'people.post',
}
