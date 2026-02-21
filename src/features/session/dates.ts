export const isUpcomingSession = (date: string): boolean =>
  new Date(date) > new Date()

export const formatSessionDate = (date: string): string =>
  new Date(date).toLocaleDateString()

export const formatSessionDateTime = (date: string): string =>
  new Date(date).toLocaleString()
