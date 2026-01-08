'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedSequence } from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function SuccessCases() {
  const t = useTranslations('successCases');

  const cases = [
    {
      id: 1,
      assetType: t('cases.case1.assetType'),
      initialInvestment: t('cases.case1.initialInvestment'),
      time: t('cases.case1.time'),
      exitPrice: t('cases.case1.exitPrice'),
      roi: t('cases.case1.roi'),
      operationType: t('cases.case1.operationType'),
      projectName: t('cases.case1.projectName'),
      description: t('cases.case1.description'),
      mapImage: '/png/Success.png',
    },
    {
      id: 2,
      assetType: t('cases.case2.assetType'),
      initialInvestment: t('cases.case2.initialInvestment'),
      time: t('cases.case2.time'),
      exitPrice: t('cases.case2.exitPrice'),
      roi: t('cases.case2.roi'),
      operationType: t('cases.case2.operationType'),
      projectName: t('cases.case2.projectName'),
      description: t('cases.case2.description'),
      mapImage: '/png/Success1.png',
    },
    {
      id: 3,
      assetType: t('cases.case3.assetType'),
      initialInvestment: t('cases.case3.initialInvestment'),
      time: t('cases.case3.time'),
      exitPrice: t('cases.case3.exitPrice'),
      roi: t('cases.case3.roi'),
      operationType: t('cases.case3.operationType'),
      projectName: t('cases.case3.projectName'),
      description: t('cases.case3.description'),
      mapImage: '/png/Success2.png',
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden w-full min-w-full">
      <div className="absolute inset-0 w-full">
        <Image
          src="/jpg/21.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/20"></div>
      </div>

      <div
        id="casos-de-exito"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <AnimatedSequence
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          animation="fadeInUp"
          baseDelay={0.4}
          delayIncrement={0.2}
        >
          {cases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="h-full rounded-none border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden backdrop-blur-sm flex flex-col p-0"
              style={{ backgroundColor: 'rgba(230, 226, 215, 0.85)' }}
            >
              {/* <div
                className="relative h-64 w-full overflow-hidden flex-shrink-0"
                style={{ width: '100%', margin: 0 }}
              >
                <Image
                  src={caseItem.mapImage}
                  alt={`Mapa del proyecto ${caseItem.projectName}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5">
                    <span className="text-sm font-medium text-althara-black">
                      {String(caseItem.id).padStart(2, '0')}/03
                    </span>
                  </div>
                </div>
              </div> */}

              <CardContent className="p-8 flex flex-col flex-grow">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-normal text-althara-black">
                      {caseItem.roi}
                    </span>
                    <span
                      className="text-xs font-medium uppercase tracking-[0.2em]"
                      style={{ color: '#95A1B8' }}
                    >
                      {t('labels.roi')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-althara-black mb-2">
                    {caseItem.projectName}
                  </h3>
                  <p
                    className="text-sm font-light leading-relaxed"
                    style={{ color: '#555555' }}
                  >
                    {caseItem.description}
                  </p>
                </div>

                <div className="space-y-4 mt-auto pt-6 border-t border-althara-dark-blue/10">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs font-medium uppercase tracking-[0.2em]"
                      style={{ color: '#95A1B8' }}
                    >
                      {t('labels.initialInvestment')}
                    </span>
                    <span className="text-sm font-medium text-althara-black">
                      {caseItem.initialInvestment}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs font-medium uppercase tracking-[0.2em]"
                      style={{ color: '#95A1B8' }}
                    >
                      {t('labels.exitPrice')}
                    </span>
                    <span className="text-sm font-medium text-althara-black">
                      {caseItem.exitPrice}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs font-medium uppercase tracking-[0.2em]"
                      style={{ color: '#95A1B8' }}
                    >
                      {t('labels.time')}
                    </span>
                    <span className="text-sm font-medium text-althara-black">
                      {caseItem.time}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-althara-dark-blue/10">
                    <span
                      className="text-xs font-light uppercase tracking-[0.1em]"
                      style={{ color: '#666666' }}
                    >
                      {caseItem.assetType}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </AnimatedSequence>
      </div>
    </section>
  );
}
