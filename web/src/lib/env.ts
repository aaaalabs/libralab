declare global {
  interface Window {
    ENV?: {
      NEXT_PUBLIC_APPLICATION_WEBHOOK?: string;
      NEXT_PUBLIC_AI_FAQ_WEBHOOK?: string;
      // Add other public env vars here
    };
  }
}

// Initialize window.ENV
if (typeof window !== 'undefined') {
  window.ENV = {
    NEXT_PUBLIC_APPLICATION_WEBHOOK: process.env.NEXT_PUBLIC_APPLICATION_WEBHOOK,
    NEXT_PUBLIC_AI_FAQ_WEBHOOK: process.env.NEXT_PUBLIC_AI_FAQ_WEBHOOK,
  };
}

export {};
