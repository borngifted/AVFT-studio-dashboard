import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { studentName, studentEmail, tone, context } = await req.json();

    // Fetch student data for context
    const passSessions = await base44.entities.PassSession.filter({ student_email: studentEmail }, '-created_date', 10);
    const studentData = await base44.entities.StudentPassData.filter({ student_email: studentEmail });
    const notes = await base44.entities.StudentNote.filter({ student_email: studentEmail }, '-created_date', 5);

    const toneInstructions = {
      formal: 'Use professional, formal language appropriate for official school communication.',
      friendly: 'Use warm, approachable language while maintaining professionalism.',
      concerned: 'Express genuine concern with empathy, while being clear about issues.',
      encouraging: 'Focus on positive aspects and growth potential, be uplifting.'
    };

    const prompt = `You are a teacher drafting a message to a student's parent/guardian.

Student: ${studentName}
Tone: ${tone || 'friendly'} - ${toneInstructions[tone] || toneInstructions.friendly}

Context provided by teacher:
${context || 'General update'}

Student Data:
- Recent pass usage: ${passSessions.length} passes in recent history
- Recent teacher notes: ${notes.map(n => n.content).join('; ') || 'None'}

Generate a professional parent message that:
1. Addresses the parent appropriately
2. Clearly communicates the context/situation
3. Offers collaboration and support
4. Maintains the requested tone
5. Ends with an invitation for discussion
6. Signs off from the teacher

Keep it concise (3-4 paragraphs). Use the teacher's name "${user.full_name}" for the signature.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt
    });

    return Response.json({ message: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});