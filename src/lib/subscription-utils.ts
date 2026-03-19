export function normalizeToMonthlyCost(
  amount: number,
  interval: 'weekly' | 'monthly' | 'yearly' | 'custom',
  customIntervalDays: number = 30
): number {
  if (amount <= 0) return 0;
  
  switch (interval) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    case 'custom':
      // Defaulting custom interal to purely 30 days mathematical scale
      if (customIntervalDays <= 0) return amount;
      return (amount * 30) / customIntervalDays;
    default:
      return amount;
  }
}

export interface DetectedSubscription {
  merchant: string;
  canonicalAmount: number;
  interval: 'weekly' | 'monthly' | 'yearly';
  lastChargeDate: string;
  nextChargeDate: string;
  confidenceScore: number;
  transactionIds: string[];
}

/**
 * Heuristic algorithm to detect subscriptions from a raw array of transactions.
 * Requires transactions to be sorted by date (newest first).
 */
export function detectSubscriptionsFromTransactions(transactions: any[]): DetectedSubscription[] {
  // 1. Group transactions by Merchant and exact Amount
  // To handle slight variations (e.g. taxes), a robust version would round the amount or cluster by similarity.
  // For this v1 heuristic, we group by exact merchant and stringified exact integer part of amount.
  const groups = new Map<string, any[]>();
  
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (!tx.merchant) continue;
    
    // Normalize merchant name slightly
    const cleanMerchant = tx.merchant.trim().toUpperCase();
    const approxAmount = Math.round(Number(tx.amount));
    const key = `${cleanMerchant}_${approxAmount}`;
    
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }

  const detected: DetectedSubscription[] = [];

  // 2. Analyze cadences within groups
  for (const [key, group] of groups.entries()) {
    if (group.length < 3) continue; // Require at least 3 occurrences to establish a definitive pattern

    // Sort oldest to newest for gap calculation
    const sorted = [...group].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalGapDays = 0;
    let validGaps = 0;

    for (let i = 1; i < sorted.length; i++) {
      const diffMs = new Date(sorted[i].date).getTime() - new Date(sorted[i-1].date).getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      totalGapDays += diffDays;
      validGaps++;
    }

    const avgGap = validGaps > 0 ? totalGapDays / validGaps : 0;
    
    let interval: 'weekly' | 'monthly' | 'yearly' | null = null;

    // Strict heuristic thresholds for cadences (allowing ±3 days drift for weekends/short months)
    if (avgGap >= 4 && avgGap <= 10) interval = 'weekly';
    else if (avgGap >= 25 && avgGap <= 35) interval = 'monthly';
    else if (avgGap >= 350 && avgGap <= 380) interval = 'yearly';

    if (interval) {
      const lastCharge = new Date(sorted[sorted.length - 1].date);
      let nextCharge = new Date(lastCharge);
      
      if (interval === 'weekly') nextCharge.setDate(nextCharge.getDate() + 7);
      if (interval === 'monthly') nextCharge.setMonth(nextCharge.getMonth() + 1);
      if (interval === 'yearly') nextCharge.setFullYear(nextCharge.getFullYear() + 1);

      detected.push({
        merchant: sorted[0].merchant,
        canonicalAmount: Number(sorted[0].amount),
        interval,
        lastChargeDate: lastCharge.toISOString(),
        nextChargeDate: nextCharge.toISOString(),
        confidenceScore: Math.min(0.95, 0.5 + (sorted.length * 0.05)), // Higher counts = higher confidence
        transactionIds: sorted.map(t => t.id)
      });
    }
  }

  return detected.sort((a, b) => b.canonicalAmount - a.canonicalAmount);
}
