import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/TranslationContext';
import type { EarlyBirdCampaign } from '@/types/epicwg';

interface CheckoutFlowProps {
  campaign: EarlyBirdCampaign;
  selectedTier: string;
  selectedUpsells: string[];
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  campaign,
  selectedTier,
  selectedUpsells,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const tier = campaign.tiers.find((t) => t.id === selectedTier)!;
  const upsells = campaign.upsells.filter((u) => selectedUpsells.includes(u.id));

  const totalMonthly = tier.price + upsells.reduce((sum, u) => sum + u.price, 0);
  const deposit = tier.deposit;

  const handleSubmit = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onComplete({
      tierId: selectedTier,
      upsellIds: selectedUpsells,
      total: totalMonthly,
      deposit,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4"
      >
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Review Your Selection</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{tier.title}</h3>
                    <p className="text-sm text-gray-600">
                      {tier.description}
                    </p>
                  </div>
                  <span className="font-bold">€{tier.price}/mo</span>
                </div>
                {upsells.map((upsell) => (
                  <div
                    key={upsell.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{upsell.title}</h3>
                      <p className="text-sm text-gray-600">
                        {upsell.perks.join(', ')}
                      </p>
                    </div>
                    <span className="font-bold">€{upsell.price}/mo</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Confirm Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Monthly Payment</h3>
                  <div className="flex justify-between text-lg">
                    <span>Total</span>
                    <span className="font-bold">€{totalMonthly}/mo</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Includes {tier.discount}% early-bird discount
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Refundable Deposit</h3>
                  <div className="flex justify-between text-lg">
                    <span>Deposit Amount</span>
                    <span className="font-bold">€{deposit}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Fully refundable after your stay
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Complete Reservation</h2>
              <div className="space-y-4">
                <div className="p-6 border-2 border-blue-200 rounded-lg text-center">
                  <h3 className="font-semibold mb-4">
                    {t('confirm_reservation')}
                  </h3>
                  <p className="text-gray-600">
                    {t('confirm_reservation_description', {
                      tier: tier.title,
                      deposit: deposit.toString(),
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
            disabled={processing}
          >
            {step === 1 ? t('cancel') : 'Back'}
          </button>
          <button
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
            disabled={processing}
            className={`px-6 py-2 rounded-lg font-semibold ${
              processing
                ? 'bg-gray-200'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {processing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t('processing')}
              </span>
            ) : step === 3 ? (
              'Complete Reservation'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
