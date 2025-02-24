import { motion, useAnimate } from "framer-motion";
import { Button } from "@tremor/react";
import { IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import hooks from '@/data/apply-hooks.json';

interface ApplyNowSectionProps {
  onApply: () => void;
  variant?: 'default' | 'compact';
  subtitle?: string;
}

export function ApplyNowSection({ 
  onApply, 
  variant = 'default',
  subtitle
}: ApplyNowSectionProps) {
  const isCompact = variant === 'compact';
  const [hook, setHook] = useState(hooks.hooks[0]);
  const [scope, animate] = useAnimate();
  
  // Change hook with fade animation
  useEffect(() => {
    const randomHook = hooks.hooks[Math.floor(Math.random() * hooks.hooks.length)];
    setHook(randomHook);
  }, []);

  return (
    <div className={`${isCompact ? 'py-8' : 'py-12'} px-6 sm:px-8`}>
      <motion.div
        ref={scope}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className={`
          relative mx-auto max-w-4xl rounded-3xl overflow-hidden
          bg-gradient-to-br from-[#2E4555] to-[#1a2831]
          shadow-[0_8px_32px_rgba(0,0,0,0.2)]
        `}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:16px] contrast-50 opacity-10" />
        
        <div className="relative px-8 py-12 sm:px-12">
          <div className="text-center">
            <motion.div
              className={`space-y-${isCompact ? '4' : '6'}`}
            >
              <span className="inline-block text-[#D09467] font-medium text-lg">
                Join LibraLab
              </span>
              <div>
                <h2 className={`text-${isCompact ? '2xl' : '3xl'} font-bold text-white mb-2`}>
                  {hook.question}
                </h2>
                <p className="text-[#979C94] text-lg">
                  {subtitle || hook.subtitle}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  onClick={onApply}
                  className={`
                    group relative bg-[#D09467] hover:bg-[#D09467]/90 text-white 
                    ${isCompact ? 'px-8 py-4' : 'px-10 py-5'} 
                    text-lg rounded-xl transition-all duration-300 
                    shadow-[0_0_20px_rgba(208,148,103,0.3)] 
                    hover:shadow-[0_0_30px_rgba(208,148,103,0.5)]
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                    Apply Now
                    <IconArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
