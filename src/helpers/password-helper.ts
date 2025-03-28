import bcrypt from 'bcrypt'

const encryptPassword = async (rawPass: string, salt = 10): Promise<string> => {
  return bcrypt.hash(rawPass, salt)
}

const comparePassword = async (rawPass: string, hashedPass: string) => {
  return bcrypt.compare(rawPass, hashedPass)
}

export { encryptPassword, comparePassword }
