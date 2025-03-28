import { isDefined } from './object-helper'
import { escapeRegExp, normalizeString } from './string-helper'

const getQueryExactlyAttributeString = (key: string, value: string) => ({
  [key]: {
    $regex: `^${escapeRegExp(value)}$`,
    $options: 'si',
  },
})

const getQueryStartWithAttributeString = (key: string, value: string) => ({
  [key]: {
    $regex: `^${escapeRegExp(value)}`,
    $options: 'si',
  },
})

const getQueryContainsAttributeString = (key: string, value: string) => ({
  [key]: {
    $regex: `${escapeRegExp(value)}`,
    $options: 'si',
  },
})

const searchAttributeString = (key, value) => {
  if (!value) {
    return {}
  }

  const texts = value.toLowerCase().trim().split(' ')
  const normalizedTexts = texts.map(s => normalizeString(escapeRegExp(s)))

  return {
    $and: normalizedTexts.map(t => ({
      [key]: {
        $regex: `.*${t}.*$`,
        $options: 'si',
      },
    })),
  }
}

const buildPaginationPipeline = ({ offset, limit, sortBy, sortOrder }) => {
  const pipeline = []

  // Sort
  pipeline.push({
    $sort: { [sortBy || '_id']: (sortOrder || 'desc') === 'asc' ? 1 : -1 },
  })

  // Offset
  if (isDefined(offset) && offset >= 0) {
    pipeline.push({ $skip: offset })
  }

  // Limit
  if (isDefined(limit) && limit > 0) {
    pipeline.push({ $limit: limit })
  }

  return pipeline
}

export {
  getQueryExactlyAttributeString,
  searchAttributeString,
  buildPaginationPipeline,
  getQueryStartWithAttributeString,
  getQueryContainsAttributeString,
}
