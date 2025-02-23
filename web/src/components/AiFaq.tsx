"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/TranslationContext';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TranslationKeys } from '@/types/i18n';

const customQuestions = [
  "Was macht EpicWG so besonders?",
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
      setResponse(t('AI_FAQ_ERROR'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="/videos/neural.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto h-full flex flex-col justify-center p-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-12 text-amber-300"
        >
          Frag unsere KI über EpicWG
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
                className="text-amber-200/70"
              >
                {t('AI_FAQ_LOADING')}
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
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1], // Custom easeOutQuart
                    },
                    opacity: {
                      duration: 0.3,
                      delay: 0.35, // Start fading in after height animation is mostly done
                    }
                  }
                }}
                exit={{ 
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: {
                      duration: 0.4,
                      delay: 0.1 // Slight delay to let opacity fade first
                    },
                    opacity: {
                      duration: 0.2
                    }
                  }
                }}
                className="w-full max-w-2xl overflow-hidden"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.3,
                      delay: 0.4 // Start moving up after container is mostly expanded
                    }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-amber-100/90 text-lg leading-relaxed"
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
