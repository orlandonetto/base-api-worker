export default () => {
  jest.mock('../../src/services/email', () => ({
    sendEmail: jest.fn(() => {
      // eslint-disable-next-line no-console
      console.log('sendEmail mocked...')
    }),
  }))

  jest.mock('../../src/middlewares/upload-middleware', () => ({
    ...jest.requireActual('../../src/middlewares/upload-middleware'),
    uploadSingle: jest.fn(_key => (request, _, next) => {
      request.file = {
        originalname: 'originalname_mocked',
        filename: 'filename_mocked',
        mimetype: 'image/png',
        size: 100,
        buffer: Buffer.from('buffer_mocked'),
      }
      next()
    }),

    uploadMultiple: jest.fn(_key => (request, _, next) => {
      request.files = [
        {
          originalname: 'originalname_mocked',
          filename: 'filename_mocked',
          mimetype: 'image/png',
          size: 100,
          buffer: Buffer.from('buffer_mocked'),
        },
      ]
      next()
    }),
  }))

  jest.mock('../../src/services/google/storage', () => ({
    ...jest.requireActual('../../src/services/google/storage'),
    processFileURL: jest.fn(() => 'https://storage.googleapis.com/'),
    uploadToStorage: jest.fn(() => 'https://storage.googleapis.com/'),
    deleteFromStorage: jest.fn(),
  }))
}
