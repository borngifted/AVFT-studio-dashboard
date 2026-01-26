import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { rubric, studentWork, subject, assignmentType } = await req.json();

    const prompt = `You are an experienced teacher providing feedback on student work.

Subject: ${subject || 'General'}
Assignment Type: ${assignmentType || 'Assignment'}

Grading Rubric:
${rubric}

Student Work Description:
${studentWork}

Generate personalized, constructive feedback that:
1. Highlights specific strengths
2. Identifies areas for improvement with actionable suggestions
3. Is encouraging and supportive
4. References the rubric criteria
5. Is appropriate for the subject and assignment type

Keep the feedback concise (2-3 paragraphs).`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt
    });

    return Response.json({ feedback: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});