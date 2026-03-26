import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    const correctCode = Deno.env.get('TEACHER_CODE');

    if (!correctCode) {
      return Response.json({ error: 'Teacher code not configured' }, { status: 500 });
    }

    if (code !== correctCode) {
      return Response.json({ error: 'Invalid teacher code' }, { status: 400 });
    }

    // Update user role to admin
    await base44.asServiceRole.entities.User.update(user.id, { role: 'admin' });

    return Response.json({ success: true, message: 'Teacher access granted' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});