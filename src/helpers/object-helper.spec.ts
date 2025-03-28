import { getRDiff } from './object-helper'

describe('getRDfiff', () => {
  it('should return the diff between two objects', () => {
    const initialVal = { itemID: '1', qty: 1, test: true }
    const changedVal = { itemID: '1', qty: 11, text: 'test' }

    const diff = getRDiff(initialVal, changedVal)

    expect(diff).toEqual([
      {
        op: 'update',
        path: ['qty'],
        val: 11,
      },
      {
        op: 'delete',
        path: ['test'],
      },
      {
        op: 'add',
        path: ['text'],
        val: 'test',
      },
    ])
  })
})
