import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Bell, Save, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    custom_reminder_minutes: 8,
    enable_push_notifications: true,
    enable_sound_alerts: true
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: existingSettings } = useQuery({
    queryKey: ['notification-settings', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const all = await base44.entities.NotificationSettings.filter({ student_email: user.email });
      return all[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({
        custom_reminder_minutes: existingSettings.custom_reminder_minutes || 8,
        enable_push_notifications: existingSettings.enable_push_notifications ?? true,
        enable_sound_alerts: existingSettings.enable_sound_alerts ?? true
      });
    }
  }, [existingSettings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const data = {
        student_name: user.full_name,
        student_email: user.email,
        ...settings
      };

      if (existingSettings) {
        await base44.entities.NotificationSettings.update(existingSettings.id, data);
      } else {
        await base44.entities.NotificationSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Notification settings saved!');
    }
  });

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      toast.success('Notifications already enabled');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      new Notification('AVTF Pass System', {
        body: 'You will receive alerts for your passes',
        icon: '/icon-192.png'
      });
    } else {
      toast.error('Notification permission denied');
      setSettings(prev => ({ ...prev, enable_push_notifications: false }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Please log in to manage notification settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Notification Settings</h1>
          <p className="text-slate-500">Customize your pass alerts and reminders</p>
        </div>

        <div className="space-y-6">
          {/* Custom Reminder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Return Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">
                  Remind me to return after
                  <span className="font-bold text-indigo-600 ml-2">{settings.custom_reminder_minutes} minutes</span>
                </Label>
                <Slider
                  value={[settings.custom_reminder_minutes]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, custom_reminder_minutes: value[0] }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>1 min</span>
                  <span>10 min</span>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                You'll receive a visual alert when your pass reaches this duration
              </p>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="push-notifications">Enable push notifications</Label>
                  <p className="text-sm text-slate-500">Get alerts even when not on the page</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.enable_push_notifications}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, enable_push_notifications: checked }));
                    if (checked) requestNotificationPermission();
                  }}
                />
              </div>
              {Notification.permission !== 'granted' && settings.enable_push_notifications && (
                <Button
                  onClick={requestNotificationPermission}
                  variant="outline"
                  className="w-full"
                >
                  Grant Notification Permission
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Sound Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                Sound Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="sound-alerts">Enable sound for alerts</Label>
                  <p className="text-sm text-slate-500">Play a sound when pass time alerts trigger</p>
                </div>
                <Switch
                  id="sound-alerts"
                  checked={settings.enable_sound_alerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_sound_alerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={() => saveSettings.mutate()}
            disabled={saveSettings.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}