"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/TranslationContext';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TranslationKeys } from '@/types/i18n';

const customQuestions = [
  "Was macht LibraCoLiving so besonders?",
  "Wie funktioniert das AI-Shift Community Konzept?",
  "Welche Vorteile bietet die Lage in Innsbruck?",
  "Wie sieht der Workspace-Setup aus?",
  "Gibt es spezielle Angebote für Tech-Startups?",
  "Welche AI-Tools und Ressourcen sind verfügbar?",
  "Wie läuft der Bewerbungsprozess ab?",
  "Was sind die Kosten für verschiedene Membership-Optionen?"
];

export function AiFaq() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleCustomQuestion = async (q: string) => {
    // If the question is empty, use the current placeholder
    const questionToAsk = q.trim() || question;
    if (!questionToAsk) {
      console.log('No question to ask');
      return;
    }
    
    setIsLoading(true);
    setQuestion(questionToAsk);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_AI_FAQ_WEBHOOK;
      console.log('Config:', {
        webhookUrl,
        question: questionToAsk,
        env: process.env.NODE_ENV
      });
      
      if (!webhookUrl) {
        console.error('Missing NEXT_PUBLIC_AI_FAQ_WEBHOOK environment variable');
        throw new Error('Webhook URL is not configured');
      }

      const payload = { 
        question: questionToAsk,
        language: 'de'
      };
      console.log('Sending payload:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.answer) {
        throw new Error('No answer in response');
      }
      
      setResponse(data.answer);
    } catch (error) {
      console.error('Error details:', error);
      setResponse(t('ai_faq_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover opacity-20"
        >
          <source src="/videos/neural.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex flex-col justify-center px-4 py-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-[#D09467]"
        >
          Frag unsere KI über LibraLab
        </motion.h2>

        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Custom Question Input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <PlaceholdersAndVanishInput
              placeholders={customQuestions}
              onChange={(e) => {
                setQuestion(e.target.value);
              }}
              onSubmit={(e) => {
                e.preventDefault();
                const currentValue = e.currentTarget.querySelector('input')?.value || '';
                handleCustomQuestion(currentValue);
              }}
            />
          </motion.div>

          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[#979C94] text-sm sm:text-base"
              >
                {t('ai_faq_loading')}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response */}
          <AnimatePresence mode="wait">
            {response && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: {
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: {
                      duration: 0.25,
                      delay: 0.3,
                    }
                  }
                }}
                exit={{ 
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: {
                      duration: 0.3,
                      delay: 0.1
                    },
                    opacity: {
                      duration: 0.15
                    }
                  }
                }}
                className="w-full max-w-2xl overflow-hidden bg-[#2E4555] bg-opacity-80 rounded-lg shadow-lg"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.25,
                      delay: 0.35
                    }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-[#EBDBC3] text-sm sm:text-base leading-relaxed p-4 sm:p-6"
                >
                  {response}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
