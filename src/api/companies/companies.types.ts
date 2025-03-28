import { ObjectId } from 'mongodb'

type TypeCompanySettings = {
  requiredMajority?: boolean
  defaultPermissionGroupID: ObjectId
}

type TypeCredentialsFile = {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
  universe_domain: string
}

type TypeCredentials = {
  gcp: {
    file?: TypeCredentialsFile
    bucket?: {
      name: string
    }
  }
}

type TypeCompany = {
  _id: ObjectId
  name: string
  description?: string
  photo?: string
  credentials?: TypeCredentials
  token: string
  createdAt: Date
  updatedAt?: Date
  active: boolean
  deleted: boolean
  settings: TypeCompanySettings
  tenantID: string
}

export { TypeCompany, TypeCredentials, TypeCredentialsFile }
