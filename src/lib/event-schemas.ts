// Server-compatible event schema generation
// This file can be imported by server components

// Generic event type for schema generation
interface EventLike {
  type: string
  title: string
  description?: string
  date: string
  isConfirmed: boolean
}

const catalystLabels: Record<string, string> = {
  earnings: 'Earnings Report',
  dividend: 'Dividend Payment',
  ex_dividend: 'Ex-Dividend Date',
  conference: 'Conference',
  product_launch: 'Product Launch',
  regulatory: 'Regulatory Decision',
  stock_split: 'Stock Split',
  guidance: 'Guidance Update',
  analyst_day: 'Analyst Day',
  shareholder_meeting: 'Shareholder Meeting',
}

function getDaysUntil(dateStr: string): number {
  const eventDate = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function generateEventSchemas(
  ticker: string,
  companyName: string,
  events: EventLike[],
  baseUrl: string = 'https://lician.com'
): object[] {
  return events
    .filter(event => getDaysUntil(event.date) >= 0)
    .slice(0, 10)
    .map(event => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.description || `${catalystLabels[event.type] || event.type} for ${companyName} (${ticker})`,
      startDate: event.date,
      endDate: event.date,
      eventStatus: event.isConfirmed
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventRescheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: {
        '@type': 'VirtualLocation',
        url: `${baseUrl}/stock/${ticker.toLowerCase()}`,
      },
      organizer: {
        '@type': 'Corporation',
        name: companyName,
        url: `${baseUrl}/stock/${ticker.toLowerCase()}`,
      },
      performer: {
        '@type': 'Corporation',
        name: companyName,
      },
      about: {
        '@type': 'FinancialProduct',
        name: `${ticker} Stock`,
      },
    }))
}
