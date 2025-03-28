import { Languages } from '../../types/global.enums'
import { TypeMessages } from '../../types/global.types'
import en from './locales/en-US.json'
import br from './locales/pt-BR.json'

const messages = {
  [Languages.Brazilian]: br,
  [Languages.English]: en,
}

const defaultLanguage = Languages.Brazilian

const getMessages = (language?: Languages): TypeMessages => {
  return messages[language] || messages[defaultLanguage]
}

export { getMessages }
