import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface IconButtonProps {
  icon: ReactNode;
  href?: string;
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const IconButton = ({ 
  icon, 
  href, 
  variant = 'default', 
  size = 'md', 
  onClick,
  className 
}: IconButtonProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'bg-white/10 hover:bg-white/20 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
  };

  const Button = (
    <motion.button
      className={cn(
        "rounded-full backdrop-blur-sm flex items-center justify-center transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {icon}
    </motion.button>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {Button}
      </a>
    );
  }

  return Button;
};
