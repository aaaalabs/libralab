import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/TranslationContext';
import { IconWorld, IconCheck, IconLoader2 } from '@tabler/icons-react';

const languages = [
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
] as const;

export function LanguagePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const { currentLanguage, setLanguage, isLoading } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (code: typeof languages[number]['code']) => {
    console.log('Language picker: changing language to', code);
    setIsChanging(true);
    try {
      await setLanguage(code);
      console.log('Language picker: language change successful');
    } catch (error) {
      console.error('Language picker: failed to change language:', error);
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 
          transition-colors duration-200 text-white backdrop-blur-sm disabled:opacity-50"
      >
        <IconWorld size={20} />
        <span>{currentLang.label}</span>
        {isChanging && <IconLoader2 className="animate-spin" size={16} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden min-w-[160px]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={lang.code === currentLanguage || isChanging}
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 
                  disabled:opacity-50 disabled:hover:bg-white"
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === currentLanguage && <IconCheck size={16} className="ml-auto text-green-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
