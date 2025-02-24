'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { IconX } from '@tabler/icons-react';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CONTACT_WEBHOOK!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact_form',
          timestamp: new Date().toISOString(),
          authorization: process.env.NEXT_PUBLIC_WEBHOOK_TOKEN,
          data: formData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.thanks) {
          setResponseMessage(data.thanks);
        } else {
          setResponseMessage("Thank you for your message! We'll get back to you soon. 🙌");
        }
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setResponseMessage("Thank you for your message! We'll get back to you soon. 🙌");
        } else {
          toast({
            title: "Error sending message",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <IconX size={24} />
        </button>

        <div className="bg-[#2E4555] rounded-xl shadow-xl p-6">
          <h1 className="text-3xl font-bold mb-2 text-white">Contact Us</h1>
          <p className="text-gray-300 mb-6">Have a question? We'd love to hear from you.</p>

          {responseMessage ? (
            <div className="text-center py-8">
              <p className="text-lg text-white mb-6">{responseMessage}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#D09467] text-white rounded-lg hover:bg-[#D09467]/90 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  required
                  rows={4}
                  className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white placeholder-white/50 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-[#D09467] text-white rounded-lg hover:bg-[#D09467]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  );
}
