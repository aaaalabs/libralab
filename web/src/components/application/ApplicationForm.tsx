'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Globe, Code } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/context/TranslationContext';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationForm({ isOpen, onClose }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslation();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expertise: [] as string[],
    experience: '',
    month: '',
    stayDuration: '',
    funFact: '',
    projectIdea: ''
  });
  const [activeField, setActiveField] = useState<string | null>(null);

  const ExpandingTextarea = ({ 
    value, 
    onChange, 
    placeholder, 
    fieldName 
  }: { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
    placeholder: string;
    fieldName: string;
  }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div
        className={`relative transition-all duration-300 ease-in-out ${
          isFocused || value ? 'h-32' : 'h-[42px]'
        }`}
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          className="w-full h-full p-2 border rounded-lg bg-[#2E4555] border-white/20 text-white placeholder-white/50 resize-none transition-colors hover:bg-[#2E4555]/90 focus:border-[#D09467] focus:ring-1 focus:ring-[#D09467]"
          value={value}
          onChange={onChange}
          onFocus={() => {
            setIsFocused(true);
            setActiveField(fieldName);
          }}
          onBlur={() => {
            setIsFocused(false);
            if (!value) {
              setActiveField(null);
            }
          }}
        />
      </div>
    );
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return formData.name.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.month !== '' &&
               formData.stayDuration !== '';
      case 1:
        return formData.experience.trim() !== '' && 
               formData.expertise.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Show initial loading state
      setIsSubmitted(true);
      setResponseMessage('🤖 AI is crafting a personalized response for you...');

      const response = await fetch(process.env.NEXT_PUBLIC_APPLICATION_WEBHOOK!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'application_submission',
          timestamp: new Date().toISOString(),
          authorization: process.env.NEXT_PUBLIC_WEBHOOK_TOKEN,
          data: {
            name: formData.name,
            email: formData.email,
            expertise: formData.expertise,
            experience: formData.experience,
            month: formData.month,
            stayDuration: formData.stayDuration,
            funFact: formData.funFact || null,
            projectIdea: formData.projectIdea || null,
            language: currentLanguage,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse response and show personalized message
      if (response.ok) {
        const data = await response.json();
        setResponseMessage(data.thanks);
      } else {
        console.error('Webhook response not OK:', await response.text());
        throw new Error('Failed to submit application');
      }
    } catch (err: unknown) {
      console.error('Error submitting form:', err);
      
      // Only show error to user if it's not a timeout
      if (err instanceof Error && err.name !== 'AbortError') {
        setIsSubmitted(false);
        toast({
          title: "Error submitting application",
          description: "Please try again later.",
          variant: "destructive",
        });
      } else if (err instanceof Error && err.name === 'AbortError') {
        // If it's a timeout, show a generic success message
        setResponseMessage("Thank you for your application! We'll review it and get back to you soon. 🙌");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const expertiseOptions = [
    'PyTorch', 'TensorFlow', 'LangChain', 'ChatGPT', 'Stable Diffusion', 'Midjourney',
    'AutoML', 'Computer Vision', 'NLP', 'LLM Prompting', 'AI Strategy', 'Machine Learning',
    'DALL-E', 'RunwayML', 'AI Ethics', 'No-Code AI', 'RAG Systems', 'AI UX Design',
    'AI Product', 'Deep Learning', 'FastAI', 'Video AI', 'AI Research', 'Neural Networks'
  ];

  const row1 = expertiseOptions.slice(0, expertiseOptions.length / 2);
  const row2 = expertiseOptions.slice(expertiseOptions.length / 2);

  const steps = [
    {
      title: "👋 Let's Connect!",
      description: "What is your name and when could you check in?",
      fields: (
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4 relative">
            <motion.div
              className="col-span-12 md:col-span-12"
              animate={{ 
                gridColumn: formData.name.length > 0 ? 'span 6' : 'span 12'
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </motion.div>
            <motion.div
              className="absolute right-0 top-0 w-[calc(50%-0.5rem)]"
              initial={{ opacity: 0, scale: 0.8, height: 0 }}
              animate={{ 
                opacity: formData.name.length > 0 ? 1 : 0,
                scale: formData.name.length > 0 ? 1 : 0.8,
                height: formData.name.length > 0 ? 'auto' : 0,
                pointerEvents: formData.name.length > 0 ? 'auto' : 'none'
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                transformOrigin: 'center left'
              }}
            >
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={formData.name.length === 0}
              />
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              {['March', 'April', 'May', 'Later'].map((month) => (
                <motion.button
                  key={month}
                  className={`flex-1 p-2 rounded-lg transition-colors ${
                    formData.month === month
                      ? 'bg-[#D09467] text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({...formData, month: month})}
                >
                  {month}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {formData.month && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <select
                    className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white"
                    value={formData.stayDuration}
                    onChange={(e) => setFormData({...formData, stayDuration: e.target.value})}
                  >
                    <option value="" className="text-gray-700">How long would you like to stay?</option>
                    <option value="1 month" className="text-gray-700">1 month</option>
                    <option value="2 months" className="text-gray-700">2 months</option>
                    <option value="3 months" className="text-gray-700">3 months</option>
                    <option value="4+ months" className="text-gray-700">4+ months</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )
    },
    {
      title: "🤖 AI Experience",
      description: "Share your journey with AI",
      fields: (
        <div className="space-y-6">
          <textarea
            placeholder="Tell us about your experience with AI (projects, interests, goals)"
            className="w-full p-2 border rounded-lg h-32 bg-white/10 border-white/20 text-white placeholder-white/50"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
          />
          
          <div className="space-y-2 overflow-hidden">
            <label className="text-sm text-gray-400">Select your AI skills and interests:</label>
            {[row1, row2].map((row, idx) => (
              <div key={idx} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#2E4555] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#2E4555] to-transparent z-10" />
                <motion.div 
                  className="flex gap-2 py-1"
                  animate={{
                    x: [0, -1000],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    delay: idx * 2
                  }}
                >
                  {/* Double the items for seamless loop */}
                  {[...row, ...row].map((tech, techIdx) => (
                    <motion.button
                      key={`${tech}-${techIdx}`}
                      className={`shrink-0 px-4 py-2 rounded-full transition-colors ${
                        formData.expertise.includes(tech)
                          ? 'bg-[#D09467] text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newExpertise = formData.expertise.includes(tech)
                          ? formData.expertise.filter(t => t !== tech)
                          : [...formData.expertise, tech];
                        setFormData({...formData, expertise: newExpertise});
                      }}
                    >
                      {tech}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "🎯 Fun Part",
      description: "Optional: Tell us something interesting about you",
      fields: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Share a fun fact about yourself (optional)"
            className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50"
            value={formData.funFact}
            onChange={(e) => setFormData({...formData, funFact: e.target.value})}
          />
          <input
            type="text"
            placeholder="Got a cool project idea? Tell us about it! (optional)"
            className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50"
            value={formData.projectIdea}
            onChange={(e) => setFormData({...formData, projectIdea: e.target.value})}
          />
        </div>
      )
    }
  ];

  const Features = () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="flex flex-col items-center text-center p-4">
        <Bot className="w-8 h-8 mb-2 text-[#D09467]" />
        <h3 className="font-medium text-white">AI Focus</h3>
      </div>
      <div className="flex flex-col items-center text-center p-4">
        <Globe className="w-8 h-8 mb-2 text-[#D09467]" />
        <h3 className="font-medium text-white">Global Community</h3>
      </div>
      <div className="flex flex-col items-center text-center p-4">
        <Code className="w-8 h-8 mb-2 text-[#D09467]" />
        <h3 className="font-medium text-white">Innovation Hub</h3>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="w-full max-w-2xl mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <IconX size={24} />
        </button>

        <div className="bg-[#2E4555] rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
          <h1 className="text-3xl font-bold mb-2 text-white">Join LIBRAlab AI CoLiving</h1>
          <p className="text-gray-300 mb-6">Where AI innovators shape tomorrow's living</p>
          
          <Features />

          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 ${
                    index <= step ? 'bg-[#D09467]' : 'bg-gray-700'
                  } ${index !== steps.length - 1 ? 'mr-2' : ''}`}
                />
              ))}
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#2E4555]/50 rounded-xl p-6"
          >
            {isSubmitted ? (
              <div className="text-center py-8">
                <h2 className="text-xl font-bold mb-4 text-white">🎉 Application Submitted!</h2>
                <p className="text-gray-300 mb-6 whitespace-pre-line">
                  {responseMessage}
                </p>
                {isSubmitting && (
                  <div className="flex items-center justify-center gap-2 text-[#D09467] mb-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#D09467] border-t-transparent" />
                    Waiting for AI response...
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#D09467] text-white rounded-lg hover:bg-[#D09467]/90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1 text-white">{steps[step].title}</h2>
                <p className="text-gray-300 mb-4">{steps[step].description}</p>
                
                {steps[step].fields}

                <div className="flex justify-between mt-6">
                  {step > 0 && !isSubmitting && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 text-[#D09467] border border-[#D09467] rounded-lg hover:bg-[#D09467] hover:text-white transition-colors"
                    >
                      Back
                    </button>
                  )}
                  
                  {isSubmitting ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-[#D09467] ml-auto"
                    >
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#D09467] border-t-transparent" />
                      Processing...
                    </motion.div>
                  ) : (
                    <button
                      onClick={(e) => {
                        if (!validateStep(step)) {
                          toast({
                            title: "Required Fields",
                            description: "Please fill in all required fields.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (step < steps.length - 1) {
                          setStep(step + 1);
                        } else {
                          handleSubmit(e);
                        }
                      }}
                      className="px-4 py-2 bg-[#D09467] text-white rounded-lg ml-auto hover:bg-[#D09467]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {step === steps.length - 1 ? 'Submit' : 'Next'}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>

          <Alert className="mt-8 bg-white/5 border-[#2E4555]/20">
            <AlertDescription className="text-gray-300">
              After submission, we'll review your application and schedule a discovery call to learn more about you and answer any questions you might have about LIBRAlab.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Dialog>
  );
}
