"use client";

import { useTranslation } from "@/context/TranslationContext";
import { motion } from "framer-motion";

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useTranslation();

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => setLanguage("en")}
        className={`text-sm transition-all duration-200 ${
          currentLanguage === "en"
            ? "text-[#D09467] font-bold"
            : "text-[#979C94] hover:text-[#D09467]"
        }`}
      >
        EN
      </button>
      <span className="text-[#979C94]">/</span>
      <button
        onClick={() => setLanguage("de")}
        className={`text-sm transition-all duration-200 ${
          currentLanguage === "de"
            ? "text-[#D09467] font-bold"
            : "text-[#979C94] hover:text-[#D09467]"
        }`}
      >
        DE
      </button>
    </div>
  );
}
