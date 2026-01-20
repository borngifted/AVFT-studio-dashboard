import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

export default function PassTimer({ startTime, customReminderMinutes = 8, enableSoundAlerts = true, onTimeWarning, onOvertime }) {
  const [elapsed, setElapsed] = useState(0);
  const [warned, setWarned] = useState(false);
  const [overtime, setOvertime] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const elapsedSeconds = Math.floor((now - start) / 1000);
      setElapsed(elapsedSeconds);

      // Custom reminder warning
      const reminderSeconds = customReminderMinutes * 60;
      if (elapsedSeconds >= reminderSeconds && !warned) {
        setWarned(true);
        onTimeWarning?.();
        
        // Sound alert
        if (enableSoundAlerts) {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZQQ8PVqvn77BcGAg+ltryxHMnBSl+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXxxn0pBSp6y/HajDwJF2G56+mjTxELSKDf8bhoHgU0iNPxxoE0CAVquuvnpl8RCUCa3vLCciYELIHO8diJOAgZaLvt559NEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZQQ8PVqvn77BcGAg+ltryxHMnBSl+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXxxn0pBSp6y/HajDwJF2G56+mjTxELSKDf8bhoHgU0iNPxxoE0CAVquuvnpl8RCUCa3vLCciYELIHO8diJOAgZaLvt559NEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZQQ8PVqvn77BcGAg+ltryxHMnBSl+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXxxn0pBSp6y/HajDwJF2G56+mjTxELSKDf8bhoHgU0iNPxxoE0CAVquuvnpl8RCUCa3vLCciYELIHO8diJOAgZaLvt559NEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZQQ8PVqvn77BcGAg+ltryxHMnBSl+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXxxn0pBSp6y/HajDwJF2G56+mjTxELSKDf8bhoHgU0iNPxxoE0CAVquuvnpl8RCUCa3vLCciYELIHO8diJOAgZaLvt559NEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N2RQAo=');
          audio.play().catch(() => {});
        }
      }

      // Overtime at 10 minutes
      if (elapsedSeconds >= 600 && !overtime) {
        setOvertime(true);
        onOvertime?.();
        
        // Sound alert for overtime
        if (enableSoundAlerts) {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZQQ8PVqvn77BcGAg+ltryxHMnBSl+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXxxn0pBSp6y/HajDwJF2G56+mjTxELSKDf8bhoHgU0iNPxxoE0CAVquuvnpl8RCUCa3vLCciYELIHO8diJOAgZaLvt559NEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZQQ8PVqvn77BcGAg+ltryxHMnBSl+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXxxn0pBSp6y/HajDwJF2G56+mjTxELSKDf8bhoHgU0iNPxxoE0CAVquuvnpl8RCUCa3vLCciYELIHO8diJOAgZaLvt559NEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N2RQAo=');
          audio.play().catch(() => {});
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, customReminderMinutes, enableSoundAlerts, warned, overtime, onTimeWarning, onOvertime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const remaining = Math.max(0, 600 - elapsed);
  const remainingMinutes = Math.floor(remaining / 60);
  const remainingSeconds = remaining % 60;

  const isWarning = elapsed >= 480 && elapsed < 600;
  const isOvertime = elapsed >= 600;

  return (
    <motion.div
      animate={{
        scale: isWarning || isOvertime ? [1, 1.05, 1] : 1,
      }}
      transition={{
        repeat: isWarning || isOvertime ? Infinity : 0,
        duration: 1,
      }}
      className={`text-center p-6 rounded-2xl ${
        isOvertime
          ? 'bg-red-50 border-2 border-red-500'
          : isWarning
          ? 'bg-amber-50 border-2 border-amber-500'
          : 'bg-slate-50 border-2 border-slate-200'
      }`}
    >
      {isOvertime ? (
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-600">OVERTIME</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className={`w-5 h-5 ${isWarning ? 'text-amber-600' : 'text-slate-500'}`} />
          <span className={`text-sm font-medium ${isWarning ? 'text-amber-600' : 'text-slate-600'}`}>
            {isWarning ? 'Return Soon!' : 'Time Remaining'}
          </span>
        </div>
      )}

      {isOvertime ? (
        <div className="text-4xl font-bold text-red-600 font-mono">
          +{minutes - 10}:{String(seconds).padStart(2, '0')}
        </div>
      ) : (
        <div className={`text-5xl font-bold font-mono ${
          isWarning ? 'text-amber-600' : 'text-slate-800'
        }`}>
          {remainingMinutes}:{String(remainingSeconds).padStart(2, '0')}
        </div>
      )}

      <div className="mt-4 text-sm text-slate-500">
        Elapsed: {minutes}:{String(seconds).padStart(2, '0')}
      </div>
    </motion.div>
  );
}