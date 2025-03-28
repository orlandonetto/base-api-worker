import fs from 'fs'

import { Storage } from '@google-cloud/storage'

import {
  TypeCredentials,
  TypeCredentialsFile,
} from '../../../api/companies/companies.types'

const uploadToStorage = async (
  credentials: TypeCredentialsFile,
  bucketName: string,
  localFile: string | Buffer,
  storageFilePath: string,
) => {
  try {
    const localFileIsPath = typeof localFile === 'string'
    const localFileIsBuffer = Buffer.isBuffer(localFile)
    if (!localFileIsPath && !localFileIsBuffer) {
      throw new Error(
        'O parâmetro do arquivo local deve ser um path (string) ou um Buffer.',
      )
    }

    const storage = new Storage({ credentials })

    // Remover barra inicial se existir
    if (storageFilePath.startsWith('/')) {
      storageFilePath = storageFilePath.substring(1)
    }

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(storageFilePath)

    // Verificar se o arquivo já existe no Storage
    const [exists] = await file.exists()
    if (exists) {
      // eslint-disable-next-line no-console
      console.log(`O arquivo já existe no storage: ${storageFilePath}`)
      return `gs://${bucketName}/${storageFilePath}`
    }

    // eslint-disable-next-line no-console
    console.log(`Uploading file to ${storageFilePath}`)

    if (localFileIsPath) {
      if (!fs.existsSync(localFile)) {
        throw new Error(`Arquivo local não encontrado: ${localFile}`)
      }
      await bucket.upload(localFile, {
        destination: storageFilePath,
        resumable: false,
      })
    } else {
      // 📌 Se for um Buffer
      await file.save(localFile)
    }

    const uri = `gs://${bucketName}/${storageFilePath}`
    // eslint-disable-next-line no-console
    console.log(`Upload completed: ${uri}`)
    return uri
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error uploading file:', error.message)
    return null
  }
}

const deleteFromStorage = async (
  credentials: TypeCredentialsFile,
  bucketName: string,
  storageFilePath: string,
) => {
  const storage = new Storage({ credentials })
  const bucket = storage.bucket(bucketName)

  const file = bucket.file(storageFilePath)

  const [exists] = await file.exists()
  if (!exists) {
    // eslint-disable-next-line no-console
    console.log(`O arquivo ${storageFilePath} nao foi encontrado no storage`)
    return
  }

  await file.delete()
  // eslint-disable-next-line no-console
  console.log(`O arquivo ${storageFilePath} foi deletado do storage`)
}

const getFileSignedURL = async (
  credentials: TypeCredentialsFile,
  bucketName: string,
  filename: string,
) => {
  const storage = new Storage({
    credentials,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000 * 5, // URL válida por 5 horas
  }

  const [url] = await storage
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options)

  return url
}

const processFileURL = async (
  filename,
  file: Express.Multer.File,
  credentials: TypeCredentials,
) => {
  const fileType = file.originalname.split('.').pop() // Pega a extensão do arquivo
  const fileName = `${filename}.${fileType}`

  // Enviar para o Google Storage e gerar a URL
  const fileUrl = await uploadToStorage(
    credentials.gcp.file,
    credentials.gcp.bucket.name,
    file.buffer,
    fileName,
  )

  if (!fileUrl) {
    throw new Error('Ocorreu um erro ao enviar o video para o Google Storage')
  }

  return fileUrl?.replace('gs://', 'https://storage.googleapis.com/')
}

export { uploadToStorage, deleteFromStorage, getFileSignedURL, processFileURL }
