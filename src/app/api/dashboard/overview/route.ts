import { NextRequest, NextResponse } from 'next/server';
import { loadOverviewData } from '@/lib/dashboard-service';
import { apiError, unauthorized, badRequest } from '@/lib/api-errors';
import type { OverviewPeriod } from '@/lib/types';

const VALID_PERIODS: OverviewPeriod[] = ['this-week', 'this-month', 'last-month', 'last-3-months', 'this-year', 'all-time'];

export async function GET(request: NextRequest) {
  try {
    const range = (request.nextUrl.searchParams.get('range') as OverviewPeriod) || 'this-month';

    if (!VALID_PERIODS.includes(range)) {
      return badRequest('Invalid period');
    }

    const data = await loadOverviewData(range);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Overview API error:', error);
    if (error.message === 'Unauthorized') {
      return unauthorized();
    }
    return apiError(error.message || 'Failed to load overview data', { status: 500 });
  }
}
