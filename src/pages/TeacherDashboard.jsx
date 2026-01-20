import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, Download, Users, Smartphone, Laptop, Briefcase, 
  CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, 
  Youtube, Instagram, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TeacherDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => base44.entities.FormSubmission.list('-created_date')
  });

  const updateSubmission = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FormSubmission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    }
  });

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = filterBlock === 'all' || sub.block_course === filterBlock;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesBlock && matchesStatus;
  });

  // Stats
  const totalSubmissions = submissions.length;
  const noPhoneAccess = submissions.filter(s => s.phone_access === 'no_access').length;
  const laptopIssues = submissions.filter(s => 
    s.laptop_condition === 'frequently_freezes' || s.laptop_condition === 'barely_works'
  ).length;
  const hasJobs = submissions.filter(s => s.has_job === true).length;
  const pbisYoutube = submissions.filter(s => s.youtube_subscribed).length;
  const pbisInstagram = submissions.filter(s => s.instagram_followed).length;

  const exportToCSV = () => {
    const headers = [
      'Student Name', 'Block', 'Track Interests', 'Phone Access', 'Phone Type', 
      'Storage', 'Laptop Condition', 'Tools Familiar', 'Learning Preferences',
      'Feedback Preference', 'Film Club Interest', 'Has Job', 'Parent Email', 'Status'
    ];
    
    const rows = filteredSubmissions.map(s => [
      s.student_name,
      s.block_course,
      (s.track_interests || []).join('; '),
      s.phone_access,
      s.phone_type || '',
      s.phone_storage || '',
      s.laptop_condition,
      (s.tools_familiar || []).join('; '),
      (s.learning_preferences || []).join('; '),
      s.feedback_preference,
      s.film_club_interest,
      s.has_job ? 'Yes' : 'No',
      s.parent_email,
      s.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avtf-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-green-100 text-green-700',
    needs_followup: 'bg-amber-100 text-amber-700'
  };

  const phoneAccessLabels = {
    yes_consistent: 'Consistent',
    yes_limited: 'Limited',
    sometimes: 'Sometimes',
    no_access: 'No Access'
  };

  const laptopLabels = {
    runs_smoothly: 'Smooth',
    occasional_issues: 'Occasional Issues',
    slow_usable: 'Slow',
    frequently_freezes: 'Freezes',
    barely_works: 'Needs Support'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
            <p className="text-slate-500">AVTF Student Data Collection Overview</p>
          </div>
          <div className="flex gap-3">
            <ShareFormButton />
            <Button onClick={exportToCSV} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalSubmissions}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Smartphone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{noPhoneAccess}</p>
                  <p className="text-xs text-slate-500">No Phone</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Laptop className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{laptopIssues}</p>
                  <p className="text-xs text-slate-500">Laptop Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{hasJobs}</p>
                  <p className="text-xs text-slate-500">Have Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Youtube className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{pbisYoutube}</p>
                  <p className="text-xs text-slate-500">YT Subs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100">
                  <Instagram className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{pbisInstagram}</p>
                  <p className="text-xs text-slate-500">IG Follows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBlock} onValueChange={setFilterBlock}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="Block 1">Block 1</SelectItem>
                  <SelectItem value="Block 2">Block 2</SelectItem>
                  <SelectItem value="Block 3">Block 3</SelectItem>
                  <SelectItem value="Block 4">Block 4</SelectItem>
                  <SelectItem value="Level I">Level I</SelectItem>
                  <SelectItem value="Level II">Level II</SelectItem>
                  <SelectItem value="Level III">Level III</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="needs_followup">Needs Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No submissions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium">
                        {submission.student_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{submission.student_name}</h3>
                        <p className="text-sm text-slate-500">{submission.block_course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.phone_access === 'no_access' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Smartphone className="w-3 h-3 mr-1" />
                          No Phone
                        </Badge>
                      )}
                      {(submission.laptop_condition === 'frequently_freezes' || submission.laptop_condition === 'barely_works') && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Laptop className="w-3 h-3 mr-1" />
                          Tech Support
                        </Badge>
                      )}
                      <Badge className={statusColors[submission.status] || statusColors.submitted}>
                        {submission.status?.replace('_', ' ')}
                      </Badge>
                      {expandedId === submission.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === submission.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Production & Tools */}
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Production Interests</h4>
                            <div className="flex flex-wrap gap-1">
                              {(submission.track_interests || []).map(track => (
                                <Badge key={track} variant="secondary" className="text-xs">
                                  {track}
                                </Badge>
                              ))}
                            </div>
                            <h4 className="font-medium text-slate-700 mb-2 mt-4">Tools Familiar</h4>
                            <div className="flex flex-wrap gap-1">
                              {(submission.tools_familiar || []).map(tool => (
                                <Badge key={tool} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                            {submission.most_confident_tool && (
                              <p className="text-sm text-slate-500 mt-2">
                                Most confident: <span className="font-medium">{submission.most_confident_tool}</span>
                              </p>
                            )}
                          </div>

                          {/* Tech Access */}
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Tech Access</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Phone:</span>
                                <span className="font-medium">{phoneAccessLabels[submission.phone_access] || '-'}</span>
                              </div>
                              {submission.phone_type && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Type:</span>
                                  <span>{submission.phone_type}</span>
                                </div>
                              )}
                              {submission.phone_storage && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Storage:</span>
                                  <span>{submission.phone_storage}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-500">Laptop:</span>
                                <span className={
                                  submission.laptop_condition === 'barely_works' || submission.laptop_condition === 'frequently_freezes'
                                    ? 'text-red-600 font-medium' : ''
                                }>
                                  {laptopLabels[submission.laptop_condition] || '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Learning & Schedule */}
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Learning Preferences</h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(submission.learning_preferences || []).map(pref => (
                                <Badge key={pref} variant="secondary" className="text-xs">
                                  {pref.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-slate-500 mb-3">
                              Feedback: <span className="font-medium">{submission.feedback_preference?.replace('_', ' ')}</span>
                            </p>
                            <p className="text-sm text-slate-500 mb-1">
                              Film Club: <span className="font-medium">{submission.film_club_interest}</span>
                            </p>
                            {submission.available_days?.length > 0 && (
                              <p className="text-sm text-slate-500">
                                Available: <span className="font-medium">{submission.available_days.join(', ')}</span>
                              </p>
                            )}
                            {submission.has_job && (
                              <p className="text-sm text-amber-600 mt-2">
                                Has job ({submission.job_balance_difficulty} difficulty)
                              </p>
                            )}
                          </div>
                        </div>

                        {/* PBIS & Contact */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500">Parent: {submission.parent_email}</span>
                            {submission.youtube_subscribed && (
                              <Badge className="bg-red-100 text-red-700">
                                <Youtube className="w-3 h-3 mr-1" /> YT +5
                              </Badge>
                            )}
                            {submission.instagram_followed && (
                              <Badge className="bg-pink-100 text-pink-700">
                                <Instagram className="w-3 h-3 mr-1" /> IG +5
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Select
                              value={submission.status}
                              onValueChange={(value) => updateSubmission.mutate({ 
                                id: submission.id, 
                                data: { status: value } 
                              })}
                            >
                              <SelectTrigger className="w-36 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="needs_followup">Needs Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}