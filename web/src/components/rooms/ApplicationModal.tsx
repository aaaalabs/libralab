import React, { useState, useEffect, ReactElement } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { ApplicationForm } from '../application/ApplicationForm';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: {
    id: string;
    title: string;
    size: number;
    price: number;
    deposit: number;
    floor: string;
    roomNumber: number;
    amenities: string[];
    available: boolean;
    availableFrom: string;
    images: string[];
    rating: number;
    costRating: number;
    features: string[];
  };
}

export function ApplicationModal({ isOpen, onClose, room }: ApplicationModalProps): ReactElement {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    moveInDate: '',
    duration: '6',
    budget: room?.price.toString() || '',
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center">
            <Dialog.Overlay
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <IconX size={20} />
              </button>

              <Dialog.Title className="text-2xl font-bold text-[#2E4555]">
                Apply for {room?.title}
              </Dialog.Title>

              <div className="mt-8">
                <ApplicationForm 
                  onSubmit={handleSubmit}
                  formData={formData}
                  setFormData={setFormData}
                  room={room}
                />
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
