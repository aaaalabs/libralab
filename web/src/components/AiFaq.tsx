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

export function AiFaq({ onFocusChange }: { onFocusChange?: (focused: boolean) => void }) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleFocusChange = (focused: boolean) => {
    setIsFocused(focused);
    // Only clear response and allow shrinking if we're unfocusing and there's no response
    if (!focused && !response) {
      setResponse('');
    }
    onFocusChange?.(focused || !!response); // Keep expanded if there's a response
  };

  const handleCustomQuestion = async (q: string) => {
    // If the question is empty, use the current placeholder
    const questionToAsk = q.trim() || question;
    if (!questionToAsk) {
      console.log('No question to ask');
      return;
    }
    
    setIsLoading(true);

    try {
      // Get webhook URL and ensure it's properly formatted
      const webhookUrl = process.env.NEXT_PUBLIC_AI_FAQ_WEBHOOK?.split('NEXT_PUBLIC_')[0].trim();
      
      console.log('Config:', {
        webhookUrl,
        question: questionToAsk,
        env: process.env.NODE_ENV
      });
      
      if (!webhookUrl?.startsWith('https://hook.eu1.make.com/')) {
        console.error('Invalid NEXT_PUBLIC_AI_FAQ_WEBHOOK environment variable');
        throw new Error('Webhook URL is not configured correctly');
      }

      const payload = { 
        question: questionToAsk,
        language: 'de'
      };
      console.log('Sending payload:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': typeof window !== 'undefined' ? window.location.origin : ''
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
      <div className="relative w-full h-full flex flex-col items-center pt-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-[#D09467]"
        >
          Frag unsere LIBRA <span className="text-[#EBDBC3]">AI</span>
        </motion.h2>

        <div className="flex flex-col items-center w-full space-y-8 px-4">
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
              onFocus={() => handleFocusChange(true)}
              onBlur={() => handleFocusChange(false)}
            />
          </motion.div>

          {/* Loading and Response Container */}
          <AnimatePresence mode="wait">
            {(isFocused || isLoading || response) && (
              <motion.div
                key={isLoading ? 'loading' : 'response'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-2xl bg-black/30 backdrop-blur-md rounded-xl p-6 min-h-[150px] flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-[#D09467] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#D09467] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#D09467] rounded-full animate-bounce"></div>
                  </div>
                ) : response ? (
                  <div className="text-[#EBDBC3] whitespace-pre-wrap">{response}</div>
                ) : (
                  <div className="text-[#EBDBC3]/70 text-center">
                    <p>{t('ai_faq_placeholder')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
