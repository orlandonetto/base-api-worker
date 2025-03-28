import rdiff from 'recursive-diff'

const getKeysDiff = (target, source) => {
  return Object.keys(source).filter(key => source[key] !== target[key])
}

const isNullOrUndefined = object => [null, undefined].includes(object)
const isDefined = object => !isNullOrUndefined(object)
const isNull = object => object === null
const isDefinedOrNull = object => isDefined(object) || isNull(object)
const isUndefined = object => object === undefined

const getRDiff = (source, target) => {
  return rdiff.getDiff(source, target)
}

export {
  isDefined,
  isNullOrUndefined,
  isUndefined,
  isNull,
  isDefinedOrNull,
  getKeysDiff,
  getRDiff,
}
