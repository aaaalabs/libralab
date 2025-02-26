"use client";

import React, { useState } from "react";
import { FlipWords } from "../ui/flip-words";
import { motion } from "framer-motion";
import { VideoBackground } from "../ui/video-background";
import { useTranslation } from "@/context/TranslationContext";
import { ApplicationForm } from "../application/ApplicationForm";

export function AnimatedHero() {
  const { t, currentLanguage } = useTranslation();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  const words = currentLanguage === 'en' 
    ? ["workspace", "apartment", "rental", "coliving"]
    : ["Arbeitsplatz", "Apartment", "Mietobjekt", "Coliving"];

  return (
    <div className="relative h-screen overflow-x-hidden">
      <VideoBackground
        sources={['/videos/scenic/alps-sunset.mp4']}
        gradient={true}
      />
      
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-4xl">
          {/* Main Heading with Flip Animation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight"
          >
            <span className="text-[#EBDBC3] block">{t('hero.more_than_a')} </span>
            <FlipWords 
              words={words} 
              className="text-white drop-shadow-lg"
              duration={4000}
            />
          </motion.div>

          {/* Subheading with staggered animation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <p className="text-xl md:text-2xl text-[#979C94]">
              {t('hero.forget_hostels')}
            </p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="text-xl md:text-2xl text-[#E1B588] font-medium"
            >
              {t('hero.join_community')}
              <br className="hidden md:block" />
              <span className="text-[#EBDBC3]">{t('hero.in_alps')}</span>
            </motion.p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-12 flex gap-4 justify-center"
          >
            <button
              onClick={() => setShowApplicationForm(true)}
              className="group relative inline-flex items-center px-8 py-4 text-lg font-medium overflow-hidden rounded-full border-2 border-[#D09467] transition-all duration-300"
              style={{
                backgroundColor: 'rgba(208, 148, 103, 0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {/* Glass effect overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    backgroundColor: 'rgba(208, 148, 103, 0.15)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#D09467]/20 to-[#E1B588]/20" />
              </div>
              
              {/* Button content */}
              <span className="relative z-10 text-[#D09467] group-hover:text-[#EBDBC3] transition-colors duration-300 flex items-center font-semibold">
                {t('hero.apply_now')}
                <svg 
                  className="ml-2 -mr-1 w-5 h-5 inline-block transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Application Form */}
      <ApplicationForm 
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
      />
    </div>
  );
}
