import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GAStandards() {
  const [user, setUser] = useState(null);
  const [expandedStandard, setExpandedStandard] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('Level I');

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: standards = [] } = useQuery({
    queryKey: ['gaStandards'],
    queryFn: () => base44.entities.GAStandard.list(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['curriculumModules'],
    queryFn: () => base44.entities.CurriculumModule.list(),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['studentProgress', user?.email],
    queryFn: () => base44.entities.StudentProgress.filter({ student_email: user?.email }),
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const markCompleteMutation = useMutation({
    mutationFn: (data) => base44.entities.StudentProgress.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProgress'] });
      toast.success('Module marked complete!');
    },
  });

  const filteredStandards = standards.filter(s => s.level === selectedLevel);

  const categories = [...new Set(filteredStandards.map(s => s.category))];

  const isModuleComplete = (moduleId) => {
    return progress.some(p => p.module_id === moduleId && p.completed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            GA Standards & Curriculum
          </h1>
          <p className="text-slate-600">Self-guided learning modules mapped to Georgia standards</p>
        </div>

        {/* Level Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {['Level I', 'Level II', 'Level III'].map((level) => (
            <Button
              key={level}
              onClick={() => setSelectedLevel(level)}
              variant={selectedLevel === level ? 'default' : 'outline'}
              className={selectedLevel === level ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {level}
            </Button>
          ))}
        </div>

        {/* Standards by Category */}
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-lg text-indigo-800">{category || 'General'}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {filteredStandards
                  .filter(s => s.category === category)
                  .map((standard) => {
                    const relatedModules = modules.filter(m => m.standard_code === standard.standard_code);
                    const isExpanded = expandedStandard === standard.id;

                    return (
                      <div key={standard.id}>
                        <button
                          onClick={() => setExpandedStandard(isExpanded ? null : standard.id)}
                          className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 text-left">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {standard.standard_code}
                                </Badge>
                                {relatedModules.length > 0 && (
                                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                    {relatedModules.length} modules
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-slate-800">{standard.title}</p>
                              <p className="text-sm text-slate-500">{standard.description}</p>
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-8 mt-2 space-y-2">
                                {relatedModules.length === 0 ? (
                                  <p className="text-sm text-slate-500 p-3">No modules available yet</p>
                                ) : (
                                  relatedModules.map((module) => {
                                    const completed = isModuleComplete(module.id);
                                    return (
                                      <div
                                        key={module.id}
                                        className={`p-4 rounded-lg border ${
                                          completed
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-slate-50 border-slate-200'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <p className="font-medium text-slate-800 mb-1">{module.module_title}</p>
                                            <p className="text-sm text-slate-600">{module.description}</p>
                                          </div>
                                          {completed && (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                          )}
                                        </div>

                                        {module.tasks && module.tasks.length > 0 && (
                                          <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                                            <p className="text-xs font-medium text-slate-600 mb-2">Tasks:</p>
                                            <ul className="text-sm text-slate-700 space-y-1">
                                              {module.tasks.map((task, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                  <span className="text-indigo-600">•</span>
                                                  {task}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        <div className="flex gap-2 mt-3">
                                          {module.video_url && (
                                            <Button size="sm" variant="outline" asChild>
                                              <a href={module.video_url} target="_blank" rel="noopener noreferrer">
                                                <PlayCircle className="w-4 h-4 mr-1" />
                                                Video Lesson
                                              </a>
                                            </Button>
                                          )}
                                          {module.submission_portal_url && (
                                            <Button size="sm" variant="outline" asChild>
                                              <a href={module.submission_portal_url} target="_blank" rel="noopener noreferrer">
                                                <FileText className="w-4 h-4 mr-1" />
                                                Submit Work
                                              </a>
                                            </Button>
                                          )}
                                          {user && !completed && (
                                            <Button
                                              size="sm"
                                              onClick={() => markCompleteMutation.mutate({
                                                student_name: user.full_name,
                                                student_email: user.email,
                                                module_id: module.id,
                                                completed: true,
                                                completion_date: new Date().toISOString()
                                              })}
                                              className="bg-green-600 hover:bg-green-700 ml-auto"
                                            >
                                              <CheckCircle2 className="w-4 h-4 mr-1" />
                                              Mark Complete
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ))}

          {filteredStandards.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No standards available for {selectedLevel} yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}