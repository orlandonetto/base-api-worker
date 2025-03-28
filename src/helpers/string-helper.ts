const containsAlphabeticalChar = str => {
  str = (str || '').toString()
  return /[a-zA-Z]+/.test(str)
}

const separateNumbersAndLetters = str => {
  str = (str || '').toString()
  const numbers = str.split('').filter(char => !Number.isNaN(char))
  const letters = str.split('').filter(char => Number.isNaN(char))
  return { numbers: numbers.join(''), letters: letters.join('') }
}

const generateRandomString = (
  length = 5,
  characters = 'ACEFGHJKQRSTUVWXYZ245789',
) => {
  let result = ''

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

const capitalize = (text = '') => {
  return text.charAt(0).toUpperCase().concat(text.toLowerCase().substring(1))
}

const charMap = {
  a: '[aàáâãäå]',
  e: '[eèéêë]',
  i: '[iìíîï]',
  o: '[oòóôõö]',
  u: '[uùúûü]',
  c: '[cç]',
}

const normalizeString = str => {
  // Passo 1: Normalizar a string
  const normalizedString = [
    ...str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  ]

  // Passo 2: Mapear e substituir caracteres
  const mappedString = normalizedString.map(char => {
    // Verificar se o caractere tem uma substituição no charMap
    if (charMap[char]) {
      // Substituir o caractere pelo valor correspondente no charMap
      return char.replace(char, charMap[char])
    }
    // Manter o caractere original se não houver substituição no charMap
    return char
  })

  // Passo 3: Unir os caracteres em uma string
  const finalString = mappedString.join('')

  // Retornar a string normalizada
  return finalString
}

const escapeRegExp = str => {
  // Passo 1: Remover espaços extras
  const words = str.split(' ')
  const trimmedWords = words.map(word => word.trim())
  const nonEmptyWords = trimmedWords.filter(word => word)
  const joinedString = nonEmptyWords.join(' ')

  // Passo 2: Remover espaços em branco no início e no final
  const trimmedString = joinedString.trim()

  // Passo 3: Escapar caracteres especiais
  return trimmedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const containsAccent = str => {
  return /[áàâãäéèêëíìîïóòôõöúùûüçñ]/i.test(str)
}

const normalizeWord = (word: string): string => {
  return word
    .normalize('NFD') // Separa caracteres base de seus diacríticos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/ç/g, 'c') // Substitui cedilha por 'c'
    .replace(/Ç/g, 'C') // Substitui cedilha maiúscula por 'C'
}

const validateCPF = (cpf: string) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '')

  // Verifica se o CPF tem 11 dígitos e não é uma sequência repetida
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  // Função para calcular cada dígito verificador
  const calculateDigit = initialFactor =>
    ((cpf
      .slice(0, initialFactor - 1)
      .split('')
      .reduce(
        (sum, num, index) => sum + parseInt(num, 10) * (initialFactor - index),
        0,
      ) *
      10) %
      11) %
    10

  // Verifica se os dois dígitos verificadores estão corretos
  return (
    calculateDigit(10) === parseInt(cpf[9], 10) &&
    calculateDigit(11) === parseInt(cpf[10], 10)
  )
}

const validateCNPJ = (cnpj: string) => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '')

  // Verifica se o CNPJ tem 14 dígitos e não é uma sequência repetida
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  // Função para calcular os dígitos verificadores
  const calculateDigit = (cnpjPartial: string, factors: number[]): number => {
    const sum = cnpjPartial
      .split('')
      .reduce((acc, num, index) => acc + parseInt(num, 10) * factors[index], 0)

    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  // Fatores para o primeiro e segundo dígito verificador
  const firstFactors = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondFactors = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  // Calcula o primeiro dígito verificador
  const firstDigit = calculateDigit(cnpj.slice(0, 12), firstFactors)

  // Calcula o segundo dígito verificador
  const secondDigit = calculateDigit(cnpj.slice(0, 13), secondFactors)

  // Verifica se os dígitos calculados são iguais aos do CNPJ
  return (
    firstDigit === parseInt(cnpj[12], 10) &&
    secondDigit === parseInt(cnpj[13], 10)
  )
}

export {
  containsAlphabeticalChar,
  separateNumbersAndLetters,
  generateRandomString,
  capitalize,
  escapeRegExp,
  normalizeString,
  containsAccent,
  normalizeWord,
  validateCPF,
  validateCNPJ,
}
