'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className={cn(
              "bg-[#2E4555] border-[#D09467]",
              props.variant === 'destructive' && "bg-[#D09467] border-[#D09467]"
            )}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-[#EBDBC3] font-medium">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-[#EBDBC3]/90">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-[#EBDBC3] hover:text-[#EBDBC3]/80" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
