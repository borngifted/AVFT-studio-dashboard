import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Youtube, Instagram, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SectionBonus({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">PBIS Bonus Points!</h2>
        <p className="text-slate-500 mt-2">Earn up to 10 PBIS points</p>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
            ${data.youtube_subscribed 
              ? 'border-red-500 bg-red-50/50' 
              : 'border-slate-200 hover:border-slate-300'}`}
          onClick={() => onChange('youtube_subscribed', !data.youtube_subscribed)}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
              <Youtube className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Subscribe to Eagle TV on YouTube</h3>
              <p className="text-sm text-slate-500 mt-1">Earn <span className="font-bold text-amber-600">+5 PBIS points</span></p>
            </div>
            <Checkbox 
              checked={data.youtube_subscribed || false}
              className="w-6 h-6"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
            ${data.instagram_followed 
              ? 'border-pink-500 bg-pink-50/50' 
              : 'border-slate-200 hover:border-slate-300'}`}
          onClick={() => onChange('instagram_followed', !data.instagram_followed)}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
              <Instagram className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Follow @eagletv.sc on Instagram</h3>
              <p className="text-sm text-slate-500 mt-1">Earn <span className="font-bold text-amber-600">+5 PBIS points</span></p>
            </div>
            <Checkbox 
              checked={data.instagram_followed || false}
              className="w-6 h-6"
            />
          </div>
        </motion.div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mt-6">
          <p className="text-sm text-amber-800">
            ℹ️ Verification will be handled separately in class. Make sure you've actually subscribed/followed before checking these boxes!
          </p>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <Label className="text-sm font-medium text-slate-700 mb-4 block">
            Final Confirmation <span className="text-red-500">*</span>
          </Label>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
              ${data.confirmation 
                ? 'border-green-500 bg-green-50/50' 
                : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => onChange('confirmation', !data.confirmation)}
          >
            <div className="flex items-start gap-4">
              <Checkbox 
                checked={data.confirmation || false}
                className="w-6 h-6 mt-0.5"
              />
              <div>
                <p className="text-slate-700">
                  I understand this information is used to support class operations, production planning, and my success in AVTF.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {data.confirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-100 text-green-700"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Ready to submit!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}