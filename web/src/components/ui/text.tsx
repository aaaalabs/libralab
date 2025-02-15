import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TextProps {
  children: ReactNode;
  className?: string;
}

export const Text = ({ children, className }: TextProps) => {
  return (
    <p className={cn(
      "text-gray-600",
      className
    )}>
      {children}
    </p>
  );
};
