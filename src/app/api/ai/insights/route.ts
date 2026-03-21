import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { createGroq } from '@ai-sdk/groq';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stats } = await req.json();

  if (!stats) {
    return NextResponse.json({ error: 'Missing stats' }, { status: 400 });
  }

  try {
    // Build a concise summary payload — never send raw transaction rows to the LLM
    const summary = {
      period: stats.period,
      inflow: stats.metrics?.inflow ?? stats.inflow ?? 0,
      outflow: stats.metrics?.outflow ?? stats.outflow ?? 0,
      netPosition: stats.metrics?.netPosition ?? stats.netPosition ?? 0,
      savingsRate: stats.metrics?.savingsRate ?? stats.savingsRate ?? 0,
      accountBalance: stats.metrics?.accountBalance ?? stats.nodeBalance ?? 0,
      totalAccounts: stats.metrics?.totalAccounts ?? 0,
      topCategories: (stats.topSpending || stats.topSpendingCategories || []).slice(0, 5).map((c: any) => ({
        name: c.categoryName || c.name,
        amount: c.amount || c.total,
      })),
      upcomingChargesCount: (stats.upcomingCharges || []).length,
      healthScore: stats.financialHealth?.score ?? stats.healthSnapshot?.overallScore ?? 0,
      transactionCount: (stats.recentTransactions || []).length,
    };

    // If no API key is configured, return intelligent mock data based on actual stats
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!hasOpenAI && !hasGoogle) {
      console.warn("No AI API key configured, returning mock insights");
      const mockInsights = generateMockInsights(summary);
      
      // Still store the mock insights
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
- Top spending categories: ${summary.topCategories.map((c: any) => `${c.name}: $${c.amount}`).join(', ') || 'None'}
- Upcoming charges: ${summary.upcomingChargesCount}
- Financial Health Score: ${summary.healthScore}/100

Rules:
- Be specific and reference actual numbers
- Identify spending patterns, savings opportunities, and risks
- Each insight should have a clear action the user can take
- Keep titles under 6 words, body under 30 words

Respond with ONLY a valid JSON array (no markdown, no code blocks) of objects with these exact keys:
- id: a unique string (use "1", "2", etc.)
- title: string (short, specific)
- body: string (the insight)
- severity: "info" | "warning" | "opportunity"
- actionHint: string (specific action to take)`;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
    const model = groq('llama-3.3-70b-versatile');

    const { text } = await generateText({
      model,
      prompt,
    });

    // Parse JSON from LLM response
    let insights = [];
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      insights = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Store insights in database
    await storeInsights(supabase, user.id, stats.period || 'this-month', insights, summary);

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate insights' }, { status: 500 });
  }
}

// Store insights in the ai_insights table
async function storeInsights(supabase: any, userId: string, period: string, insights: any[], promptPayload: any) {
  try {
    await supabase.from('ai_insights').insert({
      user_id: userId,
      period,
      insights_json: insights,
      prompt_payload: promptPayload,
    });
  } catch (e) {
    console.error('Failed to store AI insights:', e);
    // Non-fatal — don't break the response
  }
}

// Generate context-aware mock insights when no API key is configured
function generateMockInsights(summary: any) {
  const insights = [];
  
  if (summary.savingsRate > 20) {
    insights.push({
      id: '1',
      title: 'Strong Savings Rate',
      body: `You're saving ${summary.savingsRate.toFixed(1)}% of your income. You're above the recommended 20% threshold.`,
      severity: 'info' as const,
      actionHint: 'Consider investing the surplus in an index fund.',
    });
  } else if (summary.savingsRate > 0) {
    insights.push({
      id: '1',
      title: 'Savings Below Target',
      body: `Your ${summary.savingsRate.toFixed(1)}% savings rate is below the recommended 20%. Look for areas to cut back.`,
      severity: 'warning' as const,
      actionHint: 'Review your top spending categories for quick wins.',
    });
  } else {
    insights.push({
      id: '1',
      title: 'Spending Exceeds Income',
      body: `You're spending more than you earn this period. Net position is -$${Math.abs(summary.netPosition).toLocaleString()}.`,
      severity: 'warning' as const,
      actionHint: 'Identify and reduce non-essential expenses immediately.',
    });
  }

  if (summary.topCategories.length > 0) {
    const top = summary.topCategories[0];
    insights.push({
      id: '2',
      title: `Top: ${top.name}`,
      body: `${top.name} is your biggest expense at $${Number(top.amount).toLocaleString()}. Check if there are ways to optimize.`,
      severity: 'opportunity' as const,
      actionHint: `Review your ${top.name} transactions for savings.`,
    });
  }

  if (summary.upcomingChargesCount > 0) {
    insights.push({
      id: '3',
      title: 'Upcoming Charges',
      body: `You have ${summary.upcomingChargesCount} subscription${summary.upcomingChargesCount > 1 ? 's' : ''} coming up. Review for any you no longer need.`,
      severity: 'info' as const,
      actionHint: 'Visit Subscriptions to review active services.',
    });
  }

  if (insights.length < 3) {
    insights.push({
      id: String(insights.length + 1),
      title: 'Build Your Profile',
      body: 'Add more transactions and set up budgets to get personalized insights tailored to your spending patterns.',
      severity: 'info' as const,
      actionHint: 'Create your first budget in the Budgets tab.',
    });
  }

  return insights;
}
