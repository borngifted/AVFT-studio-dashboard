import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all parent preferences
    const preferences = await base44.asServiceRole.entities.ParentContactPreference.list();
    const today = new Date().toISOString().split('T')[0];

    // Check for absences
    const attendance = await base44.asServiceRole.entities.DailyAttendance.filter({
      check_in_date: today
    });

    const students = await base44.asServiceRole.entities.StudentPassData.list();
    const notifications = [];

    for (const pref of preferences) {
      const studentAttendance = attendance.find(a => a.student_email === pref.student_email);
      
      // Check absence trigger
      if (pref.notify_on_absence && !studentAttendance) {
        notifications.push({
          to: pref.parent_email,
          subject: `Absence Alert: ${pref.student_name}`,
          body: `Hello,\n\nThis is an automated notification that ${pref.student_name} was marked absent today (${today}).\n\nIf you have any questions, please contact the teacher.\n\nBest regards,\nTeacher's Pet Attendance System`
        });
      }

      // Note: Other triggers (referral, failing) would check additional entities
      // Those can be implemented when you have Grade/Referral entities
    }

    // Send notifications
    for (const notification of notifications) {
      await base44.asServiceRole.integrations.Core.SendEmail(notification);
    }

    return Response.json({
      checked: preferences.length,
      notifications_sent: notifications.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});