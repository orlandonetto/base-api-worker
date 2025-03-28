import multer from 'multer'

const multerStorage = multer.memoryStorage() // Armazena o arquivo na memória temporariamente

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50MB
})

const uploadSingle =
  (key = 'file') =>
  (request, response, next) => {
    upload.single(key)(request, response, next)
  }

const uploadMultiple =
  (key = 'files') =>
  (request, response, next) => {
    upload.array(key)(request, response, next)
  }

export { uploadSingle, uploadMultiple }
