

export interface HealthInputs {
  savingsRate: number;
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



function scoreSavingsRate(rate: number): number {
  if (rate <= 0) return 0;
  if (rate >= 20) return 100;
  return (rate / 20) * 100;
}


function scoreBudgetAdherence(budgets: { limitAmount: number; spent: number }[]): number {
  if (budgets.length === 0) return 50;

  const scores = budgets.map(b => {
    if (b.limitAmount <= 0) return 100;
    const usage = b.spent / b.limitAmount;
    if (usage <= 1) return 100;
   
    return Math.max(0, 100 - (usage - 1) * 100);
  });

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}


function scoreGoalProgress(goals: { targetAmount: number; currentAmount: number }[]): number {
  if (goals.length === 0) return 50;

  const totalProgress = goals.reduce((sum, g) => {
    if (g.targetAmount <= 0) return sum + 1;
    return sum + Math.min(g.currentAmount / g.targetAmount, 1);
  }, 0);

  return (totalProgress / goals.length) * 100;
}


function scoreDebtManagement(debts: { totalAmount: number; remainingAmount: number }[]): number {
  if (debts.length === 0) return 100;

  const totalOwed = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0);
  const totalRemaining = debts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  if (totalOwed <= 0) return 100;

  const paidOffRatio = 1 - (totalRemaining / totalOwed);
  return Math.max(0, Math.min(100, paidOffRatio * 100));
}


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
