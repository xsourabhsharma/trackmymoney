export const USD_TO_INR_RATE = 93;


export function formatCurrency(
  value: number, 
  targetCurrencyRaw: string = 'USD', 
  baseCurrencyRaw: string = 'USD'
): string {
  let convertedValue = value;
  const targetCurrency = targetCurrencyRaw.toUpperCase()
  const baseCurrency = baseCurrencyRaw.toUpperCase()
  
 
  if (baseCurrency === 'USD' && targetCurrency === 'INR') {
    convertedValue = value * USD_TO_INR_RATE;
  } else if (baseCurrency === 'INR' && targetCurrency === 'USD') {
    convertedValue = value / USD_TO_INR_RATE;
  }

  const abs = Math.abs(convertedValue);
  const isNegative = convertedValue < 0;
  const sign = isNegative ? '-' : '';

  if (targetCurrency === 'USD') {
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 10_000) return `${sign}$${(abs / 10_000).toFixed(2)}K`;
    
    return `${sign}$${abs.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } else {
   
    if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)}Cr`;
    if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)}L`;
    
    return `${sign}₹${abs.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}
