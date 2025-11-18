/**
 * Esempio di integrazione con API Cloudflare D1
 * Questo file mostra come modificare Collezione.tsx per usare le API
 * mantenendo i dati hardcoded come fallback
 */

import React, { useState, useRef, useEffect } from 'react';
import { useContentData } from '../hooks/useContentData';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ... altri import ...

const CollezioneWithAPI: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Usa l'hook per ottenere i dati dal database
  const { collections, exhibitions, critics, loading: apiLoading, error: apiError } = useContentData();

  // Stati locali esistenti
  const [selectedMostra, setSelectedMostra] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostreVisibili, setMostreVisibili] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  // Usa i dati dal database se disponibili, altrimenti usa i dati hardcoded
  const mostreData = exhibitions.length > 0 ? exhibitions : [
    // Dati hardcoded di fallback (gli stessi che sono nel componente attuale)
    {
      id: 'cenerentola',
      title: 'CENERENTOLA',
      subtitle: 'Personale di Adele Lo Feudo',
      location: 'Palazzo delle Prigioni Vecchie, Perugia',
      date: '23 Novembre 2024',
      description: 'Il significato del dipinto di Adele Lo Feudo risiede nel celebrare e promuovere l\'immaginazione come risorsa indispensabile del sentire intimo.',
      info: 'Fino al 23 novembre 2024, dalle ore 17:30 alle ore 19:30 tutti i giorni, mattina su appuntamento. Escluso il lunedì. Chiusa il 1 novembre.'
    },
    // ... altri dati hardcoded ...
  ];

  // Formatta la data per le mostre
  const formatDataMostra = (data: string) => {
    // La tua logica esistente per formattare la data
    // ...
  };

  // Ordina le mostre cronologicamente
  const mostreOrdinate = [...mostreData].sort((a, b) => {
    // Usa la tua logica esistente per ordinare
    // ...
  });

  // Gestisci lo stato di caricamento
  useEffect(() => {
    // Combina apiLoading con il tuo loading esistente
    setIsLoading(apiLoading);
  }, [apiLoading]);

  // Se c'è un errore API, mostra un messaggio ma continua con i dati hardcoded
  useEffect(() => {
    if (apiError) {
      console.warn('API Error, using fallback data:', apiError);
    }
  }, [apiError]);

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-background">
          {/* Il tuo loading screen esistente */}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        {/* Il tuo hero esistente */}
      </section>

      {/* Collection Section - Usa i dati dal database */}
      <section id="collection" className="py-20 px-6">
        <div className="w-full">
          <h2 className="text-[42px] font-bold text-accent uppercase mb-8">Collezioni</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              >
                <Link to={`/collezione/${collection.slug}`} className="group cursor-pointer block">
                  <div className="flex flex-col gap-1 mb-4">
                    <h4 className="font-body text-[16px] font-bold text-white uppercase">{collection.title}</h4>
                    <p className="font-body text-[14px] text-white/60">
                      {collection.description}
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-[12px] overflow-hidden">
                    <div className="aspect-[3/2]">
                      <img
                        alt={collection.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={collection.image_url}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mostre Section - Usa i dati dal database */}
      <section id="mostre" className="py-20 px-6">
        <div className="w-full">
          <h2 className="text-[42px] font-bold text-accent uppercase mb-8">Mostre</h2>

          <div className="border-t border-white/20">
            {mostreOrdinate.slice(0, mostreVisibili).map((mostra, index) => (
              <div
                key={mostra.slug || mostra.id}
                className="mostra-item border-b border-white/20 py-8 flex items-center justify-between gap-8 cursor-pointer hover:bg-white/[0.035] transition-all"
                onClick={() => openMostraModal(mostra)}
              >
                <div className="flex-1 m-0 flex flex-col justify-center">
                  <p className="m-0 text-white font-body text-[18px] font-bold uppercase mb-2">{mostra.title}</p>
                  <p className="m-0 text-white/60 font-body text-[16px] font-normal">{mostra.subtitle}</p>
                </div>
                <div className="flex flex-col items-end text-right">
                  <p className="m-0 text-white font-body text-[16px] font-normal">{mostra.location}</p>
                  <p className="m-0 text-white/60 font-body text-[14px] font-normal mt-1">{formatDataMostra(mostra.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Critics Section */}
      {/*
        Per i critici, puoi continuare a usare i dati dal file translations.ts
        oppure integrare con i dati dal database quando disponibili
      */}
      <section id="bio" className="py-20 md:px-6">
        <div className="w-full">
          <h2 className="text-[42px] font-bold text-accent uppercase mb-8">
            {t('critique')}
          </h2>

          {critics.length > 0 ? (
            // Usa i dati dal database
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {critics.map((critic) => (
                <TestoCriticoItem
                  key={critic.id}
                  nome={critic.name}
                  ruolo={critic.role}
                  testo={critic.text || ''}
                  onClick={() => openCriticoModal(critic)}
                />
              ))}
            </div>
          ) : (
            // Usa i dati dal file translations come fallback
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* I tuoi critici hardcoded esistenti */}
            </div>
          )}
        </div>
      </section>

      {/* Altri componenti e modal... */}
    </div>
  );
};

export default CollezioneWithAPI;