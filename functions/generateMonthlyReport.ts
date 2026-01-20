import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { startOfMonth, endOfMonth, format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get last month's date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStart = startOfMonth(lastMonth);
    const monthEnd = endOfMonth(lastMonth);
    const monthKey = format(lastMonth, 'yyyy-MM');

    // Fetch all pass sessions from last month
    const allSessions = await base44.asServiceRole.entities.PassSession.list('-created_date', 10000);
    const sessions = allSessions.filter(s => {
      if (!s.start_time) return false;
      const date = new Date(s.start_time);
      return date >= monthStart && date <= monthEnd;
    });

    // Fetch student data for PBIS tracking
    const students = await base44.asServiceRole.entities.StudentPassData.list();

    // Calculate metrics
    const totalPasses = sessions.length;
    const avgDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length
      : 0;
    const overtimeCount = sessions.filter(s => s.overtime).length;
    const unconfirmedReturns = sessions.filter(s => s.status === 'RETURN_UNCONFIRMED').length;

    // Destination breakdown
    const destinationBreakdown = {};
    sessions.forEach(s => {
      destinationBreakdown[s.destination] = (destinationBreakdown[s.destination] || 0) + 1;
    });

    // PBIS metrics
    const pbisPointsAwarded = students.reduce((sum, s) => {
      const unusedPasses = s.unused_passes_last_month || 0;
      return sum + (unusedPasses * 5); // 5 points per unused pass
    }, 0);
    const passesPurchased = students.reduce((sum, s) => sum + (s.purchased_passes_this_month || 0), 0);

    // Top users
    const userPassCounts = {};
    sessions.forEach(s => {
      userPassCounts[s.student_name] = (userPassCounts[s.student_name] || 0) + 1;
    });
    const topUsers = Object.entries(userPassCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Create report
    const report = {
      month: monthKey,
      total_passes: totalPasses,
      average_duration_minutes: parseFloat(avgDuration.toFixed(2)),
      overtime_count: overtimeCount,
      unconfirmed_returns: unconfirmedReturns,
      destination_breakdown: destinationBreakdown,
      pbis_points_awarded: pbisPointsAwarded,
      passes_purchased: passesPurchased,
      top_users: topUsers
    };

    // Check if report already exists
    const existing = await base44.asServiceRole.entities.MonthlyReport.filter({ month: monthKey });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.MonthlyReport.update(existing[0].id, report);
    } else {
      await base44.asServiceRole.entities.MonthlyReport.create(report);
    }

    return Response.json({ 
      success: true, 
      message: `Monthly report generated for ${monthKey}`,
      report 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});