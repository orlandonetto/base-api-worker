const convertToCents = (value: string | number) => {
  const cleanValue = value.toString().replace(/[^\d.]/g, '')
  const cents = parseFloat(cleanValue) * 100

  return Math.round(cents)
}

const getRandomNumber = (from: number, to: number) => {
  // retorna um numero inteiro aleatório com o um range entre "from" e "to"
  return Math.floor(Math.random() * (to - from + 1) + from)
}

export { convertToCents, getRandomNumber }
