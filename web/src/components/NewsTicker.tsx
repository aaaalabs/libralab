"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/TranslationContext';
import { IconClock, IconRefresh, IconInfoCircle, IconArrowRight, IconNews, IconX, IconBell } from '@tabler/icons-react';
import Image from 'next/image';

// News interface based on the Webhook response
interface NewsItem {
  id: string;
  date: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface NewsResponse {
  news: NewsItem[];
  lastUpdated: string;
}

// Storage keys for sessionStorage
const NEWS_STORAGE_KEY = 'libralab_news_data';
const LAST_UPDATED_KEY = 'libralab_news_last_updated';
const LAST_REFRESH_DATE_KEY = 'libralab_news_last_refresh_date';

export function NewsTicker() {
  const { t, currentLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasNewToday, setHasNewToday] = useState(false);

  // Fetch news data
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get webhook URL from env
      const webhookUrl = process.env.NEXT_PUBLIC_AI_FAQ_WEBHOOK?.trim();
      
      if (!webhookUrl) {
        console.error('Invalid NEXT_PUBLIC_AI_FAQ_WEBHOOK environment variable');
        throw new Error('Webhook URL is not configured');
      }
      
      const payload = { source: "news" };

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NewsResponse = await response.json();
      
      if (!data.news || !Array.isArray(data.news)) {
        throw new Error('Invalid news data in response');
      }
      
      // Sort by date (newest first)
      const sortedNews = [...data.news].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Save to state
      setNews(sortedNews);
      const updatedTime = data.lastUpdated || new Date().toISOString();
      setLastUpdated(updatedTime);
      
      // Check if there are news from today
      checkForTodayNews(sortedNews);
      
      // Save to session storage
      try {
        sessionStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(sortedNews));
        sessionStorage.setItem(LAST_UPDATED_KEY, updatedTime);
        
        // Update last refresh date
        const today = new Date().toISOString().split('T')[0];
        sessionStorage.setItem(LAST_REFRESH_DATE_KEY, today);
      } catch (error) {
        console.error('Error saving news to session storage:', error);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(currentLanguage === 'de' ? 
        'Fehler beim Laden der News. Bitte versuchen Sie es später erneut.' : 
        'Error loading news. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load data from session storage or fetch if needed
  useEffect(() => {
    const shouldRefreshToday = () => {
      // Check if we've already refreshed today
      const lastRefreshDate = sessionStorage.getItem(LAST_REFRESH_DATE_KEY);
      if (!lastRefreshDate) return true; // Never refreshed
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // If the last refresh was not today, we should refresh
      return lastRefreshDate !== today;
    };
    
    const loadNewsFromSessionStorage = () => {
      try {
        // Try to get news data from sessionStorage
        const storedNewsData = sessionStorage.getItem(NEWS_STORAGE_KEY);
        const storedLastUpdated = sessionStorage.getItem(LAST_UPDATED_KEY);
        
        if (storedNewsData && storedLastUpdated) {
          const parsedNews = JSON.parse(storedNewsData) as NewsItem[];
          setNews(parsedNews);
          setLastUpdated(storedLastUpdated);
          
          // Check for today's news in stored data
          checkForTodayNews(parsedNews);
          
          return true; // Successfully loaded from session
        }
        return false; // No data in session
      } catch (error) {
        console.error('Error loading news from session storage:', error);
        return false; // Error in session loading
      }
    };

    // Initial load - check session first, then decide whether to refresh
    const hasSessionData = loadNewsFromSessionStorage();
    
    // If we haven't refreshed today or have no data, fetch new data
    if (!hasSessionData || shouldRefreshToday()) {
      setIsLoading(true);
      fetchNews();
      
      // Mark that we've refreshed today
      const today = new Date().toISOString().split('T')[0];
      sessionStorage.setItem(LAST_REFRESH_DATE_KEY, today);
    }
  }, []);

  // Check if there are news from today
  const checkForTodayNews = (newsItems: NewsItem[]) => {
    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];
    
    // Check if any news item has today's date
    const hasTodayNews = newsItems.some(item => {
      const newsDate = new Date(item.date).toISOString().split('T')[0];
      return newsDate === today;
    });
    
    setHasNewToday(hasTodayNews);
  };
  
  // Format date based on current language
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        currentLanguage === 'de' ? 'de-DE' : 'en-US', 
        { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full shadow-lg flex items-center justify-center transition-all ${isOpen ? 'bg-[#2E4555] text-white' : 'bg-[#D09467] text-white'} relative`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: hasNewToday && !isOpen ? [1, 1.05, 1] : 1, 
          opacity: 1,
          transition: {
            scale: hasNewToday && !isOpen ? {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5
            } : {}
          }
        }}
        style={{ width: '56px', height: '56px' }}
      >
        {isOpen ? <IconX size={24} /> : <IconBell size={24} />}
        {hasNewToday && !isOpen && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
        )}
      </motion.button>
      
      {/* News Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl mt-4 w-full max-w-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#2E4555] p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <IconInfoCircle className="text-[#D09467] w-5 h-5" />
                  <h3 className="font-medium">
                    {currentLanguage === 'de' ? 'Aktuelle Updates' : 'Latest Updates'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchNews();
                    }} 
                    className="text-[#D09467] hover:text-[#D09467]/80 transition-colors"
                    disabled={isLoading}
                  >
                    <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }} 
                    className="text-[#D09467] hover:text-[#D09467]/80 transition-colors flex items-center gap-1 text-sm"
                  >
                    {expanded ? 
                      (currentLanguage === 'de' ? 'Weniger' : 'Less') : 
                      (currentLanguage === 'de' ? 'Mehr' : 'More')
                    }
                    <IconArrowRight className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
              {lastUpdated && (
                <div className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                  <IconClock className="w-3 h-3" />
                  {currentLanguage === 'de' ? 'Aktualisiert' : 'Updated'}: {formatDate(lastUpdated)}
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className={`p-4 ${expanded ? 'max-h-96' : 'max-h-80'} overflow-y-auto transition-all duration-300`}>
              {/* Error message */}
              {error && (
                <div className="text-red-500 text-sm py-2 rounded-lg bg-red-50 px-3">{error}</div>
              )}
              
              {/* Loading state */}
              {isLoading && !news.length && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#D09467] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#D09467] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#D09467] rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              
              {/* Empty state with friendly message */}
              {!isLoading && news.length === 0 && !error && (
                <div className="text-center py-8 px-4">
                  <div className="text-[#D09467] mb-3">
                    <IconNews className="w-12 h-12 mx-auto opacity-20" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    {currentLanguage === 'de' ? 
                      'Aktuell keine neuen Updates' : 
                      'No new updates at this time'
                    }
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {currentLanguage === 'de' ? 
                      'Schau später noch einmal vorbei!' : 
                      'Check back again later!'
                    }
                  </p>
                </div>
              )}
              
              {/* News items */}
              {news.length > 0 && (
                <div className="space-y-4">
                  {news.slice(0, expanded ? undefined : 2).map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-3">
                        {item.imageUrl && (
                          <div className="flex-shrink-0">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden">
                              <Image 
                                src={item.imageUrl} 
                                alt={item.imageAlt || "News image"} 
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">{formatDate(item.date)}</div>
                          <div className="text-sm text-[#2E4555]">{item.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
