import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate a 4-digit code based on current time window
const generateCode = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const twoMinuteWindow = Math.floor(minutes / 2); // Changes every 2 minutes
  
  // Create a deterministic but seemingly random 4-digit code
  const seed = twoMinuteWindow + (now.getHours() * 30);
  const code = (1000 + (seed * 1234) % 9000).toString();
  
  return code;
};

export default function ReturnCodeDisplay({ className }) {
  const [code, setCode] = useState(generateCode());
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const updateCode = () => {
      setCode(generateCode());
      setTimeLeft(120);
    };

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          updateCode();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progress = (timeLeft / 120) * 100;

  return (
    <Card className={`p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">Return Code</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3 h-3" />
          {timeLeft}s
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={code}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="text-5xl font-bold text-indigo-600 tracking-wider font-mono">
            {code}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-xs text-slate-500 text-center mt-3">
        Students must enter this code to end their pass
      </p>
    </Card>
  );
}

// Export the code generator for validation
export { generateCode };