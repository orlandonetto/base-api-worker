import { validateCPF } from './string-helper'

describe('validateCPF', () => {
  it('should return true for valid CPFs', () => {
    const valid = [
      '593.836.160-59',
      '810.980.570-15',
      '659.335.610-70',
      '219693290-68',
      '45473897053',
    ]

    valid.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(true)
    })
  })

  it('should return false for invalid CPFs', () => {
    const invalid = [
      '123',
      '111.222.333-44',
      '651429108-67',
      '12345678900',
      'xxx.222.333-44',
    ]

    invalid.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(false)
    })
  })
})
