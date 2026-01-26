import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Save, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function GradeFeedbackHelper() {
  const [rubric, setRubric] = useState('');
  const [studentWork, setStudentWork] = useState('');
  const [subject, setSubject] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [generatedFeedback, setGeneratedFeedback] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Template management
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ template_name: '', feedback_text: '', category: 'positive', subject: '', tags: [] });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['feedbackTemplates'],
    queryFn: () => base44.entities.FeedbackTemplate.list('-created_date'),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.FeedbackTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackTemplates'] });
      toast.success('Template saved');
      setNewTemplate({ template_name: '', feedback_text: '', category: 'positive', subject: '', tags: [] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.FeedbackTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackTemplates'] });
      toast.success('Template deleted');
    },
  });

  const handleGenerate = async () => {
    if (!rubric || !studentWork) {
      toast.error('Please provide both rubric and student work description');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateFeedback', {
        rubric,
        studentWork,
        subject,
        assignmentType
      });
      setGeneratedFeedback(response.data.feedback);
    } catch (error) {
      toast.error('Failed to generate feedback');
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedFeedback);
    setCopied(true);
    toast.success('Feedback copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsTemplate = () => {
    setNewTemplate({ ...newTemplate, feedback_text: generatedFeedback });
    setShowTemplates(true);
  };

  const categoryColors = {
    positive: 'bg-green-100 text-green-700',
    constructive: 'bg-blue-100 text-blue-700',
    needs_improvement: 'bg-yellow-100 text-yellow-700',
    exemplary: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Feedback Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Subject (e.g., Math, English)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Input
              placeholder="Assignment Type (e.g., Essay, Quiz)"
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
            />
          </div>

          <Textarea
            placeholder="Paste grading rubric or criteria..."
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
            className="h-24"
          />

          <Textarea
            placeholder="Describe the student's work or common errors..."
            value={studentWork}
            onChange={(e) => setStudentWork(e.target.value)}
            className="h-24"
          />

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Feedback'}
          </Button>

          {generatedFeedback && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{generatedFeedback}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" className="flex-1">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={handleSaveAsTemplate} variant="outline" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feedback Templates</CardTitle>
            <Button
              onClick={() => setShowTemplates(!showTemplates)}
              variant="outline"
              size="sm"
            >
              {showTemplates ? 'Hide' : 'Show'} Templates
            </Button>
          </div>
        </CardHeader>
        {showTemplates && (
          <CardContent className="space-y-4">
            {/* Create New Template */}
            <div className="p-4 bg-indigo-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-800">Create New Template</p>
              <Input
                placeholder="Template name"
                value={newTemplate.template_name}
                onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
              />
              <Input
                placeholder="Subject (optional)"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
              <Select
                value={newTemplate.category}
                onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="constructive">Constructive</SelectItem>
                  <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                  <SelectItem value="exemplary">Exemplary</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Template feedback text..."
                value={newTemplate.feedback_text}
                onChange={(e) => setNewTemplate({ ...newTemplate, feedback_text: e.target.value })}
                className="h-24"
              />
              <Button
                onClick={() => createTemplateMutation.mutate(newTemplate)}
                disabled={!newTemplate.template_name || !newTemplate.feedback_text}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>

            {/* Templates List */}
            <div className="space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-800">{template.template_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[template.category]}`}>
                          {template.category.replace('_', ' ')}
                        </span>
                      </div>
                      {template.subject && (
                        <p className="text-xs text-slate-500">Subject: {template.subject}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{template.feedback_text}</p>
                  <Button
                    onClick={() => {
                      setGeneratedFeedback(template.feedback_text);
                      toast.success('Template loaded');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Use Template
                  </Button>
                </div>
              ))}
              {templates.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No templates yet. Create one above!</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}