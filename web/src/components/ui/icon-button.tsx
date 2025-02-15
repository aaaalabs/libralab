import { motion } from "framer-motion";
import { ReactNode } from "react";

interface IconButtonProps {
  icon: ReactNode;
  href?: string;
}

export const IconButton = ({ icon, href }: IconButtonProps) => {
  const Button = (
    <motion.button
      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center
        hover:bg-white/20 transition-colors text-white"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
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
