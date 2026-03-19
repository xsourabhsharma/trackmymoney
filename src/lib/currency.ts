export const USD_TO_INR_RATE = 92; // Exact rate requested by user

/**
 * Formats a given value into the target currency.
 * Assumes the base value stored in the database is in USD.
 */
export function formatCurrency(
  value: number, 
  targetCurrency: 'USD' | 'INR' = 'USD', 
  baseCurrency: 'USD' | 'INR' = 'USD'
): string {
  let convertedValue = value;
  
  // Calculate the converted value
  if (baseCurrency === 'USD' && targetCurrency === 'INR') {
    convertedValue = value * USD_TO_INR_RATE;
  } else if (baseCurrency === 'INR' && targetCurrency === 'USD') {
    convertedValue = value / USD_TO_INR_RATE;
  }

  const abs = Math.abs(convertedValue);
  const isNegative = convertedValue < 0;
  const sign = isNegative ? '-' : '';

  if (targetCurrency === 'USD') {
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(2)}K`;
    
    return `${sign}$${abs.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } else {
    // INR Formatting
    if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)}Cr`;
    if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)}L`;
    
    return `${sign}₹${abs.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}
