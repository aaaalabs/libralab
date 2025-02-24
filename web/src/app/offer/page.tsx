'use client';

import { useState } from 'react';
import { FoundersEliteCard } from '@/components/FoundersEliteCard';
import { FeatureSection } from '@/components/features/FeatureSection';
import { features } from '@/data/features';
import { Footer } from '@/components/layout/Footer';
import { TopNav } from '@/components/navigation/TopNav';
import { ApplicationForm } from '@/components/application/ApplicationForm';

export default function OfferPage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="pt-24 pb-16 px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <FoundersEliteCard onApply={() => setShowApplicationForm(true)} />
            </div>
            <div>
              <FeatureSection 
                title="Why Join LibraLab?"
                description="Experience the perfect blend of tech innovation and community"
                groups={[
                  {
                    title: "Community Features",
                    features: features
                  }
                ]}
                onApply={() => setShowApplicationForm(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      <ApplicationForm 
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
      />
      
      <Footer />
    </div>
  );
}
