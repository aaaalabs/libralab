'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Room } from '../../types/room';
import { IconX } from '@tabler/icons-react';
import confetti from 'canvas-confetti';

interface ApplicationModalProps {
  room: Room;
  onClose: () => void;
  isOpen: boolean;
}

export function ApplicationModal({ room, onClose, isOpen }: ApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    moveInDate: '',
    // Libralab-spezifische Felder
    projectInterest: '',
    communityContribution: '',
    skillsAndInterests: '',
    sustainabilityCommitment: '',
    expectedStayDuration: '',
    previousCommunityExperience: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Hier würde normalerweise die API-Anfrage erfolgen
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(onClose, 1500);
    }
  };

  const steps = [
    {
      title: "Persönliche Informationen",
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'E-Mail', type: 'email', required: true },
        { name: 'phone', label: 'Telefon', type: 'tel', required: true },
        { name: 'occupation', label: 'Aktuelle Beschäftigung', type: 'text', required: true }
      ]
    },
    {
      title: "Projekt & Gemeinschaft",
      fields: [
        { 
          name: 'projectInterest', 
          label: 'Was interessiert dich am Libralab Wohnprojekt?', 
          type: 'textarea', 
          required: true 
        },
        { 
          name: 'communityContribution', 
          label: 'Wie möchtest du dich in die Gemeinschaft einbringen?', 
          type: 'textarea', 
          required: true 
        },
        { 
          name: 'skillsAndInterests', 
          label: 'Welche Fähigkeiten und Interessen bringst du mit?', 
          type: 'textarea', 
          required: true 
        }
      ]
    },
    {
      title: "Nachhaltigkeit & Zukunft",
      fields: [
        { 
          name: 'sustainabilityCommitment', 
          label: 'Wie stehst du zu nachhaltigem Leben und Wirtschaften?', 
          type: 'textarea', 
          required: true 
        },
        { 
          name: 'expectedStayDuration', 
          label: 'Wie lange planst du im Projekt zu bleiben?', 
          type: 'select', 
          options: [
            '6-12 Monate',
            '1-2 Jahre',
            '2-3 Jahre',
            'Länger als 3 Jahre'
          ],
          required: true 
        },
        { 
          name: 'previousCommunityExperience', 
          label: 'Hast du bereits Erfahrungen mit gemeinschaftlichem Wohnen?', 
          type: 'textarea', 
          required: true 
        }
      ]
    }
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>

          <Dialog.Title
            as="h3"
            className="text-2xl font-bold leading-6 text-gray-900 mb-8"
          >
            {steps[step - 1].title}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            {steps[step - 1].fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Bitte wählen</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Zurück
                </button>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {step === 3 ? 'Bewerbung absenden' : 'Weiter'}
              </button>
            </div>
          </form>

          {/* Progress Indicator */}
          <div className="mt-8 flex gap-2 justify-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full ${
                  s === step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
