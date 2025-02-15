"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TierSlots } from '@/lib/db';

interface CampaignContextType {
  currentAmount: number;
  addDeposit: (tierId: string, amount: number) => Promise<boolean>;
  isLoading: boolean;
  tierSlots: TierSlots[];
  refreshData: () => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [currentAmount, setCurrentAmount] = useState(400);
  const [isLoading, setIsLoading] = useState(true);
  const [tierSlots, setTierSlots] = useState<TierSlots[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [amountResponse, slotsResponse] = await Promise.all([
        fetch('/api/campaign/deposit'),
        fetch('/api/campaign/slots')
      ]);

      const [amountData, slotsData] = await Promise.all([
        amountResponse.json(),
        slotsResponse.json()
      ]);

      if (amountData.currentAmount) {
        setCurrentAmount(amountData.currentAmount);
      }
      if (slotsData.slots) {
        setTierSlots(slotsData.slots);
      }
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addDeposit = async (tierId: string, amount: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/campaign/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tierId, amount }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process deposit');
      }

      // Refresh data after successful deposit
      await fetchData();
      return true;
    } catch (error) {
      console.error('Failed to add deposit:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CampaignContext.Provider value={{ currentAmount, addDeposit, isLoading, tierSlots, refreshData: fetchData }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
