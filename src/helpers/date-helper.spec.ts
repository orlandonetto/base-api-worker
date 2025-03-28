import moment from 'moment'

import { isMajority } from './date-helper'

describe('isMajority', () => {
  it('should return true when person is exactly 18', () => {
    const now = moment('2018-01-01')
    const birthDate = moment('2000-01-01').toDate()

    expect(isMajority(birthDate, now)).toBe(true)
  })

  it('should return true when person is older than 18', () => {
    const now = moment('2018-01-01')
    const birthDate = moment('1990-01-01').toDate()

    expect(isMajority(birthDate, now)).toBe(true)
  })

  it('should return false when person is younger than 18', () => {
    const now = moment('2018-01-01')
    const birthDate = moment('2001-01-01').toDate()

    expect(isMajority(birthDate, now)).toBe(false)
  })

  it('should return true when is custom majority value', () => {
    const now = moment('2018-01-01')
    const birthDate = moment('2001-01-01').toDate()

    expect(isMajority(birthDate, now, 17)).toBe(true)
  })
})
