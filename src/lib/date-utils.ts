import { 
  startOfMonth, endOfMonth, 
  subMonths, 
  subDays, 
  startOfYear, endOfYear, 
  parseISO
} from 'date-fns';

export type TransactionsPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all_time';


export function getDateRangeForPeriod(period: TransactionsPeriod): { startDate?: string; endDate?: string } {
  const now = new Date();
  
  switch (period) {
    case 'this_month':
      return { 
        startDate: startOfMonth(now).toISOString(), 
        endDate: endOfMonth(now).toISOString() 
      };
      
    case 'last_month':
      const lastMonth = subMonths(now, 1);
      return { 
        startDate: startOfMonth(lastMonth).toISOString(), 
        endDate: endOfMonth(lastMonth).toISOString() 
      };
      
    case 'last_3_months':
      
      return { 
        startDate: subDays(now, 90).toISOString(), 
        endDate: now.toISOString() 
      };
      
    case 'this_year':
      return { 
        startDate: startOfYear(now).toISOString(), 
        endDate: endOfYear(now).toISOString() 
      };
      
    case 'all_time':
    default:
      return {}; 
  }
}
