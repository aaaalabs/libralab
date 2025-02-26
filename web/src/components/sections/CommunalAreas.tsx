import { IconDeviceLaptop, IconCoffee, IconBath, IconStairs } from '@tabler/icons-react';

interface CommunalAreasProps {
  t: any; // Translation function
}

/**
 * Communal Areas section showing shared spaces in the building
 */
export function CommunalAreas({ t }: CommunalAreasProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-[#D09467] mb-8 text-center">
        {t('communal_areas.title')}
      </h2>
      <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
        {t('communal_areas.description')}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coworking Space */}
        <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
          <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
            <IconDeviceLaptop className="w-6 h-6 text-[#D09467]" />
            {t('communal_areas.coworking.title')}
          </h3>
          <p className="text-[#979C94] mb-4">
            {t('communal_areas.coworking.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.coworking.features.access')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.coworking.features.wifi')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.coworking.features.coffee')}
            </span>
          </div>
        </div>
        
        {/* Community Kitchen */}
        <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
          <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
            <IconCoffee className="w-6 h-6 text-[#D09467]" />
            {t('communal_areas.kitchen.title')}
          </h3>
          <p className="text-[#979C94] mb-4">
            {t('communal_areas.kitchen.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.kitchen.features.equipment')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.kitchen.features.events')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.kitchen.features.storage')}
            </span>
          </div>
        </div>
        
        {/* Ground Floor Bathrooms */}
        <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
          <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
            <IconBath className="w-6 h-6 text-[#D09467]" />
            {t('communal_areas.bathrooms.title')}
          </h3>
          <p className="text-[#979C94] mb-4">
            {t('communal_areas.bathrooms.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.bathrooms.features.modern')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.bathrooms.features.cleaned')}
            </span>
          </div>
        </div>
        
        {/* Basement & Garden */}
        <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#EBDBC3]/30">
          <h3 className="text-xl font-semibold text-[#2E4555] mb-3 flex items-center gap-2">
            <IconStairs className="w-6 h-6 text-[#D09467]" />
            {t('communal_areas.basement.title')}
          </h3>
          <p className="text-[#979C94] mb-4">
            {t('communal_areas.basement.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.basement.features.storage')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.basement.features.garden')}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[#2E4555]/5 text-[#2E4555] font-medium">
              {t('communal_areas.basement.features.bike')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
