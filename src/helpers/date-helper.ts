import moment from 'moment'

const isMajority = (birthDate: Date, now = moment(), majority = 18) => {
  return now.diff(birthDate, 'years') >= majority
}

const formatStringToDate = (date: string, format?: string) => {
  return moment(date, format).toDate()
}

const getStartOfDay = () => {
  return moment().startOf('day').toDate()
}

const getEndOfDay = () => {
  return moment().endOf('day').toDate()
}

export { isMajority, formatStringToDate, getStartOfDay, getEndOfDay }
