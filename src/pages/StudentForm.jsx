import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import ProgressBar from '@/components/form/ProgressBar';
import FormSection from '@/components/form/FormSection';
import SectionBasics from '@/components/form/SectionBasics';
import SectionProduction from '@/components/form/SectionProduction';
import SectionTech from '@/components/form/SectionTech';
import SectionLaptop from '@/components/form/SectionLaptop';
import SectionTools from '@/components/form/SectionTools';
import SectionLearning from '@/components/form/SectionLearning';
import SectionAvailability from '@/components/form/SectionAvailability';
import SectionWork from '@/components/form/SectionWork';
import SectionContact from '@/components/form/SectionContact';
import SectionBonus from '@/components/form/SectionBonus';

const TOTAL_STEPS = 10;

export default function StudentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const createSubmission = useMutation({
    mutationFn: (data) => base44.entities.FormSubmission.create(data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Form submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit form. Please try again.');
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.student_name?.trim() && formData.block_course;
      case 8:
        return formData.parent_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email);
      case 9:
        return formData.confirmation === true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please confirm your understanding before submitting');
      return;
    }
    
    const submissionData = {
      ...formData,
      status: 'submitted'
    };
    
    createSubmission.mutate(submissionData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">You're All Set!</h1>
          <p className="text-slate-500 mb-6">
            Thank you for completing the AVTF Student Data Collection Form. 
            Your responses will help us plan instruction and support you better this semester.
          </p>
          {(formData.youtube_subscribed || formData.instagram_followed) && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
              <p className="text-amber-800 font-medium">
                🎉 PBIS Points Pending: {(formData.youtube_subscribed ? 5 : 0) + (formData.instagram_followed ? 5 : 0)} points
              </p>
              <p className="text-sm text-amber-700 mt-1">Verification will happen in class</p>
            </div>
          )}
          <p className="text-sm text-slate-400">You can close this page now.</p>
        </motion.div>
      </div>
    );
  }

  const sections = [
    <SectionBasics data={formData} onChange={handleChange} />,
    <SectionProduction data={formData} onChange={handleChange} />,
    <SectionTech data={formData} onChange={handleChange} />,
    <SectionLaptop data={formData} onChange={handleChange} />,
    <SectionTools data={formData} onChange={handleChange} />,
    <SectionLearning data={formData} onChange={handleChange} />,
    <SectionAvailability data={formData} onChange={handleChange} />,
    <SectionWork data={formData} onChange={handleChange} />,
    <SectionContact data={formData} onChange={handleChange} />,
    <SectionBonus data={formData} onChange={handleChange} />
  ];

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">AVTF SDC Form</h1>
          <p className="text-sm text-slate-500 mt-1">Student Data Collection</p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

        {/* Form Content */}
        <div className="mt-12 mb-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <FormSection key={currentStep} isActive={true} direction={direction}>
              {sections[currentStep]}
            </FormSection>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="h-12 px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-slate-400">
            {currentStep + 1} of {TOTAL_STEPS}
          </div>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={createSubmission.isPending || !formData.confirmation}
              className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
            >
              {createSubmission.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}