class AppError extends Error {
  public readonly name: string
  public readonly message: string
  public readonly status: number
  public readonly error: Error

  constructor(message: string, error: Error, status = 400, name = 'Error') {
    super(message)
    this.message = message
    this.status = status
    this.error = error
    this.name = name
  }
}

export default AppError
