import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

const insightsRequestSchema = z.object({
  stats: z.object({
    period: z.string().max(100).optional(),
    inflow: z.coerce.number().optional(),
    outflow: z.coerce.number().optional(),
    netPosition: z.coerce.number().optional(),
    savingsRate: z.coerce.number().optional(),
    nodeBalance: z.coerce.number().optional(),
    metrics: z.object({
      inflow: z.coerce.number().optional(),
      outflow: z.coerce.number().optional(),
      netPosition: z.coerce.number().optional(),
      savingsRate: z.coerce.number().optional(),
      accountBalance: z.coerce.number().optional(),
      totalAccounts: z.coerce.number().optional(),
    }).partial().optional(),
    topSpending: z.array(z.object({
      categoryName: z.string().optional(),
      name: z.string().optional(),
      amount: z.coerce.number().optional(),
      total: z.coerce.number().optional(),
    })).max(10).optional(),
    topSpendingCategories: z.array(z.object({
      categoryName: z.string().optional(),
      name: z.string().optional(),
      amount: z.coerce.number().optional(),
      total: z.coerce.number().optional(),
    })).max(10).optional(),
    upcomingCharges: z.array(z.unknown()).max(50).optional(),
    recentTransactions: z.array(z.unknown()).max(1000).optional(),
    financialHealth: z.object({
      score: z.coerce.number().optional(),
    }).partial().optional(),
    healthSnapshot: z.object({
      overallScore: z.coerce.number().optional(),
    }).partial().optional(),
  }).passthrough(),
});

type InsightsSummary = {
  period?: string;
  inflow: number;
  outflow: number;
  netPosition: number;
  savingsRate: number;
  accountBalance: number;
  totalAccounts: number;
  topCategories: Array<{ name: string; amount: number }>;
  upcomingChargesCount: number;
  healthScore: number;
  transactionCount: number;
};

type InsightRecord = {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'opportunity';
  actionHint: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedBody = insightsRequestSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Missing stats' }, { status: 400 });
  }

  const { stats } = parsedBody.data;

  try {
    const summary: InsightsSummary = {
      period: stats.period,
      inflow: stats.metrics?.inflow ?? stats.inflow ?? 0,
      outflow: stats.metrics?.outflow ?? stats.outflow ?? 0,
      netPosition: stats.metrics?.netPosition ?? stats.netPosition ?? 0,
      savingsRate: stats.metrics?.savingsRate ?? stats.savingsRate ?? 0,
      accountBalance: stats.metrics?.accountBalance ?? stats.nodeBalance ?? 0,
      totalAccounts: stats.metrics?.totalAccounts ?? 0,
      topCategories: (stats.topSpending || stats.topSpendingCategories || []).slice(0, 5).map((category) => ({
        name: category.categoryName || category.name || 'Unknown',
        amount: category.amount || category.total || 0,
      })),
      upcomingChargesCount: (stats.upcomingCharges || []).length,
      healthScore: stats.financialHealth?.score ?? stats.healthSnapshot?.overallScore ?? 0,
      transactionCount: (stats.recentTransactions || []).length,
    };

    if (!process.env.GROQ_API_KEY) {
      console.warn('No GROQ_API_KEY configured, returning mock insights');
      const mockInsights = generateMockInsights(summary);

      await storeInsights(supabase, user.id, stats.period || 'this-month', mockInsights, summary);
      return NextResponse.json({ insights: mockInsights });
    }

    const prompt = `You are a personal finance advisor. Analyze these financial metrics and generate 3-5 concise, actionable insights.

Financial Summary:
- Period: ${summary.period}
- Income: $${summary.inflow.toLocaleString()}
- Expenses: $${summary.outflow.toLocaleString()}
- Net Position: $${summary.netPosition.toLocaleString()}
- Savings Rate: ${summary.savingsRate.toFixed(1)}%
- Account Balance: $${summary.accountBalance.toLocaleString()}
- Top spending categories: ${summary.topCategories.map((category) => `${category.name}: $${category.amount}`).join(', ') || 'None'}
- Upcoming charges: ${summary.upcomingChargesCount}
- Financial Health Score: ${summary.healthScore}/100

Rules:
- Be specific and reference actual numbers
- Identify spending patterns, savings opportunities, and risks
- Each insight should have a clear action the user can take
- Keep titles under 6 words in Standard Title Case
- Keep body under 30 words in normal sentence case
- actionHint should be friendly, clear, and normal sentence case. DO NOT yell or use ALL CAPS.

Respond with ONLY a valid JSON array (no markdown, no code blocks) of objects with these exact keys:
- id: a unique string (use "1", "2", etc.)
- title: string (short, specific)
- body: string (the insight)
- severity: "info" | "warning" | "opportunity"
- actionHint: string (specific action to take, sentence case)`;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
    const model = groq('llama-3.1-8b-instant');

    const { text } = await generateText({
      model,
      prompt,
    });

    let insights: InsightRecord[] = [];
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      insights = JSON.parse(cleaned) as InsightRecord[];
    } catch {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    await storeInsights(supabase, user.id, stats.period || 'this-month', insights, summary);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

async function storeInsights(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  period: string,
  insights: InsightRecord[],
  promptPayload: InsightsSummary
) {
  try {
    await supabase.from('ai_insights').insert({
      user_id: userId,
      period,
      insights_json: insights,
      prompt_payload: promptPayload,
    });
  } catch (error) {
    console.error('Failed to store AI insights:', error);
  }
}

function generateMockInsights(summary: InsightsSummary): InsightRecord[] {
  const insights: InsightRecord[] = [];

  if (summary.savingsRate > 20) {
    insights.push({
      id: '1',
      title: 'Strong Savings Rate',
      body: `You're saving ${summary.savingsRate.toFixed(1)}% of your income. You're above the recommended 20% threshold.`,
      severity: 'info',
      actionHint: 'Consider investing the surplus in an index fund.',
    });
  } else if (summary.savingsRate > 0) {
    insights.push({
      id: '1',
      title: 'Savings Below Target',
      body: `Your ${summary.savingsRate.toFixed(1)}% savings rate is below the recommended 20%. Look for areas to cut back.`,
      severity: 'warning',
      actionHint: 'Review your top spending categories for quick wins.',
    });
  } else {
    insights.push({
      id: '1',
      title: 'Spending Exceeds Income',
      body: `You're spending more than you earn this period. Net position is -$${Math.abs(summary.netPosition).toLocaleString()}.`,
      severity: 'warning',
      actionHint: 'Identify and reduce non-essential expenses immediately.',
    });
  }

  if (summary.topCategories.length > 0) {
    const topCategory = summary.topCategories[0];
    insights.push({
      id: '2',
      title: `Top: ${topCategory.name}`,
      body: `${topCategory.name} is your biggest expense at $${Number(topCategory.amount).toLocaleString()}. Check if there are ways to optimize.`,
      severity: 'opportunity',
      actionHint: `Review your ${topCategory.name} transactions for savings.`,
    });
  }

  if (summary.upcomingChargesCount > 0) {
    insights.push({
      id: '3',
      title: 'Upcoming Charges',
      body: `You have ${summary.upcomingChargesCount} subscription${summary.upcomingChargesCount > 1 ? 's' : ''} coming up. Review for any you no longer need.`,
      severity: 'info',
      actionHint: 'Visit Subscriptions to review active services.',
    });
  }

  if (insights.length < 3) {
    insights.push({
      id: String(insights.length + 1),
      title: 'Build Your Profile',
      body: 'Add more transactions and set up budgets to get personalized insights tailored to your spending patterns.',
      severity: 'info',
      actionHint: 'Create your first budget in the Budgets tab.',
    });
  }

  return insights;
}
