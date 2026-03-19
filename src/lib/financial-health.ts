// ─── Financial Health Scoring Engine ───
// Weighted 0-100 score based on four pillars:
//   Savings Rate   (30%) — Are you keeping enough of what you earn?
//   Budget Control  (25%) — Are you staying within your budgets?
//   Goal Progress   (25%) — Are you making progress on savings goals?
//   Debt Management (20%) — Are you paying down what you owe?

export interface HealthInputs {
  savingsRate: number; // percentage (0-100+), can exceed 100 if saving more than earning
  budgets: { limitAmount: number; spent: number }[];
  goals: { targetAmount: number; currentAmount: number }[];
  debts: { totalAmount: number; remainingAmount: number }[];
}

export interface HealthResult {
  score: number;
  label: string;
  savingsRateScore: number;
  budgetAdherenceScore: number;
  goalProgressScore: number;
  debtManagementScore: number;
}

// ─── Sub-metric Calculations ───

/** 0% savings → 0, ≥20% savings → 100, linear between. Negative savings clamp to 0. */
function scoreSavingsRate(rate: number): number {
  if (rate <= 0) return 0;
  if (rate >= 20) return 100;
  return (rate / 20) * 100;
}

/** 
 * For each budget: if spent ≤ limit → 100.
 * If overspent, scale down proportionally. Average across all budgets.
 * No budgets → 50 (neutral, not penalizing new users).
 */
function scoreBudgetAdherence(budgets: { limitAmount: number; spent: number }[]): number {
  if (budgets.length === 0) return 50;

  const scores = budgets.map(b => {
    if (b.limitAmount <= 0) return 100;
    const usage = b.spent / b.limitAmount;
    if (usage <= 1) return 100;
    // Over budget: lose points proportionally, floor at 0
    return Math.max(0, 100 - (usage - 1) * 100);
  });

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Average (current / target) across active goals × 100.
 * No goals → 50 (neutral).
 */
function scoreGoalProgress(goals: { targetAmount: number; currentAmount: number }[]): number {
  if (goals.length === 0) return 50;

  const totalProgress = goals.reduce((sum, g) => {
    if (g.targetAmount <= 0) return sum + 1; // completed/invalid target = full credit
    return sum + Math.min(g.currentAmount / g.targetAmount, 1);
  }, 0);

  return (totalProgress / goals.length) * 100;
}

/**
 * If no debts → 100 (debt-free is perfect).
 * Otherwise: ratio of paid off amount. More paid off = higher score.
 */
function scoreDebtManagement(debts: { totalAmount: number; remainingAmount: number }[]): number {
  if (debts.length === 0) return 100;

  const totalOwed = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0);
  const totalRemaining = debts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  if (totalOwed <= 0) return 100;

  const paidOffRatio = 1 - (totalRemaining / totalOwed);
  return Math.max(0, Math.min(100, paidOffRatio * 100));
}

// ─── Main Scoring Function ───

const WEIGHTS = {
  savings: 0.30,
  budget: 0.25,
  goals: 0.25,
  debt: 0.20,
};

function getLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export function computeFinancialHealth(inputs: HealthInputs): HealthResult {
  const savingsRateScore = scoreSavingsRate(inputs.savingsRate);
  const budgetAdherenceScore = scoreBudgetAdherence(inputs.budgets);
  const goalProgressScore = scoreGoalProgress(inputs.goals);
  const debtManagementScore = scoreDebtManagement(inputs.debts);

  const score = Math.round(
    savingsRateScore * WEIGHTS.savings +
    budgetAdherenceScore * WEIGHTS.budget +
    goalProgressScore * WEIGHTS.goals +
    debtManagementScore * WEIGHTS.debt
  );

  return {
    score,
    label: getLabel(score),
    savingsRateScore: Math.round(savingsRateScore),
    budgetAdherenceScore: Math.round(budgetAdherenceScore),
    goalProgressScore: Math.round(goalProgressScore),
    debtManagementScore: Math.round(debtManagementScore),
  };
}
