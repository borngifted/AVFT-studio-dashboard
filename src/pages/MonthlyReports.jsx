import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, Clock, AlertTriangle, Award, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MonthlyReports() {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['monthly-reports'],
    queryFn: () => base44.entities.MonthlyReport.list('-created_date')
  });

  const generateReport = useMutation({
    mutationFn: () => base44.functions.invoke('generateMonthlyReport'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-reports'] });
      toast.success('Monthly report generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate report');
    }
  });

  const exportReport = (report) => {
    const content = `
AVTF Pass System - Monthly Report
Month: ${report.month}
Generated: ${format(new Date(report.created_date), 'PPP')}

═══════════════════════════════════════════════════════
SUMMARY METRICS
═══════════════════════════════════════════════════════
Total Passes Used: ${report.total_passes}
Average Duration: ${report.average_duration_minutes} minutes
Overtime Instances: ${report.overtime_count}
Unconfirmed Returns: ${report.unconfirmed_returns}

═══════════════════════════════════════════════════════
PBIS IMPACT
═══════════════════════════════════════════════════════
Points Awarded: ${report.pbis_points_awarded}
Passes Purchased: ${report.passes_purchased}

═══════════════════════════════════════════════════════
DESTINATION BREAKDOWN
═══════════════════════════════════════════════════════
${Object.entries(report.destination_breakdown || {})
  .map(([dest, count]) => `${dest}: ${count}`)
  .join('\n')}

═══════════════════════════════════════════════════════
TOP PASS USERS
═══════════════════════════════════════════════════════
${(report.top_users || [])
  .map((user, i) => `${i + 1}. ${user.name}: ${user.count} passes`)
  .join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AVTF-Report-${report.month}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Monthly Reports</h1>
            <p className="text-slate-500">Automated pass usage summaries</p>
          </div>
          <Button
            onClick={() => generateReport.mutate()}
            disabled={generateReport.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            {generateReport.isPending ? 'Generating...' : 'Generate Latest Report'}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No reports generated yet</p>
              <Button
                onClick={() => generateReport.mutate()}
                variant="outline"
                className="mt-4"
              >
                Generate First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      {format(new Date(report.month + '-01'), 'MMMM yyyy')}
                    </CardTitle>
                    <Button
                      onClick={() => exportReport(report)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                    Generated {format(new Date(report.created_date), 'PPP')}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{report.total_passes}</p>
                        <p className="text-xs text-slate-500">Total Passes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">
                          {report.average_duration_minutes.toFixed(1)}m
                        </p>
                        <p className="text-xs text-slate-500">Avg Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{report.overtime_count}</p>
                        <p className="text-xs text-slate-500">Overtime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{report.pbis_points_awarded}</p>
                        <p className="text-xs text-slate-500">PBIS Points</p>
                      </div>
                    </div>
                  </div>

                  {/* Destination Breakdown */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Destinations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(report.destination_breakdown || {}).map(([dest, count]) => (
                        <Badge key={dest} variant="secondary">
                          {dest}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Top Users */}
                  {report.top_users?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Top Pass Users</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {report.top_users.slice(0, 5).map((user, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm text-slate-700">{user.name}</span>
                            <Badge variant="outline">{user.count} passes</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}