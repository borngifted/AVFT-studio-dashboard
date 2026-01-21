import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LogOut, LogIn, DoorOpen, AlertCircle, CheckCircle, 
  Award, ShoppingCart, Ticket, TrendingUp, Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PassTimer from '@/components/pass/PassTimer';
import { generateCode } from '@/components/pass/ReturnCodeDisplay';

export default function StudentPass() {
  const [user, setUser] = useState(null);
  const [destination, setDestination] = useState('');
  const [returnCode, setReturnCode] = useState('');
  const [showPurchase, setShowPurchase] = useState(false);

  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Get student pass data
  const { data: passData } = useQuery({
    queryKey: ['passData', user?.email],
    queryFn: async () => {
      const results = await base44.entities.StudentPassData.filter({ student_email: user.email });
      if (results.length > 0) return results[0];
      
      // Create initial record
      const newData = await base44.entities.StudentPassData.create({
        student_name: user.full_name,
        student_email: user.email,
        monthly_pass_allowance: 4,
        passes_used_this_month: 0,
        purchased_passes_this_month: 0,
        pbis_points_balance: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      });
      return newData;
    },
    enabled: !!user
  });

  // Get pre-assigned passes
  const { data: preAssignedPasses = [] } = useQuery({
    queryKey: ['pre-assigned', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return base44.entities.PreAssignedPass.filter({
        student_email: user.email,
        status: 'approved',
        scheduled_date: today
      });
    },
    enabled: !!user
  });

  // Get active pass session
  const { data: activeSessions = [] } = useQuery({
    queryKey: ['activePasses', user?.email],
    queryFn: () => base44.entities.PassSession.filter({ 
      student_email: user.email,
      status: 'OPEN'
    }, '-created_date', 1),
    enabled: !!user,
    refetchInterval: 5000 // Check every 5 seconds
  });

  const activePass = activeSessions[0] || null;

  // Get notification settings
  const { data: notificationSettings } = useQuery({
    queryKey: ['notification-settings', user?.email],
    queryFn: async () => {
      const all = await base44.entities.NotificationSettings.filter({ student_email: user.email });
      return all[0] || null;
    },
    enabled: !!user
  });

  // Start pass mutation
  const startPass = useMutation({
    mutationFn: async ({ dest, preAssignedId }) => {
      const remaining = (passData.monthly_pass_allowance + passData.purchased_passes_this_month) - passData.passes_used_this_month;
      
      if (!preAssignedId && remaining <= 0) {
        throw new Error('No passes remaining');
      }

      const session = await base44.entities.PassSession.create({
        student_name: user.full_name,
        student_email: user.email,
        destination: dest,
        start_time: new Date().toISOString(),
        status: 'OPEN'
      });

      // If using pre-assigned pass, mark it as used
      if (preAssignedId) {
        await base44.entities.PreAssignedPass.update(preAssignedId, {
          status: 'used',
          used_at: new Date().toISOString(),
          pass_session_id: session.id
        });
      } else {
        // Regular pass - increment counter
        await base44.entities.StudentPassData.update(passData.id, {
          passes_used_this_month: passData.passes_used_this_month + 1
        });
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activePasses'] });
      queryClient.invalidateQueries({ queryKey: ['passData'] });
      queryClient.invalidateQueries({ queryKey: ['pre-assigned'] });
      setDestination('');
      toast.success('Pass started! Return within 10 minutes.');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // End pass mutation
  const endPass = useMutation({
    mutationFn: async (code) => {
      const validCode = generateCode();
      const isValid = code === validCode;

      const now = new Date();
      const start = new Date(activePass.start_time);
      const durationMinutes = Math.floor((now - start) / 60000);
      const isOvertime = durationMinutes >= 10;

      await base44.entities.PassSession.update(activePass.id, {
        end_time: now.toISOString(),
        status: isValid ? 'CLOSED' : 'RETURN_UNCONFIRMED',
        duration_minutes: durationMinutes,
        return_code_validated: isValid,
        return_code_entered: code,
        overtime: isOvertime
      });

      return { isValid, isOvertime };
    },
    onSuccess: ({ isValid, isOvertime }) => {
      queryClient.invalidateQueries({ queryKey: ['activePasses'] });
      setReturnCode('');
      
      if (isValid) {
        toast.success(isOvertime ? 'Pass ended (overtime)' : 'Pass ended successfully!');
      } else {
        toast.error('Invalid return code. Please try again or see teacher.');
      }
    }
  });

  // Purchase pass mutation
  const purchasePass = useMutation({
    mutationFn: async () => {
      const cost = 10;
      
      if (passData.pbis_points_balance < cost) {
        throw new Error('Not enough PBIS points');
      }
      
      if (passData.purchased_passes_this_month >= 2) {
        throw new Error('Maximum 2 extra passes per month');
      }

      await base44.entities.StudentPassData.update(passData.id, {
        pbis_points_balance: passData.pbis_points_balance - cost,
        purchased_passes_this_month: passData.purchased_passes_this_month + 1
      });

      await base44.entities.PBISTransaction.create({
        student_name: user.full_name,
        student_email: user.email,
        points_delta: -cost,
        reason: 'pass_purchase',
        description: `Purchased extra pass ${passData.purchased_passes_this_month + 1}/2`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passData'] });
      setShowPurchase(false);
      toast.success('Extra pass purchased!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Please log in to use the digital pass system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!passData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const remaining = (passData.monthly_pass_allowance + passData.purchased_passes_this_month) - passData.passes_used_this_month;
  const canPurchase = passData.purchased_passes_this_month < 2 && passData.pbis_points_balance >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4">
      <div className="max-w-md mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Digital Hall Pass</h1>
            <p className="text-slate-500">AVTF Classroom</p>
          </div>
          <Link to={createPageUrl('NotificationSettings')}>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5 text-slate-500" />
            </Button>
          </Link>
        </div>

        {/* Pre-Assigned Passes */}
        {preAssignedPasses.length > 0 && (
          <Card className="mb-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Pre-Approved Passes Today</span>
              </div>
              <div className="space-y-2">
                {preAssignedPasses.map(pass => (
                  <button
                    key={pass.id}
                    onClick={() => startPass.mutate({ dest: pass.destination, preAssignedId: pass.id })}
                    className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <p className="font-medium">{pass.destination}</p>
                    {pass.scheduled_time && (
                      <p className="text-sm opacity-90">Scheduled: {pass.scheduled_time}</p>
                    )}
                    {pass.reason && (
                      <p className="text-xs opacity-80">{pass.reason}</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pass Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span className="font-medium">Passes Remaining</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <Award className="w-4 h-4" />
                {passData.pbis_points_balance} pts
              </div>
            </div>
            <div className="text-5xl font-bold mb-2">{remaining}</div>
            <div className="text-sm opacity-90">
              of {passData.monthly_pass_allowance + passData.purchased_passes_this_month} this month
              {passData.purchased_passes_this_month > 0 && ` (${passData.purchased_passes_this_month} purchased)`}
            </div>
          </CardContent>
        </Card>

        {/* Active Pass or Start Pass */}
        <AnimatePresence mode="wait">
          {activePass ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DoorOpen className="w-5 h-5 text-indigo-600" />
                    Pass In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1">Destination</p>
                    <p className="text-lg font-semibold text-slate-800">{activePass.destination}</p>
                  </div>

                  <PassTimer 
                    startTime={activePass.start_time}
                    customReminderMinutes={notificationSettings?.custom_reminder_minutes || 8}
                    enableSoundAlerts={notificationSettings?.enable_sound_alerts ?? true}
                    onTimeWarning={() => {
                      const message = `⏰ Time to return to class!`;
                      toast(message, { duration: 5000 });
                      
                      // Push notification if enabled
                      if (notificationSettings?.enable_push_notifications && 'Notification' in window && Notification.permission === 'granted') {
                        new Notification('AVTF Pass Reminder', {
                          body: message,
                          icon: '/icon-192.png',
                          tag: 'pass-reminder'
                        });
                      }
                    }}
                    onOvertime={() => {
                      const message = '⚠️ Please return to class now!';
                      toast.error(message, { duration: 10000 });
                      
                      // Push notification if enabled
                      if (notificationSettings?.enable_push_notifications && 'Notification' in window && Notification.permission === 'granted') {
                        new Notification('AVTF Pass Overtime', {
                          body: message,
                          icon: '/icon-192.png',
                          tag: 'pass-overtime',
                          requireInteraction: true
                        });
                      }
                    }}
                  />

                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-medium">Enter Return Code to End Pass</Label>
                    <Input
                      type="text"
                      maxLength={4}
                      value={returnCode}
                      onChange={(e) => setReturnCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-digit code"
                      className="text-center text-2xl font-mono tracking-wider"
                    />
                    <Button
                      onClick={() => endPass.mutate(returnCode)}
                      disabled={returnCode.length !== 4 || endPass.isPending}
                      className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      End Pass & Return
                    </Button>
                    <p className="text-xs text-center text-slate-500">
                      The return code is displayed on the classroom board
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-indigo-600" />
                    Start a Pass
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {remaining > 0 ? (
                    <>
                      <div className="space-y-2">
                        <Label>Where are you going?</Label>
                        <Select value={destination} onValueChange={setDestination}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Restroom">Restroom</SelectItem>
                            <SelectItem value="Water Fountain">Water Fountain</SelectItem>
                            <SelectItem value="Main Office">Main Office</SelectItem>
                            <SelectItem value="Counselor">Counselor</SelectItem>
                            <SelectItem value="Nurse">Nurse</SelectItem>
                            <SelectItem value="Library">Library</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={() => startPass.mutate({ dest: destination })}
                        disabled={!destination || startPass.isPending}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Start Pass (10 min)
                      </Button>

                      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        <p className="font-medium mb-1">Remember:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>You have 10 minutes</li>
                          <li>Scan QR again and enter return code when back</li>
                          <li>Unused passes earn 5 PBIS points each month!</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-slate-800 mb-2">No Passes Remaining</p>
                      <p className="text-sm text-slate-500 mb-4">
                        You've used all {passData.monthly_pass_allowance + passData.purchased_passes_this_month} passes this month
                      </p>
                      {canPurchase && (
                        <Button
                          variant="outline"
                          onClick={() => setShowPurchase(true)}
                          className="border-indigo-500 text-indigo-600"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase Extra Pass (10 pts)
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PBIS Info */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">PBIS Points Economy</h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Earn 5 points per unused pass each month</li>
                  <li>• Purchase extra passes for 10 points (max 2/month)</li>
                  <li>• Current balance: <span className="font-bold">{passData.pbis_points_balance} points</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Dialog */}
        {showPurchase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full">
              <CardHeader>
                <CardTitle>Purchase Extra Pass</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Cost</p>
                  <p className="text-3xl font-bold text-slate-800">10 Points</p>
                  <p className="text-xs text-slate-500 mt-2">
                    You have {passData.pbis_points_balance} points
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  This will add 1 extra pass for this month. You can purchase up to 2 extra passes per month.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPurchase(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => purchasePass.mutate()}
                    disabled={purchasePass.isPending}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}