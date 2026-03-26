import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find scheduled messages that are due
    const now = new Date();
    const scheduledMessages = await base44.asServiceRole.entities.ScheduledMessage.filter({
      status: 'scheduled'
    });

    const messagesToSend = scheduledMessages.filter(msg => {
      const scheduledDate = new Date(msg.scheduled_date);
      return scheduledDate <= now;
    });

    const results = [];

    for (const msg of messagesToSend) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: msg.parent_email,
          subject: msg.subject,
          body: msg.message_content
        });

        await base44.asServiceRole.entities.ScheduledMessage.update(msg.id, {
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        results.push({ id: msg.id, status: 'sent' });
      } catch (error) {
        results.push({ id: msg.id, status: 'failed', error: error.message });
      }
    }

    return Response.json({ 
      processed: messagesToSend.length,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});