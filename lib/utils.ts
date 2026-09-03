import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNowStrict } from 'date-fns'
// import { faIR } from 'date-fns/locale'
import qs from 'query-string'
import moment from 'moment'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatDistanceLocale = {
  lessThanXSeconds: 'همین الان',
  xSeconds: 'همین الان',
  halfAMinute: 'همین الان',
  lessThanXMinutes: '{{count}} دقیقه',
  xMinutes: '{{count}} دقیقه',
  aboutXHours: '{{count}} ساعت',
  xHours: '{{count}} ساعت',
  xDays: '{{count}} روز',
  aboutXWeeks: '{{count}} هفته',
  xWeeks: '{{count}} هفته',
  aboutXMonths: '{{count}} ماه',
  xMonths: '{{count}} ماه',
  aboutXYears: '{{count}} سال',
  xYears: '{{count}} سال',
  overXYears: '{{count}} سال',
  almostXYears: '{{count}} سال',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDistance(token: string, count: number, options?: any): string {
  options = options || {}

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace('{{count}}', count.toString())

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'در ' + result
    } else {
      if (result === 'همین الان') return result
      // return result + ' پیش '
      return result + ''
    }
  }

  return result
}

export function timestamp(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    // locale: faIR,
    locale: {
      formatDistance,
    },
  })
}

export const formatter = new Intl.NumberFormat('fa-IR', {
  style: 'decimal',
  //   style: 'currency',
  currency: 'IRT',
})

interface UrlQueryParams {
  params: string
  key: string
  value: string | null
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  // accessing the current url
  const currentUrl = qs.parse(params)
  // query-string package automatically gives you the search params

  // it only updates the one we want to update, while keeping everything else the same in component's useState
  currentUrl[key] = value

  return qs.stringifyUrl(
    {
      // base url
      url: window.location.pathname,
      // current url
      query: currentUrl,
    },
    // options: we don't need null values
    { skipNull: true },
  )
}

interface RemoveUrlQueryParams {
  params: string
  keysToRemove: string[]
}
export const removeKeysFromUrlQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params)

  keysToRemove.forEach((key) => {
    delete currentUrl[key]
  })

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  )
}

export function translateGlobalSearchFiltersType(input: string): string {
  const translationMap: { [key: string]: string } = {
    specialization: 'تخصص',
    doctor: 'دکتر',
    illness: 'بیماری',
  }

  return translationMap[input]
}

export const shuffleArray = <T,>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]] // Swap elements
  }
  return array
}

// Booking

export const SplitterTime = ({
  range,
  start,
  end,
}: {
  range: number
  start: string
  end: string
}) => {
  const startTime = moment(start, 'HH:mm')
  const endTime = moment(end, 'HH:mm')

  const slots = []

  for (
    let time = moment(startTime);
    time.isSameOrBefore(endTime);
    time.add(range, 'minutes')
  ) {
    slots.push(moment(time))
  }

  return slots.map((slot) => slot.format('HH:mm'))
}

const daysOfWeek = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]
export const convertDaysToArray = (days = ['Sunday', 'Saturday']) => {
  if (days.length) {
    const dayIndexes = days.map((day) => {
      return daysOfWeek.indexOf(day) // Get the index of the day
    })
    return dayIndexes
  }
}

export const getDayNameFromIndex = (index: number): string => {
  if (index < 0 || index > 6) {
    throw new Error('Invalid day index. Must be between 0 and 6.')
  }
  return daysOfWeek[index]
}

export function translateDays(input: string): string {
  const translationMap: { [key: string]: string } = {
    Saturday: 'شنبه',
    Sunday: 'یکشنبه',
    Monday: 'دوشنبه',
    Tuesday: 'سه‌شنبه',
    Wednesday: 'چهارشنبه',
    Thursday: 'پنجشنبه',
    Friday: 'جمعه',
  }

  return translationMap[input]
}
