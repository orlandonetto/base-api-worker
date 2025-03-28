import { getRandomNumber } from './number-helper'

describe('getRandomNumber', () => {
  it('retorna um número dentro do intervalo especificado', () => {
    const from = 1
    const to = 10

    for (let i = 0; i < 100; i++) {
      // Faz múltiplos testes
      const result = getRandomNumber(from, to)
      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    }
  })

  it('retorna apenas números inteiros', () => {
    const from = 1
    const to = 10

    for (let i = 0; i < 100; i++) {
      const result = getRandomNumber(from, to)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  it('retorna o mesmo número se from e to forem iguais', () => {
    const from = 5
    const to = 5

    for (let i = 0; i < 10; i++) {
      const result = getRandomNumber(from, to)
      expect(result).toBe(from)
    }
  })

  it('funciona corretamente com números negativos', () => {
    const from = -10
    const to = -1

    for (let i = 0; i < 100; i++) {
      const result = getRandomNumber(from, to)
      expect(result).toBeGreaterThanOrEqual(from)
      expect(result).toBeLessThanOrEqual(to)
    }
  })

  it('retorna 0 se o range for de 0 para 0', () => {
    const from = 0
    const to = 0
    const result = getRandomNumber(from, to)
    expect(result).toBe(0)
  })
})
